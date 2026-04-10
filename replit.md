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

### Conversational AI Homepage (Task 11)
- `Home.jsx` — Fully rebuilt as immersive booking experience. No below-fold content sections. Full-viewport dark navy/black gradient with animated gold particle background.
- `ConversationalBooker.jsx` — Multi-step wizard (6 steps): destination → pickup → date/time → passenger count → vehicle type → contact info. Features typewriter question animation, address autocomplete with voice input (Web Speech API), single-click passenger buttons, vehicle card selection, smooth slide transitions, progress dots.
- `LiveBidBoard.jsx` — Shown after ride post. Polls `GET /api/quote-requests/:id` every 5s for operator bids. Countdown timer (10 min), skeleton cards while waiting, animated bid cards slide in, "Book This Ride" CTA. Fallback after 2 min shows phone + WhatsApp.
- `Navbar.jsx` — Upgraded with dual megamenus: "Services" + "Explore" (Fleet, How It Works, Corporate) + Popular Routes dropdown with 8 SEO links.
- `QuoteRequestsTab.jsx` — Added "Send Bid" modal per lead: price, vehicle type, ETA, notes. Submits `PATCH /api/quote-requests/:id` with bid data.

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

## API
- Base URL: `VITE_API_URL` env var, defaults to `http://localhost:5000/api`
- Auth: JWT stored in `localStorage`, attached via Axios interceptor
- Quote Requests: `POST /api/quote-requests` (no auth), `GET /api/quote-requests` (operator), `PATCH /api/quote-requests/:id/status` (operator), `PATCH /api/quote-requests/:id` (operator bid), `GET /api/quote-requests/:id` (bid polling)

## Running
```
npm run dev   # Development (port 5000 or next available)
npm run build # Production build
```

## Backend Notes
This is a frontend-only repository. The backend must implement:
- `POST /api/quote-requests` — Store lead (no auth middleware)
- `GET /api/quote-requests` — List all leads (operator auth)
- `PATCH /api/quote-requests/:id/status` — Update lead status
- Table: `quote_requests` with fields: id, name, email, phone, pickup, dropoff, ride_date, passengers, vehicle_type, notes, status (new/contacted/booked), bid_price, eta_minutes, bids (array), created_at
