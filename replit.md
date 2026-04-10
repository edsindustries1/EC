# Everywhere Cars Frontend

## Overview
A React + Vite frontend for "Everywhere Cars" — a NYC luxury car service. The app serves multiple user roles (guest, customer, operator, admin) with role-based routing and authentication via JWT.

## Tech Stack
- **React 18** + **Vite 5**
- **Tailwind CSS 3** for styling
- **React Router DOM 6** for routing
- **Axios** for API communication (`src/utils/api.js`)
- **React Hot Toast** for notifications
- **React Icons** (Feather Icons set)
- **date-fns** for date formatting

## Architecture

### Entry Points
- `src/main.jsx` — React root mount
- `src/App.jsx` — Central router + layout (Navbar, Footer, WhatsAppWidget)
- `src/context/AuthContext.jsx` — JWT auth context

### Page Structure
- `src/pages/` — All pages organized by role:
  - `Home.jsx`, `Fleet.jsx`, `HowItWorks.jsx`, etc. — Public pages
  - `Quote.jsx` — **Public quote form** (no auth required)
  - `transfers/` — 8 SEO landing pages for route keywords
  - `auth/` — Login & Signup
  - `customer/` — BookRide, MyRides, RideDetails
  - `operator/` — Dashboard (with Quote Requests tab), Requests, Drivers, Revenue, Users
  - `admin/` — Dashboard, Users, Revenue

### Components
- `Navbar.jsx` — Sticky nav, role-aware, "Get a Quote" CTA for guests
- `Footer.jsx` — Footer links
- `WhatsAppWidget.jsx` — Fixed bottom-right WhatsApp floating button (wa.me/17182196683) with pulse animation
- `PlaceAutocomplete.jsx` — Address autocomplete (Google Maps or Photon fallback)
- `QuoteRequestsTab.jsx` — Operator view for public quote leads
- `ProtectedRoute.jsx` — Role-based route guard
- `SplashScreen.jsx` — 5-second video splash on app load

## Key Features

### Intelligent Dispatch Homepage (Task 12)
- `Home.jsx` — Rebuilt as split-screen dispatch interface. Left 58%: `DispatchPanel`. Right 42%: `NYCActivityCanvas`. Shared pickup/dropoff state flows up and down to trigger route visualization on canvas. Below-fold trust strip (Licensed & Insured, 250+ Vehicles, 24/7 Support, phone). Dark `#050a0f` page background.
- `DispatchPanel.jsx` — 5-state booking glass card (idle → route → details → contact → bids). Features: simulated live stats bar (vehicles/response/rides), voice input with waveform, smart badges (airport/hotel/peak-hour), vehicle selector with live price estimate, gold "DISPATCH MY RIDE" CTA with pulse, full bid board with countdown/skeleton/BidCards, typewriter text in bid state.
- `NYCActivityCanvas.jsx` — Canvas-based NYC visualization: street grid, 28 animated electric-blue ride dots with trails, gold pickup marker and white dropoff marker with animated dashed route line between them (position mapped from city area keywords).
- `src/utils/priceEstimator.js` — Client-side price lookup. `getPriceEstimate(vehicleType, routeType) → { low, high }`. Smart detection: airport keywords (JFK/LGA/EWR/FBO), hotel chains, peak hours, route type (local/airport/long). `approximatePosition(text, W, H)` maps city areas to canvas coordinates.
- `Navbar.jsx` — Now transparent with `backdrop-filter: blur(4px)` on homepage only. On scroll past 60px: transitions to solid dark navy with shadow. Scroll listener + `useLocation` detection.
- **Deleted:** `ConversationalBooker.jsx`, `LiveBidBoard.jsx` (replaced by DispatchPanel states 3/4).

### Lead Generation (Task 10)
- `/quote` — Public quote form (no login required). Submits to `POST /api/quote-requests`.
- WhatsApp floating widget on all pages with pulse animation.
- 8 SEO route landing pages under `/transfers/:route` with H1, price range, FAQ, embedded quote form.
- Operator dashboard has a "Quote Requests" tab powered by `QuoteRequestsTab` component.

### SEO Transfer Routes
- `/transfers/jfk-to-manhattan`
- `/transfers/lga-to-manhattan`
- `/transfers/ewr-to-manhattan`
- `/transfers/jfk-to-brooklyn`
- `/transfers/manhattan-to-hamptons`
- `/transfers/nyc-to-philadelphia`
- `/transfers/nyc-to-connecticut`
- `/transfers/nyc-to-boston`

## API & Backend

### Backend (server/)
- Express.js API server running on **port 3001** (`server/index.js`)
- JSON file persistence at `server/data/db.json` (`server/db.js`)
- Vite dev proxy: all `/api/*` requests from the frontend → backend via `vite.config.js`
- `src/utils/api.js` uses relative `/api` base URL (proxied by Vite)

### Auth Accounts (seeded)
- **Operator:** `operator@everywherecars.com` / `operator123`
- **Admin:** `admin@everywherecars.com` / `admin123`

### Key Endpoints
- `POST /api/auth/login` / `POST /api/auth/register` / `GET /api/auth/me`
- `POST /api/quote-requests` — Customer dispatches a ride (no auth required)
- `GET /api/quote-requests` — Operator lists all incoming requests
- `GET /api/quote-requests/:id` — Customer polls for bids (returns `bids` array)
- `PATCH /api/quote-requests/:id` — Operator submits bid (`bid_price`, `eta_minutes`, `notes`) + also creates bid entry for polling
- `PATCH /api/quote-requests/:id/status` — Update request status
- `POST /api/quote-requests/:id/bids` — Explicit bid creation endpoint
- `GET /api/operator/dashboard` — Operator stats
- `GET /api/operator/requests` — Recent requests for operator dashboard
- `GET /api/drivers` / `POST /api/drivers` — Driver management
- `GET /api/revenue` — Revenue stats

### Dispatch Flow
1. Customer fills dispatch form → `POST /api/quote-requests` → saved with `status: pending`
2. Operator sees ride on their dashboard → "Quote Requests" tab
3. Operator clicks "Send Bid" → `PATCH /api/quote-requests/:id` with `bid_price`/`notes` → creates bid entry + sets status `quoted`
4. Customer's bid board polls `GET /api/quote-requests/:id` every 5s → bid appears with operator name, price, and ETA
5. Customer clicks "SELECT THIS RIDE" → navigated to `/signup` (if guest) or `/book` (if logged in)

## Running
```
node server/index.js   # API server on port 3001 (workflow: "Start API server")
npm run dev            # Vite frontend on port 5000 (workflow: "Start application")
```
