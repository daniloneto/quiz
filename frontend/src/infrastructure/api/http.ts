import axios from 'axios';
import { useAuthStore } from 'src/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  config.headers = config.headers || {};
  // Adiciona o token de autenticação, se existir
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  // Adiciona o x-api-key de todas as requisições
  config.headers['x-api-key'] = import.meta.env.VITE_API_KEY;
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
