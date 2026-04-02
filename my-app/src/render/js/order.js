/* ─────────────────────────────────────────
   order.js  —  Logic màn hình Gọi món
   Tách riêng để dễ mở rộng sau này
───────────────────────────────────────── */

import { menuItems } from './data.js';

// State: giỏ đơn hiện tại  { 'Bò lúc lắc': { price: 185000, qty: 2 }, ... }
let bill = {};

// Thêm món vào đơn
function addToBill(name, price) {
  if (bill[name]) {
    bill[name].qty++;
  } else {
    bill[name] = { price, qty: 1 };
  }
  renderBill();
}

// Thay đổi số lượng (delta = +1 hoặc -1)
function changeQty(name, delta) {
  if (!bill[name]) return;
  bill[name].qty += delta;
  if (bill[name].qty <= 0) delete bill[name];
  renderBill();
}

// Render lại hoá đơn bên phải
function renderBill() {
  const container = document.getElementById('billItems');
  const totalEl   = document.getElementById('billTotal');
  if (!container || !totalEl) return;

  const keys = Object.keys(bill);
  if (keys.length === 0) {
    container.innerHTML = '<div class="bill-empty">Chọn món để thêm vào đơn</div>';
    totalEl.textContent = '0đ';
    return;
  }

  let total = 0;
  container.innerHTML = keys.map(name => {
    const item = bill[name];
    total += item.price * item.qty;
    return `
      <div class="bill-item">
        <div class="bill-item-name">${name}</div>
        <div class="bill-item-qty" data-action="decrease" data-name="${name}">−</div>
        <span style="font-size:13px;min-width:16px;text-align:center">${item.qty}</span>
        <div class="bill-item-qty" data-action="increase" data-name="${name}">+</div>
        <div class="bill-item-price">${(item.price * item.qty).toLocaleString('vi')}đ</div>
      </div>
    `;
  }).join('');

  totalEl.textContent = total.toLocaleString('vi') + 'đ';
}

// Render menu gọi món (bên trái)
function renderOrderMenu() {
  const grid = document.getElementById('orderMenuGrid');
  if (!grid) return;

  // Chỉ hiện món còn hàng
  const available = menuItems.filter(m => m.available);
  grid.innerHTML = available.map(m => `
    <div class="order-mini-card" data-name="${m.name}" data-price="${m.price}">
      <div class="order-mini-emoji">${m.emoji}</div>
      <div>
        <div class="order-mini-name">${m.name}</div>
        <div class="order-mini-price">${m.price.toLocaleString('vi')}đ</div>
      </div>
    </div>
  `).join('');
}

// Xác nhận đơn
function submitOrder() {
  if (Object.keys(bill).length === 0) {
    alert('Chưa có món nào trong đơn!');
    return;
  }
  alert('Đã gửi đơn xuống bếp!');
  bill = {};
  renderBill();
}

// ── Event delegation — gắn 1 listener thay vì nhiều onclick ──
document.addEventListener('DOMContentLoaded', () => {
  renderOrderMenu();

  // Click vào món → thêm vào đơn
  document.getElementById('orderMenuGrid')?.addEventListener('click', (e) => {
    const card = e.target.closest('.order-mini-card');
    if (!card) return;
    addToBill(card.dataset.name, Number(card.dataset.price));
  });

  // Click +/- trong hoá đơn
  document.getElementById('billItems')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const delta = btn.dataset.action === 'increase' ? 1 : -1;
    changeQty(btn.dataset.name, delta);
  });

  // Nút xác nhận
  document.getElementById('submitOrderBtn')?.addEventListener('click', submitOrder);
});