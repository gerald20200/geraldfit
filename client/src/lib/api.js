import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('geraldfit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error) {
  if (!error.response) {
    return 'Cannot reach the Geraldfit API. Make sure the server is running, VITE_API_URL is correct, and the client origin is allowed by server CORS.';
  }
  return error.response.data?.message || error.message || 'Something went wrong. Please try again.';
}
export default api;