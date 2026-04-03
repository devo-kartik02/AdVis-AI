import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URL
});

// Automatically add token to every request if logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// --- API FUNCTIONS ---

export const uploadAudit = (formData) => API.post('/audit', formData);

// Fix: Export 'checkAuditStatus' (Aliased to getAuditStatus for compatibility)
export const getAuditStatus = (id) => API.get(`/audit/${id}`);
export const checkAuditStatus = getAuditStatus; 

export const getHistory = () => API.get('/audit/my/history');
export const compareAudits = (data) => API.post('/compare', data);

// Fix: Add the missing 'getAssetUrl' helper
export const getAssetUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
};

export default API;