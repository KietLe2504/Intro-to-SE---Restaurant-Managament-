import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let backendProcess = null;
let backendStarted = false;
function startBackend() {
  var _a, _b;
  if (backendStarted) return;
  backendStarted = true;
  const backendPath = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "backend") : path.join(process.resourcesPath, "backend");
  const serverFile = path.join(backendPath, "server.js");
  console.log("[Backend] Starting from:", serverFile);
  if (!VITE_DEV_SERVER_URL) {
    const envFile = path.join(backendPath, ".env");
    if (!fs.existsSync(envFile)) {
      const exeEnv = path.join(process.resourcesPath, "..", ".env");
      if (fs.existsSync(exeEnv)) {
        fs.copyFileSync(exeEnv, envFile);
        console.log("[Backend] Copied .env from app dir");
      } else {
        console.error("[Backend] WARNING: .env not found at", envFile);
      }
    }
  }
  backendProcess = spawn("node", [serverFile], {
    cwd: backendPath,
    env: { ...process.env },
    stdio: "pipe"
  });
  (_a = backendProcess.stdout) == null ? void 0 : _a.on("data", (data) => {
    console.log("[Backend]", data.toString().trim());
  });
  (_b = backendProcess.stderr) == null ? void 0 : _b.on("data", (data) => {
    console.error("[Backend Error]", data.toString().trim());
  });
  backendProcess.on("close", (code) => {
    console.log("[Backend] exited with code", code);
    backendProcess = null;
  });
}
function waitForBackend(retries = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      http.get("http://localhost:3000/api/health", (res) => {
        if (res.statusCode === 200) {
          console.log("[Backend] Ready!");
          resolve();
        } else {
          retry();
        }
      }).on("error", retry);
    };
    const retry = () => {
      attempts++;
      if (attempts >= retries) reject(new Error("Backend không khởi động được"));
      else setTimeout(check, 1e3);
    };
    check();
  });
}
function createWindow() {
  if (win) return;
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.on("closed", () => {
    win = null;
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL + "pages/login.html");
  } else {
    win.loadFile(path.join(RENDERER_DIST, "pages", "login.html"));
  }
}
app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(async () => {
  startBackend();
  try {
    await waitForBackend();
  } catch (err) {
    console.error("[Backend] Failed to start:", err);
  }
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
