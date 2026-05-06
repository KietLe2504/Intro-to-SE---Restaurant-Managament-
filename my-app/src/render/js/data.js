/* ============================================================
   data.js — Centralized data + sessionStorage sync
   Data được lưu vào sessionStorage để không bị reset
   khi chuyển trang trong Electron
   ============================================================ */

// ── Helpers lưu/đọc từ sessionStorage ──────────────────────

function loadFromStorage(key, defaultValue) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ── Default data ────────────────────────────────────────────

const DEFAULT_USERS = [
  { id: 'u1', name: 'Nguyễn Quản Lý', username: 'manager',  password: '123456', role: 'manager', phone: '0901 111 222', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Trần Thị Phục',  username: 'staff1',   password: '123456', role: 'staff',   phone: '0902 333 444', createdAt: '2024-02-01' },
  { id: 'u3', name: 'Lê Văn Bếp',     username: 'staff2',   password: '123456', role: 'staff',   phone: '0903 555 666', createdAt: '2024-03-01' },
  { id: 'u4', name: 'Phạm Thu Ngân',  username: 'staff3',   password: '123456', role: 'staff',   phone: '0904 777 888', createdAt: '2024-03-15' },
];

const DEFAULT_TABLES = [
  { id: 't1',  num: 1,  seats: 4, currentGuests: 0, status: 'free',     reservedAt: null },
  { id: 't2',  num: 2,  seats: 2, currentGuests: 2, status: 'full',     reservedAt: null },
  { id: 't3',  num: 3,  seats: 6, currentGuests: 3, status: 'partial',  reservedAt: null },
  { id: 't4',  num: 4,  seats: 4, currentGuests: 0, status: 'reserved', reservedAt: '19:00' },
  { id: 't5',  num: 5,  seats: 4, currentGuests: 0, status: 'free',     reservedAt: null },
  { id: 't6',  num: 6,  seats: 8, currentGuests: 8, status: 'full',     reservedAt: null },
  { id: 't7',  num: 7,  seats: 2, currentGuests: 0, status: 'free',     reservedAt: null },
  { id: 't8',  num: 8,  seats: 6, currentGuests: 0, status: 'reserved', reservedAt: '20:00' },
  { id: 't9',  num: 9,  seats: 4, currentGuests: 4, status: 'full',     reservedAt: null },
  { id: 't10', num: 10, seats: 4, currentGuests: 2, status: 'partial',  reservedAt: null },
  { id: 't11', num: 11, seats: 2, currentGuests: 0, status: 'free',     reservedAt: null },
  { id: 't12', num: 12, seats: 4, currentGuests: 4, status: 'full',     reservedAt: null },
];

const DEFAULT_MENU = [
  { id: 'm1',  name: 'Chả giò',           cat: 'starter', emoji: '🥟', price: 65000,  available: true  },
  { id: 'm2',  name: 'Salad gỏi ngó sen', cat: 'starter', emoji: '🥗', price: 75000,  available: true  },
  { id: 'm3',  name: 'Bánh cuốn',         cat: 'starter', emoji: '🫔', price: 55000,  available: true  },
  { id: 'm4',  name: 'Bò lúc lắc',        cat: 'main',    emoji: '🥩', price: 185000, available: true  },
  { id: 'm5',  name: 'Gà nướng mật ong',  cat: 'main',    emoji: '🍗', price: 160000, available: true  },
  { id: 'm6',  name: 'Phở bò đặc biệt',   cat: 'main',    emoji: '🍜', price: 85000,  available: true  },
  { id: 'm7',  name: 'Cơm tấm sườn',      cat: 'main',    emoji: '🍚', price: 75000,  available: true  },
  { id: 'm8',  name: 'Lẩu thái hải sản',  cat: 'main',    emoji: '🍲', price: 380000, available: false },
  { id: 'm9',  name: 'Bún bò Huế',        cat: 'main',    emoji: '🍵', price: 80000,  available: true  },
  { id: 'm10', name: 'Chè đậu xanh',      cat: 'dessert', emoji: '🍮', price: 35000,  available: true  },
  { id: 'm11', name: 'Bánh flan',         cat: 'dessert', emoji: '🍯', price: 30000,  available: true  },
  { id: 'm12', name: 'Nước cam tươi',     cat: 'drink',   emoji: '🧃', price: 45000,  available: true  },
  { id: 'm13', name: 'Bia lon',           cat: 'drink',   emoji: '🍺', price: 30000,  available: true  },
  { id: 'm14', name: 'Trà đá',            cat: 'drink',   emoji: '🧋', price: 15000,  available: true  },
  { id: 'm15', name: 'Cà phê sữa đá',    cat: 'drink',   emoji: '☕', price: 35000,  available: true  },
];

const DEFAULT_ORDERS = [
  {
    id: 'ord-001', tableId: 't2', staffId: 'u2', staffName: 'Trần Thị Phục',
    status: 'unpaid',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      { menuId: 'm4', name: 'Bò lúc lắc',      price: 185000, qty: 1, served: true  },
      { menuId: 'm6', name: 'Phở bò đặc biệt', price: 85000,  qty: 2, served: false },
      { menuId: 'm12', name: 'Nước cam tươi',  price: 45000,  qty: 2, served: true  },
    ],
  },
  {
    id: 'ord-002', tableId: 't3', staffId: 'u2', staffName: 'Trần Thị Phục',
    status: 'unpaid',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    items: [
      { menuId: 'm5', name: 'Gà nướng mật ong', price: 160000, qty: 1, served: true },
      { menuId: 'm1', name: 'Chả giò',          price: 65000,  qty: 1, served: true },
      { menuId: 'm13', name: 'Bia lon',          price: 30000,  qty: 3, served: true },
    ],
  },
  {
    id: 'ord-003', tableId: 't6', staffId: 'u3', staffName: 'Lê Văn Bếp',
    status: 'paid',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    items: [
      { menuId: 'm7', name: 'Cơm tấm sườn', price: 75000, qty: 4, served: true },
      { menuId: 'm14', name: 'Trà đá',       price: 15000, qty: 4, served: true },
    ],
  },
];

// ── Load data (từ sessionStorage nếu có, không thì dùng default) ──

export const users   = loadFromStorage('ros_users',   DEFAULT_USERS);
export const tables  = loadFromStorage('ros_tables',  DEFAULT_TABLES);
export const menuItems = loadFromStorage('ros_menu',  DEFAULT_MENU);
export const orders  = loadFromStorage('ros_orders',  DEFAULT_ORDERS);

// Lưu default vào sessionStorage nếu chưa có
if (!sessionStorage.getItem('ros_users'))  saveToStorage('ros_users',  users);
if (!sessionStorage.getItem('ros_tables')) saveToStorage('ros_tables', tables);
if (!sessionStorage.getItem('ros_menu'))   saveToStorage('ros_menu',   menuItems);
if (!sessionStorage.getItem('ros_orders')) saveToStorage('ros_orders', orders);

// ── Sync helpers — gọi sau mỗi lần thay đổi data ───────────

export function syncUsers()   { saveToStorage('ros_users',  users);   }
export function syncTables()  { saveToStorage('ros_tables', tables);  }
export function syncOrders()  { saveToStorage('ros_orders', orders);  }
export function syncMenu()    { saveToStorage('ros_menu',   menuItems); }

// ── Helpers ─────────────────────────────────────────────────

export function calcOrderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getTableStatus(table) {
  if (table.status === 'reserved') return 'reserved';
  if (table.currentGuests === 0)   return 'free';
  if (table.currentGuests >= table.seats) return 'full';
  return 'partial';
}

export const TABLE_STATUS_LABEL = {
  free: 'Trống', partial: 'Chưa đầy', full: 'Đầy', reserved: 'Đặt trước',
};

export const ORDER_STATUS_LABEL = {
  unpaid: 'Chưa thanh toán', paid: 'Đã thanh toán', cancelled: 'Đã hủy',
};

export const CAT_LABEL = {
  starter: 'Khai vị', main: 'Món chính', dessert: 'Tráng miệng', drink: 'Đồ uống',
};

// ── Default promotions ──────────────────────────────────────

const DEFAULT_PROMOTIONS = [
  {
    id: 'promo-001',
    name: 'Giảm 10% cuối tuần',
    code: 'WEEKEND10',
    type: 'percent',      // 'percent' | 'fixed'
    value: 10,            // 10% hoặc 10,000đ
    minOrder: 200000,     // đơn tối thiểu
    active: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'promo-002',
    name: 'Giảm 50k cho đơn từ 500k',
    code: 'SAVE50K',
    type: 'fixed',
    value: 50000,
    minOrder: 500000,
    active: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'promo-003',
    name: 'Khai trương giảm 20%',
    code: 'GRAND20',
    type: 'percent',
    value: 20,
    minOrder: 0,
    active: false,
    createdAt: '2024-03-01',
  },
];

export const promotions = loadFromStorage('ros_promotions', DEFAULT_PROMOTIONS);
if (!sessionStorage.getItem('ros_promotions')) saveToStorage('ros_promotions', promotions);

export function syncPromotions() { saveToStorage('ros_promotions', promotions); }

/**
 * Tính số tiền giảm của một promotion cho tổng đơn
 * @param {Object} promo
 * @param {number} orderTotal
 * @returns {number} số tiền được giảm
 */
export function calcDiscount(promo, orderTotal) {
  if (!promo || !promo.active) return 0;
  if (orderTotal < promo.minOrder) return 0;
  if (promo.type === 'percent') {
    return Math.round(orderTotal * promo.value / 100);
  }
  return Math.min(promo.value, orderTotal); // không giảm quá tổng đơn
}

/**
 * Tìm promotion theo code (không phân biệt hoa thường)
 * @param {string} code
 * @returns {Object|null}
 */
export function findPromoByCode(code) {
  return promotions.find(p => p.code.toLowerCase() === code.trim().toLowerCase() && p.active) || null;
}