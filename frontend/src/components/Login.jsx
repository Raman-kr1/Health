import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.login(formData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setGuestLoading(true);
    try {
      await authAPI.guestLogin();
      setIsAuthenticated(true);
      toast.success('Welcome! You are now in guest mode.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Guest access failed');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>🏥 Health Monitor</h2>
        <p className="auth-subtitle">Sign in to track your health</p>
        
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <button 
          type="button" 
          className="guest-btn"
          onClick={handleGuestAccess}
          disabled={guestLoading}
        >
          {guestLoading ? 'Starting guest session...' : '👤 Continue as Guest'}
        </button>
        
        <div className="guest-info-box">
          <p><strong>Guest Access Features:</strong></p>
          <ul>
            <li>✅ Track health vitals</li>
            <li>✅ AI symptom analysis</li>
            <li>✅ Medicine interaction checker</li>
            <li>✅ View health charts</li>
            <li>⚠️ Data not saved permanently</li>
          </ul>
        </div>
        
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}

export default Login;