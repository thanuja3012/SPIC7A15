import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        signup: 'signup.html',
        dashboard: 'dashboard.html',
        hospital: 'hospital.html',
        admin: 'admin.html',
        profile: 'profile.html',
        role: 'role.html',
        onboarding: 'onboarding.html',
        donor: 'donor.html',
        welcome: 'welcome.html',
        forgot: 'forgot.html',
        newpage: 'newpage.html'
      }
    }
  }
})
