/* ============================================================
   auth.js — Authentication & session management
   ============================================================ */

   import { users, syncUsers } from './data.js';

   const SESSION_KEY = 'ros_session';
   
   // ── Session ────────────────────────────────────────────────
   
   export function saveSession(user) {
     const session = {
       id: user.id, name: user.name,
       username: user.username, role: user.role, phone: user.phone,
     };
     sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
   }
   
   export function getSession() {
     const raw = sessionStorage.getItem(SESSION_KEY);
     return raw ? JSON.parse(raw) : null;
   }
   
   export function logout() {
     sessionStorage.removeItem(SESSION_KEY);
     window.location.replace('../pages/login.html');
   }
   
   // ── Login ──────────────────────────────────────────────────
   
   export function login(username, password) {
     const user = users.find(u => u.username === username && u.password === password);
     if (!user) return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
     saveSession(user);
     return { success: true, user };
   }
   
   export function verifyUser(username, password) {
     const user = users.find(u => u.username === username && u.password === password);
     if (!user) return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
     return { success: true, user };
   }
   
   // ── Register ───────────────────────────────────────────────
   
   export function registerStaff(data, currentUser) {
     if (currentUser.role !== 'manager') {
       return { success: false, error: 'Bạn không có quyền tạo tài khoản.' };
     }
     if (!data.name || !data.username || !data.password) {
       return { success: false, error: 'Vui lòng điền đầy đủ thông tin.' };
     }
     if (data.password.length < 6) {
       return { success: false, error: 'Mật khẩu tối thiểu 6 ký tự.' };
     }
     if (users.find(u => u.username === data.username)) {
       return { success: false, error: 'Tên đăng nhập đã tồn tại.' };
     }
   
     users.push({
       id: 'u' + (users.length + 1),
       name: data.name,
       username: data.username,
       password: data.password,
       role: 'staff',
       phone: data.phone || '',
       createdAt: new Date().toISOString().split('T')[0],
     });
   
     syncUsers(); // ← lưu vào sessionStorage ngay
     return { success: true };
   }
   
   // ── Route Guards ───────────────────────────────────────────
   
   export function requireAuth() {
     const session = getSession();
     if (!session) {
       window.location.replace('../pages/login.html');
       return null;
     }
     return session;
   }
   
   export function requireManager() {
     const session = getSession();
     if (!session) {
       window.location.replace('../pages/login.html');
       return null;
     }
     if (session.role !== 'manager') {
       window.location.replace('../pages/dashboard.html');
       return null;
     }
     return session;
   }