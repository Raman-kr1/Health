import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function AppointmentScheduler() {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    doctor_name: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });
  const [optimizations, setOptimizations] = useState(null);

  useEffect(() => {
    loadAppointments();
    checkOptimizations();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentAPI.getAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    }
  };

  const checkOptimizations = async () => {
    try {
      const response = await appointmentAPI.optimizeAppointments();
      setOptimizations(response.data.optimization_suggestions);
    } catch (error) {
      console.error('Failed to get optimizations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const appointmentDateTime = new Date(
      `${newAppointment.appointment_date}T${newAppointment.appointment_time}`
    );

    try {
      await appointmentAPI.createAppointment({
        doctor_name: newAppointment.doctor_name,
        appointment_date: appointmentDateTime.toISOString(),
        reason: newAppointment.reason
      });
      
      toast.success('Appointment scheduled successfully');
      setNewAppointment({
        doctor_name: '',
        appointment_date: '',
        appointment_time: '',
        reason: ''
      });
      loadAppointments();
      checkOptimizations();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to schedule appointment');
    }
  };

  return (
    <div className="appointment-scheduler">
      <h2>Appointment Management</h2>
      
      <div className="appointment-form">
        <h3>Schedule New Appointment</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Doctor Name"
            value={newAppointment.doctor_name}
            onChange={(e) => setNewAppointment({...newAppointment, doctor_name: e.target.value})}
            required
          />
          <div className="datetime-inputs">
            <input
              type="date"
              value={newAppointment.appointment_date}
              onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <input
              type="time"
              value={newAppointment.appointment_time}
              onChange={(e) => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
              required
            />
          </div>
          <textarea
            placeholder="Reason for visit"
            value={newAppointment.reason}
            onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
            rows="3"
            required
          />
          <button type="submit">Schedule Appointment</button>
        </form>
      </div>

      {optimizations && optimizations.length > 0 && (
        <div className="optimization-suggestions">
          <h3>💡 Optimization Suggestions</h3>
          {optimizations.map((opt, index) => (
            <div key={index} className="suggestion">
              <p>Date: {format(new Date(opt.date), 'MMM dd, yyyy')}</p>
              <p>{opt.suggestion}</p>
              <ul>
                {opt.appointments.map((apt, i) => (
                  <li key={i}>{apt.doctor} at {apt.time}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="appointments-list">
        <h3>Upcoming Appointments</h3>
        {appointments.length === 0 ? (
          <p className="no-appointments">No upcoming appointments</p>
        ) : (
          <div className="appointment-cards">
            {appointments.map((apt) => (
              <div key={apt.id} className="appointment-card">
                <h4>{apt.doctor_name}</h4>
                <p className="appointment-time">
                  {format(new Date(apt.appointment_date), 'PPp')}
                </p>
                <p className="appointment-reason">{apt.reason}</p>
                <span className={`status ${apt.status}`}>{apt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentScheduler;