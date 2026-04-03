import axios from 'axios';

let API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL ||
  'http://localhost:5000/api';

try {
  const url = new URL(API_BASE_URL);
  if (!/\/api\/?$/i.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/+$/, '') + '/api';
    API_BASE_URL = url.toString();
  }
} catch {
  if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api';
  }
}

let API_ORIGIN = 'http://localhost:5000';

try {
  const url = new URL(API_BASE_URL);
  API_ORIGIN = url.origin;
} catch {
  if (typeof window !== 'undefined') {
    API_ORIGIN = window.location.origin;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAssetUrl = (path?: string | null) => {
  if (!path) return '';
  const value = String(path);
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${API_ORIGIN}${normalized}`;
};

export const uploadVideo = async (file: File, category: string = 'cosmetic') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  return api.post('/audits', formData); 
};

export const getAudits = async () => {
  return api.get('/audits/my/history');
};

export const getAudit = async (id: string) => {
  return api.get(`/audits/${id}`);
};

export const compareAudits = async (auditAId: string, auditBId: string) => {
  return api.post('/compare', { auditA_id: auditAId, auditB_id: auditBId });
};
