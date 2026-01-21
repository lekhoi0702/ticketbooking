import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { AntdThemeConfig } from '@theme/AntdThemeConfig';
import { DarkThemeConfig } from '@theme/DarkThemeConfig';

// User Imports
import UserLayout from '@features/user/components/UserLayout';
import Header from '@features/user/components/Header';
import Footer from '@features/user/components/Footer';
import Home from '@features/user/pages/Home';
import EventDetail from '@features/user/pages/EventDetail';
import Checkout from '@features/user/pages/Checkout';
import OrderSuccess from '@features/user/pages/OrderSuccess';
import VNPayReturn from '@features/user/pages/VNPayReturn';
import PayPalReturn from '@features/user/pages/PayPalReturn';
import VietQRPayment from '@features/user/pages/VietQRPayment';
import VietQRReturn from '@features/user/pages/VietQRReturn';
// MyOrders and MyTickets are now integrated into Profile
import SearchResults from '@features/user/pages/SearchResults';
import CategoryEvents from '@features/user/pages/CategoryEvents';
import Profile from '@features/user/pages/Profile';
import Login from '@features/user/pages/Login';
import AllEvents from '@features/user/pages/AllEvents';

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
import OrganizerVenues from '@features/organizer/pages/Venues';
import TicketManagement from '@features/organizer/pages/TicketManagement';
import OrganizerProfile from '@features/organizer/pages/OrganizerProfile';
import OrganizerProfileEdit from '@features/organizer/pages/OrganizerProfileEdit';
import ManageOrders from '@features/organizer/pages/ManageOrders';
import RefundRequests from '@features/organizer/pages/RefundRequests';
import DiscountManagement from '@features/organizer/pages/DiscountManagement';

// Admin Imports
import AdminLayout from '@features/admin/components/AdminLayout';
import UsersManagement from '@features/admin/pages/Users';
import AdminEventsManagement from '@features/admin/pages/Events';
import AdminOrdersManagement from '@features/admin/pages/Orders';

import AdminLogin from '@features/admin/pages/Login';
import AdminStatistics from '@features/admin/pages/Statistics';
import AdminCategories from '@features/admin/pages/Categories';
import AdminBanners from '@features/admin/pages/Banners';
import AdminAuditLogs from '@features/admin/pages/AuditLogs';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { AuthProvider, useAuth } from '@context/AuthContext';
import { FavoriteProvider } from '@context/FavoriteContext';

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


import PageTitleUpdater from '@shared/components/PageTitleUpdater';

function App() {
  return (
    <ConfigProvider theme={AntdThemeConfig} spin={{ indicator: <LoadingOutlined style={{ fontSize: 24, color: '#2DC275' }} spin /> }}>
      <AntdApp>
        <AuthProvider>
          <FavoriteProvider>
            <Router>
              <PageTitleUpdater />
              <Routes>
                {/* User Routes */}
                <Route element={
                  <ConfigProvider theme={DarkThemeConfig}>
                    <UserLayout />
                  </ConfigProvider>
                }>
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<AllEvents />} />
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
                  <Route path="/payment/paypal-return" element={<PayPalReturn />} />
                  <Route path="/payment/paypal-cancel" element={<PayPalReturn />} />
                  <Route path="/payment/vietqr/:paymentCode" element={<VietQRPayment />} />
                  <Route path="/payment/vietqr-return" element={<VietQRReturn />} />
                  <Route
                    path="/my-orders"
                    element={<Navigate to="/profile?tab=orders" replace />}
                  />
                  <Route
                    path="/my-tickets"
                    element={<Navigate to="/profile?tab=tickets" replace />}
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
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="events" element={<AdminEventsManagement />} />
                  <Route path="orders" element={<AdminOrdersManagement />} />
                  <Route path="statistics" element={<AdminStatistics />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
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
                  <Route path="venues" element={<OrganizerVenues />} />
                  <Route path="tickets" element={<TicketManagement />} />
                  <Route path="profile" element={<OrganizerProfile />} />
                  <Route path="profile/edit" element={<OrganizerProfileEdit />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="refund-requests" element={<RefundRequests />} />
                  <Route path="discounts" element={<DiscountManagement />} />
                </Route>
              </Routes>
            </Router>
          </FavoriteProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
