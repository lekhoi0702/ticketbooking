import React, { lazy, Suspense } from 'react';
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
import SeatSelection from '@features/user/pages/SeatSelection';
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
import ResetPassword from '@features/user/pages/ResetPassword';
import CustomerAuthLayout from '@features/user/components/CustomerAuthLayout';

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
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';

const AdminLogin = lazy(() => import('@features/admin/pages/Login'));
const UsersManagement = lazy(() => import('@features/admin/pages/Users'));
const AdminEventsManagement = lazy(() => import('@features/admin/pages/Events'));
const AdminEventDetail = lazy(() => import('@features/admin/pages/EventDetail'));
const AdminOrdersManagement = lazy(() => import('@features/admin/pages/Orders'));
const AdminStatistics = lazy(() => import('@features/admin/pages/Statistics'));
const AdminCategories = lazy(() => import('@features/admin/pages/Categories'));
const AdminBanners = lazy(() => import('@features/admin/pages/Banners'));
const Advertisements = lazy(() => import('@features/admin/pages/Advertisements'));

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
                  <Route path="/event/:eventId/seats" element={<SeatSelection />} />
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

                {/* Standalone User Routes (outside UserLayout) */}
                <Route
                  path="/login"
                  element={
                    <CustomerAuthLayout>
                      <Login />
                    </CustomerAuthLayout>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <CustomerAuthLayout>
                      <ResetPassword />
                    </CustomerAuthLayout>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/login"
                  element={
                    <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                      <AdminLogin />
                    </Suspense>
                  }
                />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="statistics" replace />} />
                  <Route
                    path="users"
                    element={
                      <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                        <UsersManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="categories"
                    element={
                      <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                        <AdminCategories />
                      </Suspense>
                    }
                  />
                  <Route
                    path="banners"
                    element={
                      <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                        <AdminBanners />
                      </Suspense>
                    }
                  />
                  <Route
                    path="advertisements"
                    element={
                      <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                        <Advertisements />
                      </Suspense>
                    }
                  />
                  <Route
                    path="events"
                    element={
                      <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                        <AdminEventsManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="events/:id"
                    element={
                      <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                        <AdminEventDetail />
                      </Suspense>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                        <AdminOrdersManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="statistics"
                    element={
                      <Suspense fallback={<AdminLoadingScreen tip="Đang tải..." />}>
                        <AdminStatistics />
                      </Suspense>
                    }
                  />
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
