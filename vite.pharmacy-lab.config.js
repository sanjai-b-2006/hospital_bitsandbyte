import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'pharmacy-lab-app',
  server: {
    port: 5174,
    strictPort: true,
  },
});
