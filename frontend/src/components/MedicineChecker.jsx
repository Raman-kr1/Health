import React, { useState, useEffect } from 'react';
import { healthAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';

function MedicineChecker() {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({
    medicine_name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: ''
  });
  const [interactionResult, setInteractionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const response = await healthAPI.getMedicines();
      setMedicines(response.data);
    } catch (error) {
      toast.error('Failed to load medicines');
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await healthAPI.addMedicine({
        ...newMedicine,
        start_date: new Date(newMedicine.start_date).toISOString(),
        end_date: newMedicine.end_date ? new Date(newMedicine.end_date).toISOString() : null
      });
      toast.success('Medicine added successfully');
      setNewMedicine({
        medicine_name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: ''
      });
      loadMedicines();
    } catch (error) {
      toast.error('Failed to add medicine');
    }
  };

  const handleCheckInteractions = async () => {
    if (selectedMedicines.length < 2) {
      toast.error('Please select at least 2 medicines to check interactions');
      return;
    }

    setLoading(true);
    try {
      const response = await chatAPI.checkMedicineInteractions(selectedMedicines);
      setInteractionResult(response.data.interaction_analysis);
    } catch (error) {
      toast.error('Failed to check interactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-checker">
      <h2>Medicine Management</h2>
      
      <div className="medicine-form">
        <h3>Add New Medicine</h3>
        <form onSubmit={handleAddMedicine}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Medicine Name"
              value={newMedicine.medicine_name}
              onChange={(e) => setNewMedicine({...newMedicine, medicine_name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 500mg)"
              value={newMedicine.dosage}
              onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Frequency (e.g., Twice daily)"
              value={newMedicine.frequency}
              onChange={(e) => setNewMedicine({...newMedicine, frequency: e.target.value})}
              required
            />
            <input
              type="date"
              placeholder="Start Date"
              value={newMedicine.start_date}
              onChange={(e) => setNewMedicine({...newMedicine, start_date: e.target.value})}
              required
            />
            <input
              type="date"
              placeholder="End Date (optional)"
              value={newMedicine.end_date}
              onChange={(e) => setNewMedicine({...newMedicine, end_date: e.target.value})}
            />
          </div>
          <button type="submit">Add Medicine</button>
        </form>
      </div>

      <div className="current-medicines">
        <h3>Current Medicines</h3>
        <div className="medicine-list">
          {medicines.map((med) => (
            <div key={med.id} className="medicine-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedMedicines.includes(med.medicine_name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMedicines([...selectedMedicines, med.medicine_name]);
                    } else {
                      setSelectedMedicines(selectedMedicines.filter(m => m !== med.medicine_name));
                    }
                  }}
                />
                <div>
                  <strong>{med.medicine_name}</strong>
                  <span>{med.dosage} - {med.frequency}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="interaction-checker">
        <button 
          onClick={handleCheckInteractions} 
          disabled={loading || selectedMedicines.length < 2}
          className="check-btn"
        >
          {loading ? 'Checking...' : 'Check Interactions'}
        </button>
        
        {interactionResult && (
          <div className="interaction-result">
            <h3>Interaction Analysis</h3>
            <div className="result-content">
              {interactionResult.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicineChecker;