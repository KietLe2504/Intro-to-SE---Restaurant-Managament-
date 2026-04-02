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
