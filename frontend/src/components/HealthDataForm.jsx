import React, { useState } from 'react';
import { healthAPI } from '../services/api';
import toast from 'react-hot-toast';

import React, { useState } from 'react';
import { healthAPI } from '../services/api';
import toast from 'react-hot-toast';

function HealthDataForm({ onDataAdded }) {
  const [formData, setFormData] = useState({
    heart_rate: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    weight: '',
    blood_sugar: '',
    symptoms: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSubmit = {};
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        dataToSubmit[key] = key === 'symptoms' ? formData[key] : parseFloat(formData[key]);
      }
    });

    try {
      await healthAPI.addHealthData(dataToSubmit);
      toast.success('Health data recorded successfully');
      setFormData({
        heart_rate: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        temperature: '',
        weight: '',
        blood_sugar: '',
        symptoms: ''
      });
      onDataAdded();
    } catch (error) {
      toast.error('Failed to record health data');
    }
  };

  return (
    <div className="health-data-form">
      <h2>Record Health Data</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Heart Rate (bpm)</label>
            <input
              type="number"
              value={formData.heart_rate}
              onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
              placeholder="e.g., 72"
            />
          </div>
          
          <div className="form-group">
            <label>Blood Pressure</label>
            <div className="bp-inputs">
              <input
                type="number"
                value={formData.blood_pressure_systolic}
                onChange={(e) => setFormData({...formData, blood_pressure_systolic: e.target.value})}
                placeholder="Systolic"
              />
              <span>/</span>
              <input
                type="number"
                value={formData.blood_pressure_diastolic}
                onChange={(e) => setFormData({...formData, blood_pressure_diastolic: e.target.value})}
                placeholder="Diastolic"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({...formData, temperature: e.target.value})}
              placeholder="e.g., 98.6"
            />
          </div>
          
          <div className="form-group">
            <label>Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="e.g., 150"
            />
          </div>
          
          <div className="form-group">
            <label>Blood Sugar (mg/dL)</label>
            <input
              type="number"
              value={formData.blood_sugar}
              onChange={(e) => setFormData({...formData, blood_sugar: e.target.value})}
              placeholder="e.g., 95"
            />
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>Symptoms (if any)</label>
          <textarea
            value={formData.symptoms}
            onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
            placeholder="Describe any symptoms you're experiencing..."
            rows="3"
          />
        </div>
        
        <button type="submit" className="submit-btn">Record Data</button>
      </form>
    </div>
  );
}

export default HealthDataForm;