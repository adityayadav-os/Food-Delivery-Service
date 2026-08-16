import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRestaurants, universalSearch } from '../services/restaurantService';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Fallback data in case backend is not running yet
const fallbackRestaurants = [
  { id: 1, name: "KFC", location: "Connaught Place", img: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/RX_THUMB/TopBrands/2024/4/17/5d0c595a-5679-49fa-9860-2ffadbd3b2eb_10575.JPG", rating: "4.3", cuisines: "Burgers, Fast Food" },
  { id: 2, name: "Domino's Pizza", location: "Karol Bagh", img: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/d0450ce1a6ba19ea60cd724471ed34ac", rating: "4.4", cuisines: "Pizzas, Italian" },
  { id: 3, name: "Burger King", location: "Rajiv Chowk", img: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/e33e1d3ba7d6b2bb0d45e1001b731fcf", rating: "4.2", cuisines: "Burgers, American" },
  { id: 4, name: "Kwality Walls", location: "Paharganj", img: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/71f630ce2d1eebe828a2b5368a6237dd", rating: "4.6", cuisines: "Desserts, Ice Cream" }
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);
  const { addToCart, cartItems, cartTotal } = React.useContext(CartContext);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  useEffect(() => {
    if (user && user.role === 'ROLE_RESTAURANT_OWNER') {
      navigate('/restaurant/dashboard');
      return;
    }
    if (user && user.role === 'ROLE_ADMIN') {
      navigate('/admin/dashboard');
      return;
    }
    if (user && user.role === 'ROLE_DELIVERY_BOY') {
      navigate('/delivery/dashboard');
      return;
    }

    const fetchRes = async () => {
      try {
        const data = await getRestaurants();
        if (data && data.length > 0) {
          setRestaurants(data.map((r, i) => ({
            id: r.id,
            name: r.name,
            location: r.location,
            rating: (4.0 + (i % 10) * 0.1).toFixed(1),
            cuisines: "Various Cuisines",
            img: r.imageUrl || (i % 2 === 0 ? fallbackRestaurants[0].img : fallbackRestaurants[1].img)
          })));
        } else {
          setRestaurants(fallbackRestaurants);
        }
      } catch (err) {
        console.error("Using fallback restaurants because backend is unreachable.");
        setRestaurants(fallbackRestaurants);
      } finally {
        setLoading(false);
      }
    };
    fetchRes();
  }, [user, navigate]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await universalSearch(searchTerm);
        const mappedRests = (results.restaurants || []).map((r, i) => ({
          id: r.id,
          name: r.name,
          location: r.location,
          rating: (4.0 + (i % 10) * 0.1).toFixed(1),
          cuisines: "Various Cuisines",
          img: r.imageUrl || (i % 2 === 0 ? fallbackRestaurants[0].img : fallbackRestaurants[1].img)
        }));
        setSearchResults({
          restaurants: mappedRests,
          dishes: results.dishes || []
        });
      } catch (err) {
        console.error("Search failed", err);
        setSearchResults({ restaurants: [], dishes: [] });
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Loading wonderful places...</h2></div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,107,107,0) 100%)',
        borderRadius: '24px',
        marginBottom: '4rem'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
          Craving something <span className="text-primary-gradient">delicious?</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Get the best food from top restaurants delivered straight to your door in minutes.
        </p>
        
        <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search for restaurants or dishes (e.g., Samosa)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '16px 24px', borderRadius: '50px', width: '100%' }}
          />
        </div>
      </section>

      {/* Main Grid */}
      <section>
        {searchTerm.trim() && searchResults ? (
          <>
            {isSearching ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Searching...</div>
            ) : (
              <>
                {/* Dishes Section */}
                {searchResults.dishes.length > 0 && (
                  <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Dishes</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                      {searchResults.dishes.map(dish => (
                        <div 
                          key={dish.id} 
                          className="glass-panel" 
                          style={{ display: 'flex', padding: '1.5rem', gap: '1.5rem', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => setSelectedProduct(dish)}
                        >
                          <img src={dish.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80'} alt={dish.name} loading="lazy" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, height: '100%' }}>
                            <div>
                              <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem 0' }}>{dish.name}</h4>
                              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{dish.restaurant?.name || 'Unknown Restaurant'}</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{dish.price}</span>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: '6px 16px', fontSize: '0.9rem' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(dish);
                                }}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Restaurants Section (Search Results) */}
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Restaurants</h2>
                {searchResults.restaurants.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>No restaurants found matching your search.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {searchResults.restaurants.map(restaurant => (
                      <div key={restaurant.id} className="glass-card" onClick={() => navigate(`/restaurant/${restaurant.id}`)} style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <img src={restaurant.img} alt={restaurant.name} loading="lazy" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{restaurant.name}</h3>
                            <span style={{ background: 'var(--secondary)', color: '#000', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>★ {restaurant.rating}</span>
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>{restaurant.cuisines}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 'auto' }}>📍 {restaurant.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Top Restaurants 
              <span style={{ fontSize: '1rem', color: 'var(--primary)', cursor: 'pointer' }}>View All →</span>
            </h2>
            
            {restaurants.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No restaurants available.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {restaurants.map(restaurant => (
                  <div key={restaurant.id} className="glass-card" onClick={() => navigate(`/restaurant/${restaurant.id}`)} style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <img src={restaurant.img} alt={restaurant.name} loading="lazy" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{restaurant.name}</h3>
                        <span style={{ background: 'var(--secondary)', color: '#000', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>★ {restaurant.rating}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>{restaurant.cuisines}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 'auto' }}>📍 {restaurant.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

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
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Restaurant:</strong> {selectedProduct.restaurant?.name || 'Unknown'}</p>
              <p style={{ margin: 0 }}><strong>Location:</strong> {selectedProduct.restaurant?.location || 'Unknown'}</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{selectedProduct.price}</span>
              <button 
                className="btn-primary" 
                onClick={() => {
                  if (selectedProduct.restaurant && selectedProduct.restaurant.id) {
                    addToCart({...selectedProduct, restaurantId: selectedProduct.restaurant.id});
                    setSelectedProduct(null);
                  } else {
                    alert('Error: Restaurant information is missing.');
                  }
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
