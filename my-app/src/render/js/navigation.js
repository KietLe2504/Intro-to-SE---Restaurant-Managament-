/* ─────────────────────────────────────────
   navigation.js  —  Điều hướng + render UI
   Import data từ data.js rồi render vào HTML
───────────────────────────────────────── */

import { recentOrders, tables, menuItems, staff } from './data.js';

// Config từng màn hình: tiêu đề + nút header
const PAGE_CONFIG = {
  dashboard: { title: 'Dashboard',      sub: 'Tổng quan hôm nay',               btn: '+ Thêm đơn',       btn2: 'Xuất báo cáo' },
  menu:      { title: 'Thực đơn',       sub: 'Quản lý món ăn',                  btn: '+ Thêm món',       btn2: 'Nhập từ file' },
  tables:    { title: 'Quản lý bàn',    sub: '15 bàn · 7 đang phục vụ',         btn: '+ Thêm bàn',       btn2: 'Đặt bàn' },
  staff:     { title: 'Nhân viên',      sub: '5 nhân viên · 4 đang làm việc',   btn: '+ Thêm nhân viên', btn2: 'Xuất lịch' },
  order:     { title: 'Gọi món',        sub: 'Tạo đơn mới',                     btn: 'Chọn bàn',         btn2: 'Xem đơn cũ' },
};

// Chuyển màn hình
export function showScreen(name) {
  // Ẩn tất cả screens + bỏ active nav
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Hiện screen + active nav tương ứng
  document.getElementById('screen-' + name)?.classList.add('active');
  document.querySelector(`[data-screen="${name}"]`)?.classList.add('active');

  // Cập nhật header
  const p = PAGE_CONFIG[name];
  if (p) {
    document.getElementById('pageTitle').textContent  = p.title;
    document.getElementById('pageSub').textContent    = p.sub;
    document.getElementById('headerBtn').textContent  = p.btn;
    document.getElementById('headerBtn2').textContent = p.btn2;
  }
}

// ── Render: Recent Orders (Dashboard) ──
function renderRecentOrders() {
  const container = document.getElementById('recentOrders');
  if (!container) return;
  container.innerHTML = recentOrders.map(o => `
    <div class="order-item">
      <div class="order-id">${o.id}</div>
      <div class="order-table">${o.table}</div>
      <div class="order-items">${o.items}</div>
      <div class="order-price">${o.price}</div>
      <div class="status-badge ${o.status}">${o.label}</div>
    </div>
  `).join('');
}

// ── Render: Table Mini Grid (Dashboard) ──
function renderTableMiniGrid() {
  const container = document.getElementById('tableGrid');
  const legend    = document.getElementById('tableLegend');
  if (!container) return;

  const statusMap = { free: 't-free', busy: 't-busy', reserved: 't-reserved' };
  container.innerHTML = tables.map(t => `
    <div class="table-dot ${statusMap[t.status]}">
      <span class="tnum">${t.num}</span>
      <span>${t.label.split(' ')[0]}</span>
    </div>
  `).join('');

  const free     = tables.filter(t => t.status === 'free').length;
  const busy     = tables.filter(t => t.status === 'busy').length;
  const reserved = tables.filter(t => t.status === 'reserved').length;
  if (legend) {
    legend.innerHTML = `
      <span style="color:var(--green)">● Trống (${free})</span>
      <span style="color:var(--accent)">● Bận (${busy})</span>
      <span style="color:var(--blue)">● Đặt trước (${reserved})</span>
    `;
  }
}

// ── Render: Menu Grid ──
function renderMenuGrid(filter = 'all') {
  const container = document.getElementById('menuGrid');
  if (!container) return;

  const filtered = filter === 'all' ? menuItems : menuItems.filter(m => m.cat === filter);
  container.innerHTML = filtered.map(m => `
    <div class="menu-card">
      <div class="menu-img">${m.emoji}</div>
      <div class="menu-info">
        <div class="menu-name">${m.name}</div>
        <div class="menu-cat">${m.cat === 'main' ? 'Món chính' : m.cat === 'starter' ? 'Khai vị' : 'Đồ uống'}</div>
        <div class="menu-footer">
          <div class="menu-price">${m.price.toLocaleString('vi')}đ</div>
          <div class="menu-avail ${m.available ? 'avail-yes' : 'avail-no'}">${m.available ? 'Còn' : 'Hết'}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Render: Tables Big Grid ──
function renderTablesGrid() {
  const container = document.getElementById('tablesGrid');
  if (!container) return;

  const colorMap = { free: 'tc-free tf', busy: 'tc-busy tb', reserved: 'tc-reserved tr2' };
  const labelColor = { free: 'var(--green)', busy: 'var(--accent)', reserved: 'var(--blue)' };

  container.innerHTML = tables.map(t => `
    <div class="table-card ${colorMap[t.status].split(' ')[0]}">
      <div class="table-card-num ${colorMap[t.status].split(' ')[1]}">${String(t.num).padStart(2,'0')}</div>
      <div class="table-card-seats">${t.seats} chỗ ngồi</div>
      <div class="table-card-status" style="color:${labelColor[t.status]}">
        ● ${t.label}${t.note ? ' — ' + t.note : ''}
      </div>
    </div>
  `).join('');
}

// ── Render: Staff Table ──
function renderStaffTable() {
  const tbody = document.getElementById('staffTableBody');
  if (!tbody) return;

  tbody.innerHTML = staff.map(s => `
    <tr>
      <td>
        <div class="staff-name">
          <div class="s-avatar" style="background:${s.color}">${s.name[0]}</div>
          ${s.name}
        </div>
      </td>
      <td style="color:var(--muted)">${s.role}</td>
      <td>${s.shift}</td>
      <td style="color:var(--muted)">${s.phone}</td>
      <td><span class="status-badge ${s.status}">${s.statusLabel}</span></td>
    </tr>
  `).join('');
}

// ── Menu filter buttons ──
function initMenuFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenuGrid(btn.dataset.cat);
    });
  });

  const searchBox = document.getElementById('menuSearch');
  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.menu-card').forEach(card => {
        const name = card.querySelector('.menu-name').textContent.toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }
}

// ── Nav click listeners ──
function initNavigation() {
  document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
    item.addEventListener('click', () => showScreen(item.dataset.screen));
  });
}

// ── Init: chạy khi trang load ──
document.addEventListener('DOMContentLoaded', () => {
  renderRecentOrders();
  renderTableMiniGrid();
  renderMenuGrid();
  renderTablesGrid();
  renderStaffTable();
  initMenuFilters();
  initNavigation();
});