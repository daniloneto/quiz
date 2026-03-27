import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const frontendPort = Number(env.VITE_FRONTEND_PORT || '9000');
  const backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true
        }
      }
    }
  };
});
