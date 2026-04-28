/* ============================================================
   ui.js — Shared UI helpers
   Toast, modal, dropdown, top header render
   ============================================================ */

   import { getSession, logout } from './auth.js';

   // ── Toast ──────────────────────────────────────────────────
   
   /**
    * Hiện toast notification
    * @param {string} message
    * @param {'success'|'error'|'warning'|'info'} type
    * @param {number} duration - ms
    */
   export function showToast(message, type = 'info', duration = 3000) {
     let container = document.getElementById('toast-container');
     if (!container) {
       container = document.createElement('div');
       container.id = 'toast-container';
       container.className = 'toast-container';
       document.body.appendChild(container);
     }
   
     const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
     const toast = document.createElement('div');
     toast.className = `toast ${type}`;
     toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
     container.appendChild(toast);
   
     setTimeout(() => {
       toast.style.animation = 'toastOut 0.2s ease forwards';
       setTimeout(() => toast.remove(), 200);
     }, duration);
   }
   
   // ── Modal ──────────────────────────────────────────────────
   
   /**
    * Mở modal theo id
    * @param {string} modalId
    */
   export function openModal(modalId) {
     document.getElementById(modalId)?.classList.add('open');
   }
   
   /**
    * Đóng modal theo id
    * @param {string} modalId
    */
   export function closeModal(modalId) {
     document.getElementById(modalId)?.classList.remove('open');
   }
   
   /**
    * Tạo và hiện modal động
    * @param {{ title: string, body: string, onConfirm?: Function, confirmLabel?: string, confirmClass?: string }} opts
    */
   export function confirmDialog(opts) {
     const id = 'dynamic-modal';
     let existing = document.getElementById(id);
     if (existing) existing.remove();
   
     const el = document.createElement('div');
     el.id = id;
     el.className = 'modal-backdrop open';
     el.innerHTML = `
       <div class="modal" style="max-width:400px">
         <div class="modal-header">
           <div class="modal-title">${opts.title}</div>
           <button class="modal-close" onclick="document.getElementById('${id}').remove()">×</button>
         </div>
         <div class="modal-body" style="color:var(--text2);font-size:14px">${opts.body}</div>
         <div class="modal-footer">
           <button class="btn btn-ghost" onclick="document.getElementById('${id}').remove()">Hủy</button>
           <button class="btn ${opts.confirmClass || 'btn-primary'}" id="${id}-confirm">${opts.confirmLabel || 'Xác nhận'}</button>
         </div>
       </div>
     `;
     document.body.appendChild(el);
   
     document.getElementById(`${id}-confirm`).addEventListener('click', () => {
       opts.onConfirm?.();
       el.remove();
     });
   
     el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
   }
   
   // ── Top Header ─────────────────────────────────────────────
   
   /**
    * Render top header với nút back + user dropdown
    * @param {{ title: string, sub?: string, showBack?: boolean, backUrl?: string }} opts
    */
   export function renderHeader(opts = {}) {
     const session = getSession();
     if (!session) return;
   
     const header = document.getElementById('top-header');
     if (!header) return;
   
     const backBtn = opts.showBack !== false
       ? `<button class="btn-back" onclick="window.location.href='${opts.backUrl || 'dashboard.html'}'">← Quay lại</button>`
       : '';
   
     header.innerHTML = `
       ${backBtn}
       <div>
         <div class="header-title">${opts.title || ''}</div>
         ${opts.sub ? `<div class="header-sub">${opts.sub}</div>` : ''}
       </div>
       <div class="header-spacer"></div>
       <div class="user-dropdown-wrap">
         <div class="user-dropdown-trigger" id="user-trigger">
           <div class="user-avatar">${session.name[0]}</div>
           <div>
             <div class="user-info-name">${session.name}</div>
             <div class="user-info-role">${session.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</div>
           </div>
           <span class="dropdown-arrow">▼</span>
         </div>
         <div class="user-dropdown-menu" id="user-menu">
           <div class="dropdown-item" onclick="window.location.href='profile.html'">👤 Thông tin cá nhân</div>
           <div class="dropdown-divider"></div>
           <div class="dropdown-item danger" id="logout-btn">🚪 Đăng xuất</div>
         </div>
       </div>
     `;
   
     // Toggle dropdown
     document.getElementById('user-trigger').addEventListener('click', () => {
       const trigger = document.getElementById('user-trigger');
       const menu    = document.getElementById('user-menu');
       trigger.classList.toggle('open');
       menu.classList.toggle('open');
     });
   
     // Close on outside click
     document.addEventListener('click', (e) => {
       if (!e.target.closest('.user-dropdown-wrap')) {
         document.getElementById('user-trigger')?.classList.remove('open');
         document.getElementById('user-menu')?.classList.remove('open');
       }
     });
   
     document.getElementById('logout-btn').addEventListener('click', () => {
       confirmDialog({
         title: 'Đăng xuất',
         body: 'Bạn có chắc muốn đăng xuất không?',
         confirmLabel: 'Đăng xuất',
         confirmClass: 'btn-danger',
         onConfirm: logout,
       });
     });
   }
   
   // ── Sidebar active state ───────────────────────────────────
   
   /**
    * Đánh dấu nav item đang active dựa theo tên page hiện tại
    * @param {string} currentPage - tên page, VD: 'dashboard'
    */
   export function setActiveNav(currentPage) {
     document.querySelectorAll('.nav-item[data-page]').forEach(item => {
       item.classList.toggle('active', item.dataset.page === currentPage);
     });
   }
   
   // ── Sidebar render ─────────────────────────────────────────
   
   /**
    * Render sidebar với nav items theo role
    * @param {string} currentPage
    */
   export function renderSidebar(currentPage) {
     const session = getSession();
     if (!session) return;
   
     const sidebar = document.getElementById('sidebar');
     if (!sidebar) return;
   
     const isManager = session.role === 'manager';
     const base = '../pages/';
   
     sidebar.innerHTML = `
       <div class="sidebar-logo">
         <div class="sidebar-logo-mark">Nhà Hàng</div>
         <div class="sidebar-logo-sub">Quản lý hệ thống</div>
       </div>
       <div class="sidebar-role-badge ${isManager ? 'role-manager' : 'role-staff'}">
         ${isManager ? '★ Quản lý' : 'Nhân viên'}
       </div>
       <nav class="sidebar-nav">
         <div class="nav-group-label">Tổng quan</div>
         <div class="nav-item" data-page="dashboard" onclick="window.location.href='${base}dashboard.html'">
           <span class="nav-icon">📊</span> Dashboard
         </div>
   
         <div class="nav-group-label">Phục vụ</div>
         <div class="nav-item" data-page="tables" onclick="window.location.href='${base}tables.html'">
           <span class="nav-icon">🪑</span> Quản lý bàn
         </div>
         <div class="nav-item" data-page="orders" onclick="window.location.href='${base}orders.html'">
           <span class="nav-icon">🧾</span> Đơn hàng
         </div>
         <div class="nav-item" data-page="menu" onclick="window.location.href='${base}menu.html'">
           <span class="nav-icon">🍽️</span> Thực đơn
         </div>
   
         ${isManager ? `
         <div class="nav-group-label">Quản lý</div>
         <div class="nav-item" data-page="staff" onclick="window.location.href='${base}staff.html'">
           <span class="nav-icon">👥</span> Nhân viên
         </div>
         <div class="nav-item" data-page="revenue" onclick="window.location.href='${base}revenue.html'">
           <span class="nav-icon">📈</span> Doanh thu
         </div>
         ` : ''}
       </nav>
       <div class="sidebar-footer">
         <div class="sidebar-version">RestaurantOS v2.0</div>
       </div>
     `;
   
     setActiveNav(currentPage);
   }