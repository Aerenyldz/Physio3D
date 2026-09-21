import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    strictPort: true,
    host: '127.0.0.1',
    open: true,
    proxy: {
      // Local Ollama — offline, no cloud; avoids browser CORS
      '/api/ollama': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@scene': '/src/scene',
      '@ui': '/src/ui',
      '@data': '/src/data',
      '@pathology': '/src/pathology',
      '@ai': '/src/ai',
      '@styles': '/src/styles',
    },
  },
});
