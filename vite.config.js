import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures itch.io and sub-path deployment works seamlessly
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
