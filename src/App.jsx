import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import SplashScreenGate from './components/SplashScreen'
import WhatsAppWidget from './components/WhatsAppWidget'

// Public Pages
import Home from './pages/Home'
import Corporate from './pages/Corporate'
import Services from './pages/services/Services'
import AirportTransfers from './pages/services/AirportTransfers'
import Hourly from './pages/services/Hourly'
import Events from './pages/services/Events'
import Fleet from './pages/Fleet'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Profile from './pages/Profile'
import HowItWorks from './pages/HowItWorks'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import Quote from './pages/Quote'

// Transfer Route Pages (SEO)
import JFKToManhattan from './pages/transfers/JFKToManhattan'
import LGAToManhattan from './pages/transfers/LGAToManhattan'
import EWRToManhattan from './pages/transfers/EWRToManhattan'
import JFKToBrooklyn from './pages/transfers/JFKToBrooklyn'
import ManhattanToHamptons from './pages/transfers/ManhattanToHamptons'
import NYCToPhiladelphia from './pages/transfers/NYCToPhiladelphia'
import NYCToConnecticut from './pages/transfers/NYCToConnecticut'
import NYCToBoston from './pages/transfers/NYCToBoston'

// Customer Pages
import BookRide from './pages/customer/BookRide'
import MyRides from './pages/customer/MyRides'
import RideDetails from './pages/customer/RideDetails'

// Operator Pages
import OperatorDashboard from './pages/operator/Dashboard'
import OperatorRequests from './pages/operator/Requests'
import OperatorDrivers from './pages/operator/Drivers'
import OperatorRevenue from './pages/operator/Revenue'
import OperatorUsers from './pages/operator/Users'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminRevenue from './pages/admin/Revenue'

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-page)', transition: 'background 300ms ease' }}>
      <Navbar />
      <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/corporate" element={<Corporate />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/airport-transfers" element={<AirportTransfers />} />
            <Route path="/services/hourly" element={<Hourly />} />
            <Route path="/services/events" element={<Events />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/quote" element={<Quote />} />

            {/* SEO Transfer Route Pages */}
            <Route path="/transfers/jfk-to-manhattan" element={<JFKToManhattan />} />
            <Route path="/transfers/lga-to-manhattan" element={<LGAToManhattan />} />
            <Route path="/transfers/ewr-to-manhattan" element={<EWRToManhattan />} />
            <Route path="/transfers/jfk-to-brooklyn" element={<JFKToBrooklyn />} />
            <Route path="/transfers/manhattan-to-hamptons" element={<ManhattanToHamptons />} />
            <Route path="/transfers/nyc-to-philadelphia" element={<NYCToPhiladelphia />} />
            <Route path="/transfers/nyc-to-connecticut" element={<NYCToConnecticut />} />
            <Route path="/transfers/nyc-to-boston" element={<NYCToBoston />} />

            {/* Protected - Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected - Customer Routes */}
            <Route
              path="/book"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <BookRide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-rides"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyRides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rides/:id"
              element={
                <ProtectedRoute allowedRoles={['customer', 'operator', 'admin']}>
                  <RideDetails />
                </ProtectedRoute>
              }
            />

            {/* Protected - Operator Routes */}
            <Route
              path="/operator"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/dashboard"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/requests"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/drivers"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorDrivers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/revenue"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorRevenue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/customers"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorUsers />
                </ProtectedRoute>
              }
            />

            {/* Protected - Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/revenue"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRevenue />
                </ProtectedRoute>
              }
            />

            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppWidget />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a365d',
              color: '#fff',
            },
            success: {
              style: { background: '#065f46' },
            },
            error: {
              style: { background: '#991b1b' },
            },
          }}
        />
      </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SplashScreenGate>
          <AppContent />
        </SplashScreenGate>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
