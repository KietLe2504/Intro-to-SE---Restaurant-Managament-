/* ─────────────────────────────────────────
   data.js  —  Dữ liệu mẫu toàn bộ app
   Sau này chỉ cần thay bằng fetch() API thật
   mà không cần sửa file khác
───────────────────────────────────────── */

export const recentOrders = [
    { id: '#038', table: 'Bàn 5', items: 'Bò lúc lắc, Cơm chiên, Nước cam', price: '285,000đ', status: 's-cooking', label: 'Đang nấu' },
    { id: '#037', table: 'Bàn 2', items: 'Gà nướng, Salad, Bia',            price: '320,000đ', status: 's-waiting', label: 'Chờ phục vụ' },
    { id: '#036', table: 'Bàn 9', items: 'Lẩu thái, Rau, 2x Nước ngọt',    price: '520,000đ', status: 's-done',    label: 'Xong' },
    { id: '#035', table: 'Bàn 1', items: 'Phở bò, Chả giò',                 price: '155,000đ', status: 's-done',    label: 'Xong' },
  ];
  
  export const tables = [
    { num: 1,  seats: 4, status: 'free',     label: 'Trống',           note: '' },
    { num: 2,  seats: 2, status: 'busy',     label: 'Đang phục vụ',    note: '' },
    { num: 3,  seats: 6, status: 'busy',     label: 'Đang phục vụ',    note: '' },
    { num: 4,  seats: 4, status: 'reserved', label: 'Đặt trước',       note: '19:00' },
    { num: 5,  seats: 4, status: 'free',     label: 'Trống',           note: '' },
    { num: 6,  seats: 8, status: 'busy',     label: 'Đang phục vụ',    note: '' },
    { num: 7,  seats: 2, status: 'free',     label: 'Trống',           note: '' },
    { num: 8,  seats: 6, status: 'reserved', label: 'Đặt trước',       note: '20:00' },
    { num: 9,  seats: 4, status: 'busy',     label: 'Đang phục vụ',    note: '' },
    { num: 10, seats: 4, status: 'free',     label: 'Trống',           note: '' },
    { num: 11, seats: 2, status: 'free',     label: 'Trống',           note: '' },
    { num: 12, seats: 4, status: 'busy',     label: 'Đang phục vụ',    note: '' },
    { num: 13, seats: 6, status: 'free',     label: 'Trống',           note: '' },
    { num: 14, seats: 4, status: 'reserved', label: 'Đặt trước',       note: '20:30' },
    { num: 15, seats: 8, status: 'busy',     label: 'Đang phục vụ',    note: '' },
  ];
  
  export const menuItems = [
    { name: 'Bò lúc lắc',       cat: 'main',    emoji: '🥩', price: 185000, available: true },
    { name: 'Gà nướng mật ong', cat: 'main',    emoji: '🍗', price: 160000, available: true },
    { name: 'Phở bò đặc biệt',  cat: 'main',    emoji: '🍜', price: 85000,  available: true },
    { name: 'Salad Caesar',     cat: 'starter', emoji: '🥗', price: 75000,  available: true },
    { name: 'Lẩu thái hải sản', cat: 'main',    emoji: '🍲', price: 380000, available: false },
    { name: 'Nước cam tươi',    cat: 'drink',   emoji: '🧃', price: 45000,  available: true },
    { name: 'Bia lon',          cat: 'drink',   emoji: '🍺', price: 30000,  available: true },
    { name: 'Chả giò',          cat: 'starter', emoji: '🥟', price: 65000,  available: true },
    { name: 'Cơm chiên',        cat: 'main',    emoji: '🍚', price: 70000,  available: true },
  ];
  
  export const staff = [
    { name: 'Nguyễn Văn An',  role: 'Phục vụ',   shift: '08:00 – 16:00', phone: '0901 234 567', status: 's-done',    statusLabel: 'Đang làm',    color: '#7c3aed' },
    { name: 'Trần Thị Bích',  role: 'Bếp trưởng', shift: '08:00 – 16:00', phone: '0912 345 678', status: 's-done',    statusLabel: 'Đang làm',    color: '#0891b2' },
    { name: 'Lê Minh Châu',   role: 'Phục vụ',   shift: '16:00 – 22:00', phone: '0923 456 789', status: 's-waiting', statusLabel: 'Chưa vào ca', color: '#b45309' },
    { name: 'Phạm Hùng Dũng', role: 'Bếp phụ',   shift: '08:00 – 16:00', phone: '0934 567 890', status: 's-done',    statusLabel: 'Đang làm',    color: '#be123c' },
    { name: 'Hoàng Thị Lan',  role: 'Thu ngân',  shift: '10:00 – 22:00', phone: '0945 678 901', status: 's-done',    statusLabel: 'Đang làm',    color: '#065f46' },
  ];