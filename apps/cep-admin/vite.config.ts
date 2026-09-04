import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // L'admin est servi sous /admin/ (voir Caddyfile) : assets => /admin/assets/.
  // Surchargeable via VITE_BASE (dev local reste en '/' si la variable est vide).
  base: process.env.VITE_BASE || '/admin/',
  plugins: [react()],
  server: { host: '0.0.0.0', port: 3001 },
});
