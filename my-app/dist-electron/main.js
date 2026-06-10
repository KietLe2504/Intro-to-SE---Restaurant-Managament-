import { app as d, BrowserWindow as m } from "electron";
import { fileURLToPath as k } from "node:url";
import e from "node:path";
import { spawn as w } from "node:child_process";
import P from "node:http";
import p from "node:fs";
const h = e.dirname(k(import.meta.url));
process.env.APP_ROOT = e.join(h, "..");
const c = process.env.VITE_DEV_SERVER_URL, O = e.join(process.env.APP_ROOT, "dist-electron"), g = e.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = c ? e.join(process.env.APP_ROOT, "public") : g;
let n, t = null, f = !1;
function R() {
  var l, s;
  if (f) return;
  f = !0;
  const r = c ? e.join(process.env.APP_ROOT, "backend") : e.join(process.resourcesPath, "backend"), a = e.join(r, "server.js");
  if (console.log("[Backend] Starting from:", a), !c) {
    const o = e.join(r, ".env");
    if (!p.existsSync(o)) {
      const i = e.join(process.resourcesPath, "..", ".env");
      p.existsSync(i) ? (p.copyFileSync(i, o), console.log("[Backend] Copied .env from app dir")) : console.error("[Backend] WARNING: .env not found at", o);
    }
  }
  t = w("node", [a], {
    cwd: r,
    env: { ...process.env },
    stdio: "pipe"
  }), (l = t.stdout) == null || l.on("data", (o) => {
    console.log("[Backend]", o.toString().trim());
  }), (s = t.stderr) == null || s.on("data", (o) => {
    console.error("[Backend Error]", o.toString().trim());
  }), t.on("close", (o) => {
    console.log("[Backend] exited with code", o), t = null;
  });
}
function _(r = 20) {
  return new Promise((a, l) => {
    let s = 0;
    const o = () => {
      P.get("http://localhost:3000/api/health", (v) => {
        v.statusCode === 200 ? (console.log("[Backend] Ready!"), a()) : i();
      }).on("error", i);
    }, i = () => {
      s++, s >= r ? l(new Error("Backend không khởi động được")) : setTimeout(o, 1e3);
    };
    o();
  });
}
function u() {
  n || (n = new m({
    width: 1280,
    height: 800,
    icon: e.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: e.join(h, "preload.mjs")
    }
  }), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), n.on("closed", () => {
    n = null;
  }), c ? n.loadURL(c + "pages/login.html") : n.loadFile(e.join(g, "pages", "login.html")));
}
d.on("window-all-closed", () => {
  t && (t.kill(), t = null), process.platform !== "darwin" && (d.quit(), n = null);
});
d.on("activate", () => {
  m.getAllWindows().length === 0 && u();
});
d.whenReady().then(async () => {
  R();
  try {
    await _();
  } catch (r) {
    console.error("[Backend] Failed to start:", r);
  }
  u();
});
export {
  O as MAIN_DIST,
  g as RENDERER_DIST,
  c as VITE_DEV_SERVER_URL
};
