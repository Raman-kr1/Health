import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HealthChart from './HealthChart';
import ChatBot from './ChatBot';
import MedicineChecker from './MedicineChecker';
import AppointmentScheduler from './AppointmentScheduler';
import HealthDataForm from './HealthDataForm';
import { healthAPI, getStoredUser, isGuest, clearAuthData } from '../services/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [healthData, setHealthData] = useState([]);
  const [trends, setTrends] = useState(null);
  const [showGuestBanner, setShowGuestBanner] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    setShowGuestBanner(currentUser?.is_guest === true);
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
    clearAuthData();
    navigate('/login');
  };

  const handleUpgradeAccount = () => {
    clearAuthData();
    navigate('/register');
  };

  const handleTabClick = (tab) => {
    // Check if guest is trying to access restricted features
    if (isGuest() && tab === 'appointments') {
      toast.error('Please create an account to schedule appointments');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="dashboard">
      {/* Guest Banner */}
      {showGuestBanner && (
        <div className="guest-banner">
          <span>👤 You're using guest mode. Your data won't be saved permanently.</span>
          <button onClick={handleUpgradeAccount} className="upgrade-btn">
            Create Account to Save Data
          </button>
          <button onClick={() => setShowGuestBanner(false)} className="dismiss-btn">
            ✕
          </button>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-left">
          <h1>🏥 Health Monitoring Dashboard</h1>
          {isGuest() && <span className="guest-badge">Guest Mode</span>}
        </div>
        <div className="header-right">
          <span className="user-greeting">
            {isGuest() ? '👤 Guest User' : `👋 ${user?.username || 'User'}`}
          </span>
          {isGuest() && (
            <button onClick={handleUpgradeAccount} className="signup-btn">
              Sign Up
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">
            {isGuest() ? 'Exit' : 'Logout'}
          </button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => handleTabClick('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'add-data' ? 'active' : ''}
          onClick={() => handleTabClick('add-data')}
        >
          ➕ Add Data
        </button>
        <button 
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => handleTabClick('chat')}
        >
          🤖 Symptom Chat
        </button>
        <button 
          className={activeTab === 'medicines' ? 'active' : ''}
          onClick={() => handleTabClick('medicines')}
        >
          💊 Medicine Checker
        </button>
        <button 
          className={`${activeTab === 'appointments' ? 'active' : ''} ${isGuest() ? 'restricted' : ''}`}
          onClick={() => handleTabClick('appointments')}
        >
          📅 Appointments
          {isGuest() && <span className="lock-icon">🔒</span>}
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview">
            <h2>Health Overview</h2>
            {healthData.length === 0 ? (
              <div className="empty-state">
                <p>📊 No health data recorded yet.</p>
                <p>Click "Add Data" to start tracking your health!</p>
                <button onClick={() => setActiveTab('add-data')} className="cta-btn">
                  Add Your First Record
                </button>
              </div>
            ) : (
              <HealthChart data={healthData} trends={trends} />
            )}
          </div>
        )}
        
        {activeTab === 'add-data' && (
          <HealthDataForm onDataAdded={() => {
            loadHealthData();
            loadTrends();
            toast.success(isGuest() ? 'Data recorded (guest session)' : 'Data recorded successfully');
          }} />
        )}
        
        {activeTab === 'chat' && <ChatBot />}
        
        {activeTab === 'medicines' && <MedicineChecker />}
        
        {activeTab === 'appointments' && (
          isGuest() ? (
            <div className="restricted-feature">
              <h2>🔒 Feature Restricted</h2>
              <p>Appointment scheduling requires a registered account.</p>
              <p>Create an account to:</p>
              <ul>
                <li>✅ Schedule doctor appointments</li>
                <li>✅ Get appointment reminders</li>
                <li>✅ Track appointment history</li>
                <li>✅ Save all your health data permanently</li>
              </ul>
              <button onClick={handleUpgradeAccount} className="cta-btn">
                Create Free Account
              </button>
            </div>
          ) : (
            <AppointmentScheduler />
          )
        )}
      </main>
    </div>
  );
}

export default Dashboard;