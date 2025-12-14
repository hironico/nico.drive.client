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
        target: 'https://localhost:3443', // Backend is on HTTPS port 3443
        changeOrigin: false, // Don't change origin to preserve localhost
        secure: false, // Allow self-signed certificates
        cookieDomainRewrite: '', // Rewrite to empty to use browser's current domain
        cookiePathRewrite: '/', // Ensure cookies are accessible across all paths
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward cookies from browser to backend
            if (req.headers.cookie) {
              proxyReq.setHeader('cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Forward Set-Cookie from backend to browser
            if (proxyRes.headers['set-cookie']) {
              res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
            }
          });
        },
      },
      '/dav': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
      },
      '/thumb': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
      },
      '/meta': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
      },
      '/zip': {
        target: 'https://localhost:3443',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
      },
    },
  },
})
