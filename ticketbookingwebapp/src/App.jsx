import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AntdThemeConfig } from '@theme/AntdThemeConfig';

// User Imports
import UserLayout from '@features/user/components/UserLayout';
import Header from '@features/user/components/Header';
import Footer from '@features/user/components/Footer';
import Home from '@features/user/pages/Home';
import EventDetail from '@features/user/pages/EventDetail';
import Checkout from '@features/user/pages/Checkout';
import OrderSuccess from '@features/user/pages/OrderSuccess';
import VNPayReturn from '@features/user/pages/VNPayReturn';
import MyOrders from '@features/user/pages/MyOrders';
import MyTickets from '@features/user/pages/MyTickets';
import SearchResults from '@features/user/pages/SearchResults';
import CategoryEvents from '@features/user/pages/CategoryEvents';
import Profile from '@features/user/pages/Profile';
import Login from '@features/user/pages/Login';

// Organizer Imports
import OrganizerLayout from '@features/organizer/components/OrganizerLayout';
import EventList from '@features/organizer/pages/EventList';
import CreateEvent from '@features/organizer/pages/CreateEvent';
import EditEvent from '@features/organizer/pages/EditEvent';
import OrganizerEventDetails from '@features/organizer/pages/EventDetails';
import OrganizerLogin from '@features/organizer/pages/Login';
import OrganizerHome from '@features/organizer/pages/OrganizerHome';
import ManageSeats from '@features/organizer/pages/ManageSeats';
import EventOrders from '@features/organizer/pages/EventOrders';

// Admin Imports
import AdminLayout from '@features/admin/components/AdminLayout';
import UsersManagement from '@features/admin/pages/Users';
import AdminEventsManagement from '@features/admin/pages/Events';
import AdminOrdersManagement from '@features/admin/pages/Orders';
import VenuesManagement from '@features/admin/pages/Venues';
import EventDeletionRequests from '@features/admin/pages/EventDeletionRequests';
import AdminLogin from '@features/admin/pages/Login';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthProvider, useAuth } from '@context/AuthContext';

// Protected Route Component with Role Support
const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/" }) => {
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
    <ConfigProvider theme={AntdThemeConfig}>
      <AntdApp>
        <AuthProvider>
          <Router>
            <Routes>
              {/* User Routes */}
              <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/event/:id" element={<EventDetail />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/category/:id" element={<CategoryEvents />} />
                <Route
                  path="/checkout/:eventId"
                  element={
                    <ProtectedRoute allowedRoles={['USER']} redirectTo="/">
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route path="/order-success/:orderCode" element={<OrderSuccess />} />
                <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute allowedRoles={['USER']} redirectTo="/">
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute allowedRoles={['USER']} redirectTo="/">
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['USER']} redirectTo="/">
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="events" />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="events" element={<AdminEventsManagement />} />
                <Route path="orders" element={<AdminOrdersManagement />} />
                <Route path="venues" element={<VenuesManagement />} />
                <Route path="event-deletion-requests" element={<EventDeletionRequests />} />
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
                <Route index element={<Navigate to="events" />} />
                <Route path="events" element={<EventList />} />
                <Route path="create-event" element={<CreateEvent />} />
                <Route path="edit-event/:eventId" element={<EditEvent />} />
                <Route path="event/:eventId" element={<OrganizerEventDetails />} />
                <Route path="manage-seats/:eventId" element={<ManageSeats />} />
                <Route path="event/:eventId/orders" element={<EventOrders />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
