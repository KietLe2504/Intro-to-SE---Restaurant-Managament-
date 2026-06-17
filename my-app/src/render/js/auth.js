/* ============================================================
   auth.js — Authentication sử dụng backend API
   ============================================================ */

   import { apiLogin, apiRegisterManager, apiCreateStaff, getToken, removeToken } from './api.js'

   const SESSION_KEY = 'ros_session'
   
   // ── Session ────────────────────────────────────────────────
   
   export function getSession() {
     const raw = sessionStorage.getItem(SESSION_KEY)
     return raw ? JSON.parse(raw) : null
   }
   
   export function saveSession(user) {
     sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
   }
   
   export function logout() {
     removeToken()
     sessionStorage.removeItem(SESSION_KEY)
     window.location.replace('../pages/login.html')
   }
   
   // ── Login ──────────────────────────────────────────────────
   
   export async function login(username, password) {
     try {
       const data = await apiLogin(username, password)
       if (!data) return { success: false, error: 'Không thể kết nối server.' }
       return { success: true, user: data.user }
     } catch (err) {
       return { success: false, error: err.message }
     }
   }
   
   export async function verifyUser(username, password) {
     try {
       const res = await fetch('http://localhost:3000/api/auth/login', {
         method:  'POST',
         headers: { 'Content-Type': 'application/json' },
         body:    JSON.stringify({ username, password }),
       })
       const data = await res.json()
       if (!res.ok) return { success: false, error: data.error }
       return { success: true, user: data.user }
     } catch {
       return { success: false, error: 'Không thể kết nối server.' }
     }
   }
   
   export async function registerManager(name, username, password, phone) {
     try {
       const data = await apiRegisterManager(name, username, password, phone)
       return { success: true, data }
     } catch (err) {
       return { success: false, error: err.message }
     }
   }
   
   export async function registerStaff(staffData, currentUser) {
     if (currentUser.role !== 'Manager') {
       return { success: false, error: 'Bạn không có quyền tạo tài khoản.' }
     }
     try {
       const data = await apiCreateStaff(
         staffData.name, staffData.username,
         staffData.password, staffData.phone
       )
       return { success: true, data }
     } catch (err) {
       return { success: false, error: err.message }
     }
   }
   
   // ── Route Guards ───────────────────────────────────────────
   
   export function requireAuth() {
     const session = getSession()
     const token   = getToken()
     if (!session || !token) {
       window.location.replace('../pages/login.html')
       return null
     }
     return session
   }
   
   export function requireManager() {
     const session = requireAuth()
     if (!session) return null
     if (session.role !== 'Manager') {
       window.location.replace('../pages/dashboard.html')
       return null
     }
     return session
   }