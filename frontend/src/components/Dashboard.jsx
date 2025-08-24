import React, { useState, useEffect } from 'react';
import HealthChart from './HealthChart';
import ChatBot from './ChatBot';
import MedicineChecker from './MedicineChecker';
import AppointmentScheduler from './AppointmentScheduler';
import HealthDataForm from './HealthDataForm';
import { healthAPI } from '../services/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [healthData, setHealthData] = useState([]);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    loadHealthData();
    loadTrends();
  }, []);

  const loadHealthData = async () => {
    try {
      const response = await healthAPI.getHealthData();
      setHealthData(response.data);
    } catch (error) {
      toast.error('Failed to load health data');
    }
  };
  const loadTrends = async () => {
    try {
      const response = await healthAPI.getHealthTrends();
      setTrends(response.data);
    } catch (error) {
      console.error('Failed to load trends:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Health Monitoring Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'add-data' ? 'active' : ''}
          onClick={() => setActiveTab('add-data')}
        >
          Add Data
        </button>
        <button 
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => setActiveTab('chat')}
        >
          Symptom Chat
        </button>
        <button 
          className={activeTab === 'medicines' ? 'active' : ''}
          onClick={() => setActiveTab('medicines')}
        >
          Medicine Checker
        </button>
        <button 
          className={activeTab === 'appointments' ? 'active' : ''}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview">
            <h2>Health Overview</h2>
            <HealthChart data={healthData} trends={trends} />
          </div>
        )}
        
        {activeTab === 'add-data' && (
          <HealthDataForm onDataAdded={() => {
            loadHealthData();
            loadTrends();
          }} />
        )}
        
        {activeTab === 'chat' && <ChatBot />}
        
        {activeTab === 'medicines' && <MedicineChecker />}
        
        {activeTab === 'appointments' && <AppointmentScheduler />}
      </main>
    </div>
  );
}

export default Dashboard;