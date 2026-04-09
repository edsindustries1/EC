# Everywhere Cars Frontend - Setup Guide

## Project Overview

A professional React-based transportation marketplace with two sides:
- **Customer Side**: Public website for booking rides and viewing quotes
- **Operator Panel**: Internal dashboard for managing requests, pricing, and drivers

**Color Scheme**: Dark Blue (#1a365d) + White corporate branding

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone/navigate to the project directory:
```bash
cd everywhere-cars-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your API configuration:
```
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx
│   ├── StatusBadge.jsx
│   ├── StatsCard.jsx
│   ├── LoadingSpinner.jsx
│   ├── Modal.jsx
│   └── index.js
├── context/            # React context (Auth)
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── HowItWorks.jsx
│   ├── Profile.jsx
│   ├── Privacy.jsx
│   ├── Terms.jsx
│   ├── NotFound.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── customer/
│   │   ├── BookRide.jsx
│   │   └── MyRides.jsx
│   ├── operator/
│   │   ├── Dashboard.jsx
│   │   ├── Requests.jsx
│   │   └── Drivers.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       ├── Users.jsx
│       └── Revenue.jsx
├── utils/              # Utility functions
│   └── api.js          # Axios instance with auth interceptors
├── App.jsx             # Main app router
├── main.jsx            # React entry point
└── index.css           # Global styles & Tailwind directives

```

## Key Features

### Components

#### Navbar
- Responsive sticky navigation with mobile hamburger menu
- Dark blue gradient background
- Role-based navigation links
- Profile dropdown with logout

#### Footer
- Dark blue footer with 4 columns (Company, Services, Support, Legal)
- Social media links
- Copyright information

#### ProtectedRoute
- JWT-based authentication check
- Role-based access control
- Redirects unauthenticated users to login
- Shows "Access Denied" for unauthorized roles

#### StatusBadge
- Colored badges for ride statuses
- Statuses: pending, quoted, confirmed, assigned, in_progress, completed, cancelled

#### StatsCard
- Dashboard stat cards with icon, value, and change percentage
- Available colors: blue, green, red, purple, orange

#### LoadingSpinner
- Centered spinning animation with optional text

#### Modal
- Reusable modal with overlay, close button
- Click outside or press Escape to close
- Customizable sizes: sm, md, lg

### Context & Auth

**AuthContext** provides:
- `user`: Current logged-in user
- `loading`: Auth state loading
- `isAuthenticated`: Boolean auth status
- `login(email, password)`: Login function
- `register(name, email, password, phone)`: Registration function
- `logout()`: Logout function
- `useAuth()`: Custom hook to access context

### API Integration

**api.js** features:
- Axios instance with configurable baseURL
- Automatic JWT token injection in request headers
- 401 error handling with redirect to login
- Supports environment variable configuration

## Authentication Flow

1. User logs in via `/login` page
2. Credentials sent to `/api/auth/login`
3. Server returns JWT token and user data
4. Token stored in localStorage
5. Token automatically added to all API requests
6. On 401 response, user redirected to login

## Role-Based Access

Three user roles with different access:

- **customer**: Can book rides, view rides
- **operator**: Can manage requests, drivers, pricing
- **admin**: Full access to dashboard, users, revenue

Each protected route checks user role via `ProtectedRoute` component.

## Styling

- **Framework**: Tailwind CSS 3.3.6
- **Primary Colors**: Dark Blue (#1a365d) and variants
- **Secondary Colors**: Gray and accent colors
- **Font**: Inter from Google Fonts
- **Utilities**: Pre-built button, card, input, label classes

Custom Tailwind config in `tailwind.config.js`:
- Extended color palette with primary/secondary/accent colors
- Custom shadows for cards
- Custom animations (spin-slow, fade-in, slide-in-up)

## Environment Variables

```
VITE_API_URL         # Backend API URL (default: http://localhost:5000/api)
VITE_APP_NAME        # App name (default: Everywhere Cars)
VITE_APP_URL         # App URL (default: http://localhost:5173)
VITE_ENABLE_ANALYTICS   # Enable analytics (default: true)
VITE_ENABLE_ERROR_TRACKING  # Error tracking (default: false)
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design

## Development Guidelines

1. Use components from `src/components/index.js` for imports
2. Use `useAuth()` hook for authentication checks
3. Use `api` from `src/utils/api.js` for API calls
4. Wrap protected pages with `<ProtectedRoute allowedRoles={['role']}>`
5. Follow Tailwind utility classes for styling
6. Use `toast` from react-hot-toast for notifications

## Troubleshooting

### API Connection Issues
- Verify backend is running on configured URL
- Check VITE_API_URL in .env file
- Check browser console for CORS errors

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check token in browser DevTools (Application tab)
- Verify JWT is being sent in request headers

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Clear dist folder: `rm -rf dist`

## Support

For issues or questions, contact: support@everywherecars.com
