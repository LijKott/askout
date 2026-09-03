import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Deployed at askout.elijah.com/hoco/ — base and outDir keep this
// site's build isolated inside the shared multi-site dist/ folder.
export default defineConfig({
  base: '/hoco/',
  plugins: [react()],
  build: {
    outDir: '../../dist/hoco',
    emptyOutDir: true,
  },
})
