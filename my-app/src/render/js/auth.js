/* ============================================================
   auth.js — Authentication & session management
   ============================================================ */

   import { users } from './data.js';

   const SESSION_KEY = 'ros_session';
   
   // ── Session ────────────────────────────────────────────────
   
   /**
    * Lưu session sau khi đăng nhập thành công
    * @param {Object} user
    */
   export function saveSession(user) {
     const session = { id: user.id, name: user.name, username: user.username, role: user.role, phone: user.phone };
     sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
   }
   
   /**
    * Lấy thông tin user đang đăng nhập
    * @returns {Object|null}
    */
   export function getSession() {
     const raw = sessionStorage.getItem(SESSION_KEY);
     return raw ? JSON.parse(raw) : null;
   }
   
   /**
    * Đăng xuất — xóa session và về trang login
    */
   export function logout() {
     sessionStorage.removeItem(SESSION_KEY);
     window.location.href = '../pages/login.html';
   }
   
   // ── Login / Register ───────────────────────────────────────
   
   /**
    * Đăng nhập — kiểm tra username + password
    * @param {string} username
    * @param {string} password
    * @returns {{ success: boolean, user?: Object, error?: string }}
    */
   export function login(username, password) {
     const user = users.find(u => u.username === username && u.password === password);
     if (!user) return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
     saveSession(user);
     return { success: true, user };
   }
   
   /**
    * Đăng ký tài khoản Staff (chỉ Manager mới có quyền)
    * @param {{ name: string, username: string, password: string, phone: string }} data
    * @param {Object} currentUser - user đang đăng nhập (phải là manager)
    * @returns {{ success: boolean, error?: string }}
    */
   export function registerStaff(data, currentUser) {
     if (currentUser.role !== 'manager') {
       return { success: false, error: 'Bạn không có quyền tạo tài khoản.' };
     }
     const exists = users.find(u => u.username === data.username);
     if (exists) return { success: false, error: 'Tên đăng nhập đã tồn tại.' };
     if (!data.name || !data.username || !data.password) {
       return { success: false, error: 'Vui lòng điền đầy đủ thông tin.' };
     }
   
     const newUser = {
       id: 'u' + (users.length + 1),
       name: data.name,
       username: data.username,
       password: data.password,
       role: 'staff',
       phone: data.phone || '',
       createdAt: new Date().toISOString().split('T')[0],
     };
     users.push(newUser);
     return { success: true };
   }
   
   // ── Route Guard ────────────────────────────────────────────
   
   /**
    * Kiểm tra đã đăng nhập chưa. Nếu chưa thì về login.
    * Gọi ở đầu mỗi page (trừ login).
    * @returns {Object} session user
    */
   export function requireAuth() {
     const session = getSession();
     if (!session) {
       window.location.href = '../pages/login.html';
       return null;
     }
     return session;
   }
   
   /**
    * Kiểm tra quyền Manager. Nếu không phải thì về dashboard.
    * @returns {Object} session user
    */
   export function requireManager() {
     const session = requireAuth();
     if (session && session.role !== 'manager') {
       window.location.href = '../pages/dashboard.html';
       return null;
     }
     return session;
   }