import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Restrict dev server to localhost only (prevents the esbuild CORS vuln)
    host: 'localhost',
    proxy: {
      // Forward all /api/* requests to the Express backend during dev
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
