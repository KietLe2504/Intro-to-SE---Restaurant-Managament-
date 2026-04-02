import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  root: path.join(__dirname, 'src/render'),
  plugins: [
    electron({
      main: {
        entry: path.join(__dirname, 'electron/main.ts'),  // ← đường dẫn tuyệt đối
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),  // ← đã đúng rồi
      },
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
})