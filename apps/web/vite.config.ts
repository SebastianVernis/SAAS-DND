import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'state-vendor': ['zustand', 'axios'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Enable minification (esbuild is faster than terser)
    minify: 'esbuild',
    // Source maps for production debugging
    sourcemap: false, // Disable for smaller bundle
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
