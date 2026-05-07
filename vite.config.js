import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ------------------------------------
 server: {
  allowedHosts: ['.ngrok-free.dev'],
  host: true,
  hmr: {
    clientPort: 443, // Force le port sécurisé pour le téléphone
    host: 'kenda-fremd-scurvily.ngrok-free.dev', // Remplace par ton lien ngrok actuel
  },
}

})
