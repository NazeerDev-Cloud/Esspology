import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev: the API/uploads live on :3001. Production: Express serves client/dist itself.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // The proxy rewrites Origin to the target while keeping the browser Host, which trips the API's same-origin CSRF check. Restore the browser's Origin.
      '/api': { target: 'http://localhost:3001', configure: (proxy) => proxy.on('proxyReq', (proxyReq, req) => { if (req.headers.origin) proxyReq.setHeader('origin', req.headers.origin); }) },
      '/uploads': 'http://localhost:3001',
    },
  },
  build: { chunkSizeWarningLimit: 900 },
});
