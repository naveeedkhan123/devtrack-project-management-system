import axios from 'axios';

export const getApiBaseUrl = (isProduction, configuredUrl) => {
  const apiUrl = configuredUrl?.trim().replace(/\/+$/, '');
  if (apiUrl) return apiUrl;
  return isProduction ? null : '/api';
};

const apiBaseUrl = getApiBaseUrl(import.meta.env.PROD, import.meta.env.VITE_API_URL);
const missingProductionApiUrl = apiBaseUrl === null;

const api = axios.create({
  baseURL: apiBaseUrl || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    if (missingProductionApiUrl) {
      return Promise.reject(Object.assign(
        new Error('The sign-in service is not configured for this deployment.'),
        { code: 'ERR_API_CONFIG' }
      ));
    }
    const token = localStorage.getItem('devtrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized access & token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on failed login/register endpoint calls
      const requestUrl = error.config?.url || '';
      const isAuthUrl =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register');

      if (!isAuthUrl) {
        localStorage.removeItem('devtrack_token');
        localStorage.removeItem('devtrack_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
