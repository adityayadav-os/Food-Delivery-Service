import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getPendingRestaurants, approveRestaurant, getRestaurants, deleteRestaurant } from '../services/restaurantService';

export default function SuperAdminDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [activeRestaurants, setActiveRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState('MONTHLY');
  const [subscriptionFee, setSubscriptionFee] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'ROLE_SUPER_ADMIN' && user.role !== 'ROLE_ADMIN')) {
      navigate('/');
      return;
    }

    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [pending, active] = await Promise.all([
        getPendingRestaurants(),
        getRestaurants()
      ]);
      setPendingRestaurants(pending);
      setActiveRestaurants(active);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSubscriptionType('MONTHLY');
    setSubscriptionFee(0);
  };

  const closeApproveModal = () => {
    setSelectedRestaurant(null);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRestaurant) return;
    try {
      await approveRestaurant(selectedRestaurant.id, subscriptionType, subscriptionFee);
      setPendingRestaurants(prev => prev.filter(r => r.id !== selectedRestaurant.id));
      setActiveRestaurants(prev => [...prev, { ...selectedRestaurant, subscriptionType, subscriptionFee }]);
      alert('Restaurant Approved Successfully!');
      closeApproveModal();
    } catch (err) {
      console.error("Approval failed", err);
      alert('Failed to approve restaurant');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to revoke approval for "${name}"? It will go back to pending status.`)) {
      try {
        await deleteRestaurant(id);
        const removedRestaurant = activeRestaurants.find(r => r.id === id);
        setActiveRestaurants(prev => prev.filter(r => r.id !== id));
        if (removedRestaurant) {
            setPendingRestaurants(prev => [...prev, { ...removedRestaurant, isApproved: false }]);
        }
        alert('Restaurant approval revoked successfully.');
      } catch (err) {
        console.error("Revoke failed", err);
        alert('Failed to revoke restaurant approval.');
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Loading Admin Dashboard...</h2></div>;
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Super Admin Dashboard 👑</h1>
      
      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem' }}>Pending Restaurant Approvals</h2>
        
        {pendingRestaurants.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pending restaurant approvals at this time.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRestaurants.map(restaurant => (
              <div key={restaurant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{restaurant.name}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>📍 {restaurant.location} | 📞 {restaurant.contactNumber}</p>
                </div>
                <button className="btn-primary" style={{ padding: '8px 24px' }} onClick={() => openApproveModal(restaurant)}>
                  Approve ✓
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Active Restaurants</h2>
        
        {activeRestaurants.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No active restaurants found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeRestaurants.map(restaurant => (
              <div key={restaurant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{restaurant.name}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>📍 {restaurant.location} | 📞 {restaurant.contactNumber}</p>
                  {restaurant.subscriptionType && (
                    <span className="badge badge-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                      {restaurant.subscriptionType} (₹{restaurant.subscriptionFee})
                    </span>
                  )}
                </div>
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 24px', background: '#e74c3c' }} 
                  onClick={() => handleDelete(restaurant.id, restaurant.name)}
                >
                  Remove 🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {selectedRestaurant && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={closeApproveModal}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Approve Restaurant</h2>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Set subscription plan for <strong>{selectedRestaurant.name}</strong></p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Subscription Type</label>
              <select 
                className="input-field" 
                value={subscriptionType} 
                onChange={(e) => setSubscriptionType(e.target.value)}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="FULL_PAYMENT">Full Payment (One-time)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Subscription Fee (₹)</label>
              <input 
                type="number" 
                className="input-field" 
                value={subscriptionFee} 
                onChange={(e) => setSubscriptionFee(Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={handleApproveConfirm}>
              Confirm Approval
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
