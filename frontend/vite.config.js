import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'log-after-server-start',
      configureServer(server) {
        const originalPrintUrls = server.printUrls;
        server.printUrls = () => {
          originalPrintUrls.call(server);
          console.log('\n\x1b[1m\x1b[32mApp started successfully!\x1b[0m')
          console.log('\n\x1b[1m\x1b[33mCheckout it out on \x1b[4mhttps://dev-codeserver.piramalfinance.com/health-tracker\x1b[0m\n')
        }
      }
    }
  ],
  base: '/',
  server: {
    port: process.env.FRONTEND_PORT,
    host: true,
    strictPort: true,
    proxy: {
      '/health-tracker/api': {
        target: `http://localhost:${process.env.BACKEND_PORT}`,
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
            console.log('Target URL:', options.target);
            console.log('Request URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url, 'to', options.target + req.url);
          });
        }
      }
    },
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/logs/**']
    },
    allowedHosts: [
      'localhost',
      'dev.piramalfinance.com',
      'qa.piramalfinance.com',
      'stage.piramalfinance.com',
      'stage-byot.piramalfinance.com',
      'byot.piramalfinance.com',
      'dev-codeserver.piramalfinance.com',
    ]
  }
})
