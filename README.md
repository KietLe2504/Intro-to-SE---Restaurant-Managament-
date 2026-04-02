# RestaurantOS — Restaurant Management Desktop App

A desktop application for restaurant management built with **Electron + Vite**.  
Manages tables, menu items, orders, and staff through a clean dark-mode UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron |
| Build tool | Vite |
| Main process | TypeScript |
| Renderer (UI) | HTML + CSS + Vanilla JS (ES Modules) |

---

## Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org/) v18 or higher (project uses v24)
- npm v9 or higher (project uses v11)

Check your versions:
```bash
node -v
npm -v
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Intro-to-SE---Restaurant-Managament-.git
cd Intro-to-SE---Restaurant-Managament-/my-app
```

### 2. Install dependencies

```bash
npm install
```

> You may see some deprecation warnings — this is normal and does not affect functionality.

### 3. Run in development mode

```bash
npm run dev
```

A desktop window will launch automatically.

---

## Project Structure

```
my-app/
├── electron/                  # Main process (Electron / Node.js)
│   ├── main.ts                # App entry point, creates the window
│   └── preload.ts             # Bridge between Electron and renderer
│
├── src/
│   └── render/                # Renderer process (what the user sees)
│       ├── index.html         # Main HTML shell
│       ├── styles/
│       │   ├── main.css       # CSS variables, layout, sidebar
│       │   ├── components.css # Reusable UI components (buttons, badges, cards)
│       │   └── screens.css    # Per-screen styles
│       └── js/
│           ├── data.js        # All mock data (tables, menu, staff, orders)
│           ├── navigation.js  # Screen switching + rendering logic
│           └── order.js       # Order/billing logic
│
├── vite.config.ts             # Vite + Electron build configuration
├── package.json
└── tsconfig.json
```

---

## Features

- **Dashboard** — revenue stats, live table map, recent orders
- **Table management** — view status (free / busy / reserved) for all tables
- **Menu management** — browse and filter food items by category
- **Order / billing** — select a table, add items, calculate total
- **Staff management** — view staff roster, shifts, and working status

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the app in development mode with hot reload |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build |

---

## Notes for Contributors

- **Adding a new screen:** add data to `js/data.js`, add render logic to `js/navigation.js`, add styles to `styles/screens.css`, add the HTML block in `index.html`, and register it in `PAGE_CONFIG` inside `navigation.js`.
- **Changing mock data:** all sample data lives in `js/data.js` — edit only that file to update what appears in the UI.
- **Styling:** global CSS variables (colors, fonts, spacing) are defined at the top of `styles/main.css`.


# Function Documentation — RestaurantOS

---

## js/navigation.js

---

### `showScreen(name)`

**Description:** Chuyển màn hình hiển thị trong app. Ẩn tất cả các screen hiện tại, hiện screen được chỉ định, cập nhật trạng thái active của nav sidebar và cập nhật tiêu đề trên header.

**Input:**
| Parameter | Type | Description |
|---|---|---|
| `name` | `string` | Tên màn hình cần hiển thị. Các giá trị hợp lệ: `'dashboard'`, `'menu'`, `'tables'`, `'staff'`, `'order'` |

**Output:** `void` — không trả về giá trị. Cập nhật trực tiếp lên DOM.

**Example:**
```js
showScreen('menu')
// → Hiện màn hình thực đơn, cập nhật sidebar active, header title = "Thực đơn"
```

---

### `renderRecentOrders()`

**Description:** Đọc dữ liệu từ mảng `recentOrders` trong `data.js` và render danh sách đơn gần đây vào phần tử `#recentOrders` trên Dashboard.

**Input:** Không có tham số. Dữ liệu lấy từ `recentOrders` (import từ `data.js`).

**Output:** `void` — inject HTML vào `#recentOrders`.

---

### `renderTableMiniGrid()`

**Description:** Render sơ đồ bàn dạng lưới nhỏ trên Dashboard. Mỗi bàn hiển thị số bàn và màu trạng thái (xanh = trống, cam = bận, xanh dương = đặt trước). Đồng thời cập nhật chú thích số lượng bên dưới.

**Input:** Không có tham số. Dữ liệu lấy từ `tables` (import từ `data.js`).

**Output:** `void` — inject HTML vào `#tableGrid` và `#tableLegend`.

---

### `renderMenuGrid(filter)`

**Description:** Render danh sách món ăn dạng card trên màn hình Thực đơn. Có thể lọc theo danh mục. Mỗi card hiển thị emoji, tên món, danh mục, giá và trạng thái còn/hết.

**Input:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `filter` | `string` | `'all'` | Danh mục cần lọc. Các giá trị hợp lệ: `'all'`, `'main'`, `'starter'`, `'drink'` |

**Output:** `void` — inject HTML vào `#menuGrid`.

**Example:**
```js
renderMenuGrid('drink')
// → Chỉ hiển thị các món thuộc danh mục đồ uống
```

---

### `renderTablesGrid()`

**Description:** Render danh sách bàn dạng card lớn trên màn hình Quản lý bàn. Mỗi card hiển thị số bàn, số chỗ ngồi, trạng thái và giờ đặt trước (nếu có).

**Input:** Không có tham số. Dữ liệu lấy từ `tables` (import từ `data.js`).

**Output:** `void` — inject HTML vào `#tablesGrid`.

---

### `renderStaffTable()`

**Description:** Render bảng danh sách nhân viên trên màn hình Quản lý nhân viên. Mỗi hàng hiển thị avatar, họ tên, chức vụ, ca làm, số điện thoại và trạng thái làm việc.

**Input:** Không có tham số. Dữ liệu lấy từ `staff` (import từ `data.js`).

**Output:** `void` — inject HTML vào `#staffTableBody`.

---

### `initMenuFilters()`

**Description:** Gắn event listener cho các nút lọc danh mục (Tất cả / Món chính / Khai vị / Đồ uống) và ô tìm kiếm trên màn hình Thực đơn. Khi người dùng click nút lọc thì gọi `renderMenuGrid()` với filter tương ứng. Khi gõ vào ô tìm kiếm thì ẩn/hiện card theo tên món.

**Input:** Không có tham số. Tự tìm các phần tử `.filter-btn` và `#menuSearch` trong DOM.

**Output:** `void` — gắn event listeners lên DOM.

---

### `initNavigation()`

**Description:** Gắn event listener `click` cho tất cả các item trong sidebar nav. Khi người dùng click vào một mục, gọi `showScreen()` với tên màn hình tương ứng từ thuộc tính `data-screen`.

**Input:** Không có tham số. Tự tìm các phần tử `.nav-item[data-screen]` trong DOM.

**Output:** `void` — gắn event listeners lên DOM.

---

---

## js/order.js

---

### `addToBill(name, price)`

**Description:** Thêm một món ăn vào đơn hiện tại. Nếu món đã có trong đơn thì tăng số lượng lên 1. Nếu chưa có thì tạo mới với số lượng là 1. Sau đó tự động gọi `renderBill()` để cập nhật giao diện.

**Input:**
| Parameter | Type | Description |
|---|---|---|
| `name` | `string` | Tên món ăn (dùng làm key trong object `bill`) |
| `price` | `number` | Giá một phần của món (đơn vị: VNĐ) |

**Output:** `void` — cập nhật object `bill` nội bộ và gọi `renderBill()`.

**Example:**
```js
addToBill('Bò lúc lắc', 185000)
// bill = { 'Bò lúc lắc': { price: 185000, qty: 1 } }

addToBill('Bò lúc lắc', 185000)
// bill = { 'Bò lúc lắc': { price: 185000, qty: 2 } }
```

---

### `changeQty(name, delta)`

**Description:** Tăng hoặc giảm số lượng của một món trong đơn. Nếu số lượng giảm xuống 0 hoặc âm thì xóa món đó khỏi đơn. Sau đó tự động gọi `renderBill()`.

**Input:**
| Parameter | Type | Description |
|---|---|---|
| `name` | `string` | Tên món cần thay đổi số lượng |
| `delta` | `number` | Số lượng thay đổi. `+1` để tăng, `-1` để giảm |

**Output:** `void` — cập nhật object `bill` nội bộ và gọi `renderBill()`.

**Example:**
```js
changeQty('Bò lúc lắc', -1)
// Giảm số lượng Bò lúc lắc xuống 1

changeQty('Bò lúc lắc', -1)
// qty = 0 → xóa món khỏi đơn
```

---

### `renderBill()`

**Description:** Render lại toàn bộ hoá đơn bên phải màn hình Gọi món dựa trên state hiện tại của object `bill`. Nếu đơn trống thì hiện thông báo placeholder. Tính và hiển thị tổng tiền.

**Input:** Không có tham số. Đọc trực tiếp từ object `bill` nội bộ.

**Output:** `void` — inject HTML vào `#billItems`, cập nhật text `#billTotal`.

---

### `renderOrderMenu()`

**Description:** Render danh sách món có thể gọi (bên trái màn hình Gọi món). Chỉ hiển thị các món có `available: true` từ `menuItems`. Mỗi card gắn `data-name` và `data-price` để dùng khi click thêm vào đơn.

**Input:** Không có tham số. Dữ liệu lấy từ `menuItems` (import từ `data.js`), lọc chỉ lấy `available === true`.

**Output:** `void` — inject HTML vào `#orderMenuGrid`.

---

### `submitOrder()`

**Description:** Xác nhận và gửi đơn xuống bếp. Kiểm tra nếu đơn trống thì hiện cảnh báo. Nếu có món thì hiện thông báo thành công, xóa toàn bộ đơn hiện tại và reset giao diện về trạng thái ban đầu.

**Input:** Không có tham số. Đọc state từ object `bill` nội bộ.

**Output:** `void` — reset object `bill` về `{}`, gọi `renderBill()` để làm trống giao diện.

---

---

## js/data.js

> File này không chứa hàm — chỉ export dữ liệu tĩnh dạng mảng. Sau này thay bằng `fetch()` đến API thật mà không cần sửa file khác.

| Export | Type | Description |
|---|---|---|
| `recentOrders` | `Array<Object>` | Danh sách đơn gần đây hiển thị trên Dashboard |
| `tables` | `Array<Object>` | Danh sách 15 bàn với trạng thái và số chỗ |
| `menuItems` | `Array<Object>` | Danh sách món ăn với giá, danh mục và trạng thái còn hàng |
| `staff` | `Array<Object>` | Danh sách nhân viên với ca làm và trạng thái |
