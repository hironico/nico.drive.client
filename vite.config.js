import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [    
    react(),
  ],

  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },

  server: {
    proxy: {
      '/auth': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
      },
      '/dav': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
      },
      '/thumb': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
      },
      '/meta': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
      },
      '/zip': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
      },
    },
  },
})
