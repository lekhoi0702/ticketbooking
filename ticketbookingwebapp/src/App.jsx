import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/user/Home';
import EventDetail from './pages/user/EventDetail';
import Checkout from './pages/user/Checkout';
import OrderSuccess from './pages/user/OrderSuccess';
import VNPayReturn from './pages/user/VNPayReturn';
import MyOrders from './pages/user/MyOrders';
import MyTickets from './pages/user/MyTickets';
import SearchResults from './pages/user/SearchResults';
import CategoryEvents from './pages/user/CategoryEvents';

// Organizer Imports
import OrganizerLayout from './components/Organizer/OrganizerLayout';
import OrganizerDashboard from './pages/organizer/Dashboard';
import EventList from './pages/organizer/EventList';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import OrganizerEventDetails from './pages/organizer/EventDetails';
import OrganizerLogin from './pages/organizer/Login';
import OrganizerHome from './pages/organizer/OrganizerHome';

import ManageSeats from './pages/organizer/ManageSeats';

// Admin Imports
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/Users';
import AdminEventsManagement from './pages/admin/Events';
import AdminOrdersManagement from './pages/admin/Orders';
import VenuesManagement from './pages/admin/Venues';
import AdminLogin from './pages/admin/Login';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/user/Login';

// Layout for regular users
const UserLayout = () => {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Protected Route Component with Role Support
const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/login" }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/category/:id" element={<CategoryEvents />} />
            <Route
              path="/checkout/:eventId"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/order-success/:orderCode" element={<OrderSuccess />} />
            <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="events" element={<AdminEventsManagement />} />
            <Route path="orders" element={<AdminOrdersManagement />} />
            <Route path="venues" element={<VenuesManagement />} />
          </Route>

          {/* Organizer Routes */}
          <Route path="/organizer/home" element={<OrganizerHome />} />
          <Route path="/organizer/login" element={<OrganizerLogin />} />
          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} redirectTo="/organizer/home">
                <OrganizerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<OrganizerDashboard />} />
            <Route path="events" element={<EventList />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="edit-event/:eventId" element={<EditEvent />} />
            <Route path="event/:eventId" element={<OrganizerEventDetails />} />
            <Route path="manage-seats/:eventId" element={<ManageSeats />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

