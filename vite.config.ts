import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 8000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(env.NEXT_PUBLIC_API_URL),
        'process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID': JSON.stringify(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
