import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var frontendPort = Number(env.VITE_FRONTEND_PORT || '9000');
    var backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://localhost:3000';
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
