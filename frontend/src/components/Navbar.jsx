import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { getNotifications, markAsRead } from '../services/notificationService';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      let roleKey = 'CUSTOMER';
      if (user.role === 'ROLE_RESTAURANT_OWNER') roleKey = 'RESTAURANT';
      if (user.role === 'ROLE_DELIVERY_BOY') roleKey = 'DELIVERY_PARTNER';
      if (user.role === 'ROLE_ADMIN') roleKey = 'ADMIN';
      
      const fetchNotifs = async () => {
        try {
          const data = await getNotifications(roleKey, user.id);
          setNotifications(data.filter(n => !n.isRead));
        } catch (e) {
          console.error("Failed to fetch notifications");
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotificationClick = async (notif) => {
    try {
      await markAsRead(notif.id);
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    } catch (e) {
      console.error("Failed to mark as read");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      padding: '1.5rem 5%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(18, 18, 18, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
        Food<span style={{ color: 'var(--primary)' }}>Express</span>
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {(!user || user.role === 'ROLE_CUSTOMER') && (
          <>
            <Link to="/" style={{ fontWeight: 500 }}>Home</Link>
            <Link to="/customer/orders" style={{ fontWeight: 500 }}>My Orders</Link>
            <Link to="/customer/track-order" style={{ fontWeight: 500 }}>Track Orders</Link>
            
            <Link to="/customer/checkout" style={{ fontWeight: 500, position: 'relative' }}>
              Cart 🛒
              {cartItems.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {cartItems.length}
                </span>
              )}
            </Link>
          </>
        )}

        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user.role === 'ROLE_ADMIN' && (
              <Link to="/admin/dashboard" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                Admin Dashboard
              </Link>
            )}
            {user.role === 'ROLE_RESTAURANT_OWNER' && (
              <Link to="/restaurant/dashboard" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                Restaurant Dashboard
              </Link>
            )}
            {user.role === 'ROLE_DELIVERY_BOY' && (
              <Link to="/delivery/dashboard" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                Delivery Dashboard
              </Link>
            )}
            <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Hi, {user.email.split('@')[0]}</span>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', position: 'relative' }}
              >
                🔔
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', top: '40px', right: 0, width: '300px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Notifications</h4>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>No new notifications</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {notifications.map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', cursor: 'pointer', borderLeft: '3px solid var(--primary)' }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{n.message}</p>
                          <small style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '8px 20px' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
