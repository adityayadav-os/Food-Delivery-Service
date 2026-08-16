import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserOrders } from '../services/orderService';

export default function OrderTracking() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchLatestOrder = async () => {
      try {
        const data = await getUserOrders(user.id);
        if (data && data.length > 0) {
          const activeOrders = data.filter(order => order.status !== 'DELIVERED' && order.status !== 'CANCELLED');
          if (activeOrders.length > 0) {
            const sorted = activeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLatestOrder(sorted[0]);
          } else {
            setLatestOrder(null);
          }
        } else {
          setLatestOrder(null);
        }
      } catch (err) {
        console.error("Could not fetch orders for tracking", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOrder();
    const interval = setInterval(fetchLatestOrder, 5000);
    return () => clearInterval(interval);
  }, [user, authLoading, navigate]);

  const getTrackingMessages = (order) => {
    const messages = [];
    if (!order) return messages;

    // Build the timeline backwards (newest first)
    if (order.status === 'DELIVERED') {
      messages.push({ msg: `Order Delivered successfully! Enjoy your meal! 🎉`, time: new Date().toLocaleTimeString() });
    }
    
    if (['DELIVERED', 'OUT_FOR_DELIVERY'].includes(order.status)) {
      messages.push({ msg: `${order.deliveryPartnerName || 'Your delivery partner'} has picked up your order and is on the way! 🛵`, time: new Date().toLocaleTimeString() });
    }
    
    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'ACCEPTED_BY_DELIVERY'].includes(order.status)) {
      messages.push({ msg: `${order.deliveryPartnerName || 'A delivery partner'} has been assigned and is reaching the restaurant.`, time: new Date().toLocaleTimeString() });
    }

    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'ACCEPTED_BY_DELIVERY', 'READY_FOR_PICKUP'].includes(order.status)) {
      messages.push({ msg: `Your order is ready! Waiting for pickup. 🛍️`, time: new Date().toLocaleTimeString() });
    }

    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'ACCEPTED_BY_DELIVERY', 'READY_FOR_PICKUP', 'PREPARING'].includes(order.status)) {
      messages.push({ msg: `Restaurant has started preparing your food. 👨‍🍳`, time: new Date().toLocaleTimeString() });
    }

    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'ACCEPTED_BY_DELIVERY', 'READY_FOR_PICKUP', 'PREPARING', 'ACCEPTED'].includes(order.status)) {
      const timeStr = order.estimatedPrepTime ? `${order.estimatedPrepTime} mins` : `30 mins`;
      messages.push({ msg: `Restaurant accepted your order! Estimated delivery in ${timeStr}. ✅`, time: new Date().toLocaleTimeString() });
    }

    if (order.status === 'CANCELLED') {
      messages.push({ msg: `Order was cancelled. ❌`, time: new Date().toLocaleTimeString() });
    }

    messages.push({ msg: `Order placed successfully! Waiting for restaurant to confirm. 🕒`, time: new Date(order.createdAt).toLocaleTimeString() });
    
    return messages;
  };

  if (loading || authLoading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Loading Tracking Data...</h2></div>;
  }

  const updates = getTrackingMessages(latestOrder);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '1rem', padding: '6px 16px' }}>🏠 Home</button>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>Live Tracking 🛵</h1>
          {latestOrder && (
            <p style={{ color: 'var(--text-muted)' }}>Tracking Order #{latestOrder.id} - ₹{latestOrder.totalAmount}</p>
          )}
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '2rem', fontSize: '1.4rem' }}>Tracking Updates</h3>
        
        {!latestOrder ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>You don't have any active orders to track.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {updates.map((notif, index) => (
              <div key={index} className="animate-fade-in" style={{ 
                padding: '1.5rem', 
                background: index === 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255,255,255,0.03)', 
                borderLeft: index === 0 ? '5px solid var(--secondary)' : '5px solid var(--text-muted)',
                borderRadius: '0 12px 12px 0',
                boxShadow: index === 0 ? '0 5px 15px rgba(0,0,0,0.2)' : 'none'
              }}>
                <p style={{ fontWeight: index === 0 ? 600 : 400, color: index === 0 ? 'var(--secondary)' : 'var(--text-main)', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                  {notif.msg}
                </p>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>
                  {notif.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
