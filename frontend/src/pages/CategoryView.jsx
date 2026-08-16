import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { universalSearch } from '../services/restaurantService';

export default function CategoryView() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      try {
        const results = await universalSearch(name);
        setDishes(results.dishes || []);
      } catch (err) {
        console.error("Failed to fetch category dishes", err);
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (name) {
      fetchDishes();
    }
  }, [name]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Loading delicious {name}...</h2></div>;
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <button 
        className="btn-secondary" 
        onClick={() => navigate('/')}
        style={{ marginBottom: '2rem' }}
      >
        ← Back to Home
      </button>

      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
        {name}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>
        Explore the best {name} from top restaurants near you.
      </p>

      {dishes.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
          <h2>No {name} found!</h2>
          <p>Try searching for something else.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {dishes.map(dish => (
            <div 
              key={dish.id} 
              className="glass-panel" 
              style={{ display: 'flex', padding: '1.5rem', gap: '1.5rem', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s ease' }}
              onClick={() => navigate(`/restaurant/${dish.restaurant.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img 
                src={dish.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80'} 
                alt={dish.name} 
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, height: '100%' }}>
                <div>
                  <h4 style={{ fontSize: '1.3rem', margin: '0 0 0.3rem 0' }}>{dish.name}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>By {dish.restaurant?.name || 'Unknown Restaurant'}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{dish.price}</span>
                  <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>Order Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
