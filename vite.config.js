import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Adicione este bloco abaixo:
  preview: {
    allowedHosts: ['otica-nossa-senhora-de-fatima.onrender.com']
  }
})
