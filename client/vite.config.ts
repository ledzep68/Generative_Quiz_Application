import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig (({ mode }) =>{
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    return {
        plugins: [react()],
        server: {
            port: 5173,
            proxy: {
            '/': {
                target: env.VITE_API_BASE_URL,
                changeOrigin: false
            }
            }
        },
        resolve: {
            alias: {
            '@': './src'
            }
        }
    }
});