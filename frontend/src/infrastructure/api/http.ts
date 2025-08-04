import axios from 'axios';
import { useAuthStore } from 'src/stores/auth';

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      const auth = useAuthStore();
      auth.logout();
      window.location.href = '/#/login';
    }
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error))
    );
  }
);

export default api;
