import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import ReservationsPage from './pages/ReservationsPage';
import BillingPage from './pages/BillingPage';
import StaffPage from './pages/StaffPage';
import CustomersPage from './pages/CustomersPage';
import CustomerMenuPage from './pages/CustomerMenuPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={
          user?.role === 'customer'
            ? <Navigate to="/menu" />
            : <Navigate to="/dashboard" />
        } />
        <Route path="dashboard" element={<ProtectedRoute roles={['admin','staff']}><DashboardPage /></ProtectedRoute>} />
        <Route path="menu" element={<ProtectedRoute roles={['admin','staff']}><MenuPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute roles={['admin','staff']}><OrdersPage /></ProtectedRoute>} />
        <Route path="reservations" element={<ProtectedRoute roles={['admin','staff']}><ReservationsPage /></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute roles={['admin','staff']}><BillingPage /></ProtectedRoute>} />
        <Route path="staff" element={<ProtectedRoute roles={['admin']}><StaffPage /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute roles={['admin','staff']}><CustomersPage /></ProtectedRoute>} />
        <Route path="customer-menu" element={<ProtectedRoute roles={['customer']}><CustomerMenuPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
