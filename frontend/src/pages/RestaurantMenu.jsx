import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenuByRestaurant, getRestaurantById } from '../services/restaurantService';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

const mockMenu = [
  { id: 101, name: 'Spicy Chicken Burger', price: 149, type: 'Non-Veg', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
  { id: 102, name: 'Veggie Delight Pizza', price: 299, type: 'Veg', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80' },
  { id: 103, name: 'French Fries (Large)', price: 99, type: 'Veg', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&q=80' },
];

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, cartTotal, updateQuantity, removeFromCart } = useContext(CartContext);
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRestaurantById(id);
        const menuItems = await getMenuByRestaurant(id);
        setRestaurant(res);
        setMenu(menuItems.length > 0 ? menuItems : mockMenu);
      } catch (err) {
        console.error("Backend unreachable, using fallback menu.", err);
        setRestaurant({ name: "Awesome Eatery", location: "Local Area" });
        setMenu(mockMenu);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2 className="text-muted">Loading Menu...</h2></div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1rem', padding: '6px 16px' }}>← Back</button>
          <h1 style={{ fontSize: '2.5rem' }}>{restaurant?.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>📍 {restaurant?.location}</p>
        </div>
        
        {cartItems.length > 0 && (
          <button 
            className="btn-primary" 
            onClick={() => setIsCartModalOpen(true)}
          >
            🛒 View Cart ({cartItems.length}) - ₹{cartTotal}
          </button>
        )}
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search menu..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select className="form-control" style={{ width: 'auto' }}>
          <option>All Types</option>
          <option>Veg</option>
          <option>Non-Veg</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {menu.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
          <div 
            key={item.id} 
            className="glass-panel" 
            style={{ display: 'flex', padding: '1.5rem', gap: '1.5rem', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setSelectedProduct(item)}
          >
            <img src={item.image || mockMenu[0].image} alt={item.name} loading="lazy" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, height: '100%' }}>
              <div>
                <span className={`badge ${item.type === 'Veg' ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  {item.type || 'Non-Veg'}
                </span>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{item.name}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.description || "Delicious food prepared with fresh ingredients."}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{item.price}</span>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); addToCart({...item, restaurantId: restaurant.id}); }}
                  style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                >
                  Add +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={() => {
          setIsAuthModalOpen(false);
          navigate('/customer/checkout');
        }}
      />
      {/* Cart Modal */}
      {isCartModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'flex-end', zIndex: 999 }} className="animate-fade-in">
          <div style={{ background: '#111', width: '400px', height: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Your Cart 🛒</h2>
              <button className="btn-secondary" onClick={() => setIsCartModalOpen(false)} style={{ padding: '4px 12px' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cartItems.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Cart is empty.</p>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      onClick={() => setSelectedProduct(item)}
                      loading="lazy"
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 
                          style={{ margin: '0 0 0.2rem 0', cursor: 'pointer' }}
                          onClick={() => setSelectedProduct(item)}
                        >
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
                          title="Remove item"
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{ background: 'var(--secondary)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >-</button>
                        <span style={{ fontSize: '0.9rem' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{ background: 'var(--secondary)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >+</button>
                      </div>
                      <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                <span>Total:</span>
                <span className="text-primary-gradient">₹{cartTotal}</span>
              </div>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                onClick={() => {
                  setIsCartModalOpen(false);
                  navigate('/customer/checkout');
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedProduct(null)} className="animate-fade-in">
          <div 
            style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '90%', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProduct(null)} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--secondary)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}
            >
              ✕
            </button>
            
            <img src={selectedProduct.image || 'https://via.placeholder.com/500'} alt={selectedProduct.name} loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{selectedProduct.name}</h2>
              <span className={`badge ${selectedProduct.type === 'Veg' ? 'badge-success' : 'badge-warning'}`}>
                {selectedProduct.type || 'Non-Veg'}
              </span>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              {selectedProduct.description || "Delicious food prepared with fresh ingredients and perfect spices. A must try from our menu!"}
            </p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Restaurant:</strong> {restaurant?.name}</p>
              <p style={{ margin: 0 }}><strong>Location:</strong> {restaurant?.location}</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{selectedProduct.price}</span>
              <button 
                className="btn-primary" 
                onClick={() => {
                  addToCart({...selectedProduct, restaurantId: restaurant.id});
                  setSelectedProduct(null);
                }}
                style={{ padding: '12px 24px', fontSize: '1.1rem' }}
              >
                Add to Cart 🛒
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
