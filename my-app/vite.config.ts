import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  root: path.join(__dirname, 'src/render'),
  build: {
    rollupOptions: {
      input: {
        main:      path.join(__dirname, 'src/render/index.html'),
        login:     path.join(__dirname, 'src/render/pages/login.html'),
        dashboard: path.join(__dirname, 'src/render/pages/dashboard.html'),
        tables:    path.join(__dirname, 'src/render/pages/tables.html'),
        orders:    path.join(__dirname, 'src/render/pages/orders.html'),
        menu:      path.join(__dirname, 'src/render/pages/menu.html'),
        staff:     path.join(__dirname, 'src/render/pages/staff.html'),
        revenue:   path.join(__dirname, 'src/render/pages/revenue.html'),
        profile:   path.join(__dirname, 'src/render/pages/profile.html'),
      }
    }
  },
  plugins: [
    electron({
      main: {
        entry: path.join(__dirname, 'electron/main.ts'),
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
})