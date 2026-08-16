import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrdersByStatus, getOrdersByDeliveryPartner, assignDeliveryPartner, updateOrderStatus } from '../services/orderService';
import { getRestaurants } from '../services/restaurantService';

export default function DeliveryDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [restaurantsMap, setRestaurantsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ROLE_DELIVERY_BOY') {
      navigate('/');
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live poll every 5 seconds
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      try {
        const allRests = await getRestaurants();
        const rMap = {};
        allRests.forEach(r => { rMap[r.id] = r; });
        setRestaurantsMap(rMap);
      } catch (restErr) {
        console.warn("Could not fetch restaurants for mapping", restErr);
      }

      const readyOrders = await getOrdersByStatus('READY_FOR_PICKUP');
      setAvailableOrders(readyOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      const partnerOrders = await getOrdersByDeliveryPartner(user.id);
      // Filter out DELIVERED to only show active ones
      setMyOrders(partnerOrders.filter(o => o.status !== 'DELIVERED'));
    } catch (err) {
      console.error("Failed to fetch delivery dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await assignDeliveryPartner(orderId, user.id, user.name, user.phoneNumber || '9999999999');
      await updateOrderStatus(orderId, 'ACCEPTED_BY_DELIVERY'); // Intermediate status
      alert("Order Accepted! Please head to the restaurant.");
      fetchData(); // Refresh UI
    } catch (err) {
      console.error(err);
      alert("Failed to accept order");
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Loading Delivery Dashboard...</h2></div>;
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', margin: 0 }}>Delivery Partner Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
        </div>
        <button className="btn-primary" onClick={fetchData} style={{ padding: '8px 16px' }}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Available Orders Section */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>📡</span> Available for Pickup
          </h2>
          
          {availableOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No new orders waiting for pickup right now.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {availableOrders.map(order => (
                <div key={order.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #f39c12' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Order #{order.id}</h3>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{order.totalAmount}</span>
                  </div>
                  
                  <div style={{ background: 'rgba(255,165,0,0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.8rem' }}>
                    <h4 style={{ margin: '0 0 0.3rem 0', color: '#f39c12' }}>Pickup From</h4>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem' }}><strong>{restaurantsMap[order.restaurantId]?.name || `Restaurant #${order.restaurantId}`}</strong></p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{restaurantsMap[order.restaurantId]?.location}</p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--secondary)' }}>Drop-off To</h4>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem' }}><strong>Name:</strong> {order.customerName}</p>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem' }}><strong>Phone:</strong> {order.customerPhone}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Address:</strong> {order.deliveryAddress}</p>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={() => handleAcceptOrder(order.id)}
                    style={{ width: '100%', padding: '0.8rem' }}
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Active Deliveries Section */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🛵</span> My Active Deliveries
          </h2>

          {myOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>You don't have any active deliveries.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myOrders.map(order => (
                <div key={order.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Order #{order.id}</h3>
                    <span className="badge badge-success">{order.status}</span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary)' }}>Customer Details</h4>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}><strong>Name:</strong> {order.customerName}</p>
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}><strong>Phone:</strong> {order.customerPhone}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Address:</strong> {order.deliveryAddress}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {order.status === 'ACCEPTED_BY_DELIVERY' && (
                      <button 
                        className="btn-primary" 
                        onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                        style={{ flex: 1, padding: '0.8rem' }}
                      >
                        Picked Up (Start Journey)
                      </button>
                    )}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button 
                        className="btn-primary" 
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        style={{ flex: 1, padding: '0.8rem', background: '#2ecc71' }}
                      >
                        Mark as Delivered ✅
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
