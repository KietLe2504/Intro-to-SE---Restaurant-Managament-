import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { spawn, ChildProcess } from 'node:child_process'
import http from 'node:http'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null
let backendProcess: ChildProcess | null = null
let backendStarted = false  // ← tránh spawn nhiều lần

// ── Khởi động backend ─────────────────────────────────────
function startBackend() {
  if (backendStarted) return  // ← chỉ start 1 lần
  backendStarted = true

  const backendPath = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, 'backend')
    : path.join(process.resourcesPath, 'backend')

  const serverFile = path.join(backendPath, 'server.js')
  console.log('[Backend] Starting from:', serverFile)

  // Tạo .env nếu chưa có (production)
  if (!VITE_DEV_SERVER_URL) {
    const envFile = path.join(backendPath, '.env')
    if (!fs.existsSync(envFile)) {
      // Đọc từ file .env cạnh exe nếu có
      const exeEnv = path.join(process.resourcesPath, '..', '.env')
      if (fs.existsSync(exeEnv)) {
        fs.copyFileSync(exeEnv, envFile)
        console.log('[Backend] Copied .env from app dir')
      } else {
        console.error('[Backend] WARNING: .env not found at', envFile)
      }
    }
  }

  backendProcess = spawn('node', [serverFile], {
    cwd: backendPath,
    env: { ...process.env },
    stdio: 'pipe',
  })

  backendProcess.stdout?.on('data', (data) => {
    console.log('[Backend]', data.toString().trim())
  })
  backendProcess.stderr?.on('data', (data) => {
    console.error('[Backend Error]', data.toString().trim())
  })
  backendProcess.on('close', (code) => {
    console.log('[Backend] exited with code', code)
    backendProcess = null
    // KHÔNG restart tự động để tránh vòng lặp vô tận
  })
}

// ── Đợi backend sẵn sàng ─────────────────────────────────
function waitForBackend(retries = 20): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const check = () => {
      http.get('http://localhost:3000/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log('[Backend] Ready!')
          resolve()
        } else {
          retry()
        }
      }).on('error', retry)
    }
    const retry = () => {
      attempts++
      if (attempts >= retries) reject(new Error('Backend không khởi động được'))
      else setTimeout(check, 1000)
    }
    check()
  })
}

function createWindow() {
  if (win) return  // ← tránh tạo nhiều cửa sổ

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.on('closed', () => {
    win = null
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL + 'pages/login.html')
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'pages', 'login.html'))
  }
}

// ── Kill backend khi đóng app ─────────────────────────────
app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// ── Khởi động ─────────────────────────────────────────────
app.whenReady().then(async () => {
  startBackend()
  try {
    await waitForBackend()
  } catch (err) {
    console.error('[Backend] Failed to start:', err)
  }
  createWindow()
})