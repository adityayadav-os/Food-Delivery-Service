import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserOrders, updateOrderStatus, getOrderById } from '../services/orderService';
import { syncPaymentStatus } from '../services/paymentService';

const fallbackImages = {
  'spicy chicken burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
  'veggie delight pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80',
  'french fries (large)': 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&q=80',
  'gulab jamun': 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=500&q=80',
  'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
};

const getImageUrl = (item) => {
  if (item.imageUrl) return item.imageUrl;
  const name = (item.menuItemName || item.productName || '').toLowerCase();
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (name.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80'; // default food image
};

export default function OrderHistory() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await getUserOrders(user.id);
      // Sort orders by newest first
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Failed to fetch order history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, authLoading, navigate]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await updateOrderStatus(orderId, 'CANCELLED');
        alert("Order cancelled successfully.");
        fetchOrders(); // Refresh the list
      } catch (err) {
        console.error("Failed to cancel order", err);
        alert("Failed to cancel order. Please try again.");
      }
    }
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      const payment = await syncPaymentStatus(orderId);
      if (payment.paymentStatus === 'COMPLETED') {
        alert("Payment was successful! Updating order status.");
        fetchOrders();
      } else {
        alert(`Payment Status from Gateway: ${payment.paymentStatus}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify payment status. Order might not be paid.");
    }
  };

  const [receiptOrder, setReceiptOrder] = useState(null);

  const handleViewReceipt = async (orderId) => {
    try {
      const fullOrder = await getOrderById(orderId);
      setReceiptOrder(fullOrder);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch full receipt details.");
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2 className="text-muted">Loading your past orders...</h2></div>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '1rem', padding: '6px 16px' }}>← Home</button>
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary)' }}>My Orders 📦</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here is a list of all your past and current orders.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't placed any orders yet.</h3>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ padding: '10px 24px' }}>Explore Restaurants</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Order #{order.id}</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-warning' : 'badge-primary'}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                    {order.status}
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{order.totalAmount}</div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary)' }}>Items Ordered:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                  {order.items && order.items.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {getImageUrl(item) ? (
                          <img src={getImageUrl(item)} alt={item.menuItemName || item.productName} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
                        )}
                        <span>{item.quantity}x {item.menuItemName || item.productName}</span>
                      </div>
                      <span>₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}><strong>Delivered To:</strong> {order.deliveryAddress}</p>
                {order.deliveryPartnerName && (
                  <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Delivery Partner:</strong> {order.deliveryPartnerName} ({order.deliveryPartnerPhone})</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {order.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleCancelOrder(order.id)} 
                      className="btn-primary" 
                      style={{ flex: 1, background: '#e74c3c', padding: '0.6rem' }}
                    >
                      Cancel Order ❌
                    </button>
                    <button 
                      onClick={() => handleVerifyPayment(order.id)} 
                      className="btn-primary" 
                      style={{ flex: 1, background: 'var(--secondary)', padding: '0.6rem' }}
                    >
                      Verify Payment 🔄
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => handleViewReceipt(order.id)} 
                  className="btn-primary" 
                  style={{ flex: order.status === 'PENDING' ? 2 : 1, padding: '0.6rem', background: '#34495e' }}
                >
                  View Full Receipt 🧾
                </button>
              </div>
              
            </div>
          ))}
        </div>
      )}
      {receiptOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', position: 'relative', padding: '2rem' }}>
            <button onClick={() => setReceiptOrder(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>Order Receipt</h2>
            
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <p><strong>Order ID:</strong> #{receiptOrder.id}</p>
              <p><strong>Date:</strong> {new Date(receiptOrder.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> <span className={`badge ${receiptOrder.status === 'DELIVERED' ? 'badge-success' : 'badge-primary'}`}>{receiptOrder.status}</span></p>
            </div>
            
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Customer Details</h4>
              <p style={{ margin: 0 }}>{receiptOrder.customerName}</p>
              <p style={{ margin: 0 }}>{receiptOrder.customerPhone}</p>
              <p style={{ margin: 0 }}>{receiptOrder.deliveryAddress}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Order Items</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {receiptOrder.items.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                    <span>{item.quantity}x {item.menuItemName || item.productName}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '2px dashed rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
              <h3 style={{ margin: 0 }}>Total Amount:</h3>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>₹{receiptOrder.totalAmount}</h3>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
