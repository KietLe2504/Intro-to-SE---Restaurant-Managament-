/* ============================================================
   data.js — Centralized mock data + app state
   Thay bằng fetch() API thật ở đây khi cần
   ============================================================ */

// ── Users ──────────────────────────────────────────────────
export const users = [
    { id: 'u1', name: 'Nguyễn Quản Lý', username: 'manager',  password: '123456', role: 'manager', phone: '0901 111 222', createdAt: '2024-01-01' },
    { id: 'u2', name: 'Trần Thị Phục',  username: 'staff1',   password: '123456', role: 'staff',   phone: '0902 333 444', createdAt: '2024-02-01' },
    { id: 'u3', name: 'Lê Văn Bếp',     username: 'staff2',   password: '123456', role: 'staff',   phone: '0903 555 666', createdAt: '2024-03-01' },
    { id: 'u4', name: 'Phạm Thu Ngân',  username: 'staff3',   password: '123456', role: 'staff',   phone: '0904 777 888', createdAt: '2024-03-15' },
  ];
  
  // ── Tables ─────────────────────────────────────────────────
  export const tables = [
    { id: 't1',  num: 1,  seats: 4,  currentGuests: 0,  status: 'free',     reservedAt: null },
    { id: 't2',  num: 2,  seats: 2,  currentGuests: 2,  status: 'full',     reservedAt: null },
    { id: 't3',  num: 3,  seats: 6,  currentGuests: 3,  status: 'partial',  reservedAt: null },
    { id: 't4',  num: 4,  seats: 4,  currentGuests: 0,  status: 'reserved', reservedAt: '19:00' },
    { id: 't5',  num: 5,  seats: 4,  currentGuests: 0,  status: 'free',     reservedAt: null },
    { id: 't6',  num: 6,  seats: 8,  currentGuests: 8,  status: 'full',     reservedAt: null },
    { id: 't7',  num: 7,  seats: 2,  currentGuests: 0,  status: 'free',     reservedAt: null },
    { id: 't8',  num: 8,  seats: 6,  currentGuests: 0,  status: 'reserved', reservedAt: '20:00' },
    { id: 't9',  num: 9,  seats: 4,  currentGuests: 4,  status: 'full',     reservedAt: null },
    { id: 't10', num: 10, seats: 4,  currentGuests: 2,  status: 'partial',  reservedAt: null },
    { id: 't11', num: 11, seats: 2,  currentGuests: 0,  status: 'free',     reservedAt: null },
    { id: 't12', num: 12, seats: 4,  currentGuests: 4,  status: 'full',     reservedAt: null },
  ];
  
  // ── Menu Items ─────────────────────────────────────────────
  export const menuItems = [
    // Khai vị
    { id: 'm1',  name: 'Chả giò',           cat: 'starter', emoji: '🥟', price: 65000,  available: true  },
    { id: 'm2',  name: 'Salad gỏi ngó sen', cat: 'starter', emoji: '🥗', price: 75000,  available: true  },
    { id: 'm3',  name: 'Bánh cuốn',         cat: 'starter', emoji: '🫔', price: 55000,  available: true  },
    // Món chính
    { id: 'm4',  name: 'Bò lúc lắc',        cat: 'main',    emoji: '🥩', price: 185000, available: true  },
    { id: 'm5',  name: 'Gà nướng mật ong',  cat: 'main',    emoji: '🍗', price: 160000, available: true  },
    { id: 'm6',  name: 'Phở bò đặc biệt',   cat: 'main',    emoji: '🍜', price: 85000,  available: true  },
    { id: 'm7',  name: 'Cơm tấm sườn',      cat: 'main',    emoji: '🍚', price: 75000,  available: true  },
    { id: 'm8',  name: 'Lẩu thái hải sản',  cat: 'main',    emoji: '🍲', price: 380000, available: false },
    { id: 'm9',  name: 'Bún bò Huế',        cat: 'main',    emoji: '🍵', price: 80000,  available: true  },
    // Tráng miệng
    { id: 'm10', name: 'Chè đậu xanh',      cat: 'dessert', emoji: '🍮', price: 35000,  available: true  },
    { id: 'm11', name: 'Bánh flan',         cat: 'dessert', emoji: '🍯', price: 30000,  available: true  },
    // Đồ uống
    { id: 'm12', name: 'Nước cam tươi',     cat: 'drink',   emoji: '🧃', price: 45000,  available: true  },
    { id: 'm13', name: 'Bia lon',           cat: 'drink',   emoji: '🍺', price: 30000,  available: true  },
    { id: 'm14', name: 'Trà đá',            cat: 'drink',   emoji: '🧋', price: 15000,  available: true  },
    { id: 'm15', name: 'Cà phê sữa đá',    cat: 'drink',   emoji: '☕', price: 35000,  available: true  },
  ];
  
  // ── Orders ─────────────────────────────────────────────────
  export let orders = [
    {
      id: 'ord-001', tableId: 't2', staffId: 'u2', staffName: 'Trần Thị Phục',
      status: 'unpaid', // unpaid | paid | cancelled
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      items: [
        { menuId: 'm4', name: 'Bò lúc lắc',       price: 185000, qty: 1, served: true  },
        { menuId: 'm6', name: 'Phở bò đặc biệt',  price: 85000,  qty: 2, served: false },
        { menuId: 'm12', name: 'Nước cam tươi',   price: 45000,  qty: 2, served: true  },
      ]
    },
    {
      id: 'ord-002', tableId: 't3', staffId: 'u2', staffName: 'Trần Thị Phục',
      status: 'unpaid',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      items: [
        { menuId: 'm5', name: 'Gà nướng mật ong', price: 160000, qty: 1, served: true },
        { menuId: 'm1', name: 'Chả giò',          price: 65000,  qty: 1, served: true },
        { menuId: 'm13', name: 'Bia lon',         price: 30000,  qty: 3, served: true },
      ]
    },
    {
      id: 'ord-003', tableId: 't6', staffId: 'u3', staffName: 'Lê Văn Bếp',
      status: 'paid',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      items: [
        { menuId: 'm7', name: 'Cơm tấm sườn',    price: 75000,  qty: 4, served: true },
        { menuId: 'm14', name: 'Trà đá',         price: 15000,  qty: 4, served: true },
      ]
    },
    {
      id: 'ord-004', tableId: 't9', staffId: 'u4', staffName: 'Phạm Thu Ngân',
      status: 'cancelled',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      items: [
        { menuId: 'm8', name: 'Lẩu thái hải sản', price: 380000, qty: 1, served: false },
      ]
    },
  ];
  
  // ── Helpers ────────────────────────────────────────────────
  
  /**
   * Tính tổng tiền của một đơn
   * @param {Object} order
   * @returns {number}
   */
  export function calcOrderTotal(order) {
    return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
  
  /**
   * Lấy trạng thái bàn theo số khách / chỗ ngồi
   * @param {Object} table
   * @returns {'free'|'partial'|'full'|'reserved'}
   */
  export function getTableStatus(table) {
    if (table.status === 'reserved') return 'reserved';
    if (table.currentGuests === 0)   return 'free';
    if (table.currentGuests >= table.seats) return 'full';
    return 'partial';
  }
  
  /**
   * Label tiếng Việt cho trạng thái bàn
   */
  export const TABLE_STATUS_LABEL = {
    free:     'Trống',
    partial:  'Chưa đầy',
    full:     'Đầy',
    reserved: 'Đặt trước',
  };
  
  /**
   * Label tiếng Việt cho trạng thái đơn
   */
  export const ORDER_STATUS_LABEL = {
    unpaid:    'Chưa thanh toán',
    paid:      'Đã thanh toán',
    cancelled: 'Đã hủy',
  };
  
  export const CAT_LABEL = {
    starter: 'Khai vị',
    main:    'Món chính',
    dessert: 'Tráng miệng',
    drink:   'Đồ uống',
  };