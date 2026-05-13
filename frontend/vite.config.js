import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  build: {
    // Disable sourcemaps for smaller production bundle
    sourcemap: false,
    // Optimize chunk splitting for faster page loads
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor';
          }
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'pdf';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) {
            return 'ui';
          }
        }
      }
    }
  }
})
