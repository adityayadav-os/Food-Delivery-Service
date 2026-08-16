import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { createPaymentOrder, verifyPayment } from '../services/paymentService';
import AuthModal from '../components/AuthModal';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setLoading(true);
    setStatus('Creating order...');
    
    try {
      const orderPayload = {
        userId: user?.id || 1, // fallback for mock user
        restaurantId: cartItems[0]?.restaurantId || 1,
        items: cartItems.map(item => ({
          productId: item.id,
          menuItemName: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image
        })),
        customerName: formData.name,
        deliveryAddress: formData.address,
        customerPhone: formData.phone
      };

      const orderResult = await createOrder(orderPayload);

      setStatus('Initializing Payment Gateway...');
      const paymentOrderData = await createPaymentOrder(orderResult.id, cartTotal, 'INR', user?.email || 'customer@test.com');
      
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        setStatus('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      setStatus('Waiting for payment confirmation...');
      
      const options = {
        key: 'rzp_test_TMumSoDKMprn3X',
        amount: paymentOrderData.amount * 100, // Amount is in currency subunits (paise)
        currency: paymentOrderData.currency || 'INR',
        name: 'Food Delivery Corp',
        description: 'Order Payment',
        order_id: paymentOrderData.razorpayOrderId,
        handler: async function (response) {
          setStatus('Payment successful! Verifying with server...');
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            
            setStatus('Verified! Notifying restaurant...');
            setTimeout(() => {
              clearCart();
              navigate('/customer/track-order');
            }, 2000);
            
          } catch (err) {
            console.error("Verification failed:", err);
            setStatus('Payment verification failed on server!');
          }
        },
        prefill: {
          name: formData.name,
          email: user?.email || 'test@example.com',
          contact: formData.phone
        },
        theme: {
          color: '#ff6b6b'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function (response){
        setStatus('Payment failed! Try again.');
        setLoading(false);
      });

    } catch (err) {
      console.error(err);
      setStatus('Failed to initiate payment.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>Your cart is empty</h2>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1.5rem' }}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '2rem' }}>← Back</button>
      
      <div className="glass-panel">
        <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Checkout 💳</h2>
        
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Your Items</h3>
          {cartItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
              <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>{item.name}</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Quantity: {item.quantity}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{item.price * item.quantity}</span>
                  <button 
                    type="button" 
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'transparent', color: '#ff4757', border: '1px solid #ff4757', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Delivery Details</h3>
            <input type="text" className="form-control" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="text" className="form-control" placeholder="Delivery Address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <input type="tel" className="form-control" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
            <span>Total Amount</span>
            <span className="text-primary-gradient">₹{cartTotal}</span>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', marginTop: '2rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay ₹${cartTotal} Securely`}
          </button>
        </form>
        
        {status && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--secondary)', borderRadius: '8px', textAlign: 'center' }}>
            {status}
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
