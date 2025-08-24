import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const healthAPI = {
  addHealthData: (data) => api.post('/health/health-data', data),
  getHealthData: (days = 30) => api.get(`/health/health-data?days=${days}`),
  getHealthTrends: () => api.get('/health/health-trends'),
  addMedicine: (data) => api.post('/health/medicines', data),
  getMedicines: () => api.get('/health/medicines'),
};

export const chatAPI = {
  analyzeSymptoms: (symptoms) => api.post('/chat/symptoms', { symptoms }),
  checkMedicineInteractions: (medicines) => 
    api.post('/chat/medicine-check', { medicines }),
};

export const appointmentAPI = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: (includePast = false) => 
    api.get(`/appointments?include_past=${includePast}`),
  optimizeAppointments: () => api.get('/appointments/optimize'),
};

export default api;