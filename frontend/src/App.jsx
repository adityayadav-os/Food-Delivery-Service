import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Layout from './components/Layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RestaurantMenu from './pages/RestaurantMenu';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import OrderHistory from './pages/OrderHistory';
import CategoryView from './pages/CategoryView';

// CSS
import './index.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected/Main Layout Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="restaurant/:id" element={<RestaurantMenu />} />
              <Route path="/customer/checkout" element={<Checkout />} />
              <Route path="/customer/track-order" element={<OrderTracking />} />
              <Route path="/customer/orders" element={<OrderHistory />} />
              <Route path="admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="restaurant/dashboard" element={<RestaurantDashboard />} />
              <Route path="delivery/dashboard" element={<DeliveryDashboard />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
