import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRestaurantOrders, updateOrderStatus } from '../services/orderService';
import { getRestaurantsByOwner, createRestaurant, addMenuItem, getMenuByRestaurant, deleteMenuItem, updateMenuItem } from '../services/restaurantService';
import { updateEta } from '../services/notificationService';

export default function RestaurantDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [restaurantForm, setRestaurantForm] = useState({ name: '', location: '', contactNumber: '', imageUrl: '' });
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', type: 'Veg', image: '' });
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ROLE_RESTAURANT_OWNER') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // First get the owner's restaurant
        const restaurants = await getRestaurantsByOwner(user.id);
        if (restaurants && restaurants.length > 0) {
          const rest = restaurants[0];
          setRestaurant(rest);
          
          const resOrders = await getRestaurantOrders(rest.id);
          setOrders(resOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          
          const menu = await getMenuByRestaurant(rest.id);
          setMenuItems(menu || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newRest = await createRestaurant({ ...restaurantForm, ownerId: user.id });
      setRestaurant(newRest);
      alert("Restaurant created! Waiting for Admin Approval.");
    } catch (err) {
      console.error(err);
      alert("Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      let prepTime = null;
      if (status === 'PREPARING') {
        const timeInput = prompt("Enter estimated preparation time in minutes (e.g. 15, 20, 30):", "30");
        if (timeInput === null) return; // User cancelled
        prepTime = parseInt(timeInput, 10);
        if (isNaN(prepTime) || prepTime <= 0) {
            alert("Please enter a valid time in minutes.");
            return;
        }
      }
      await updateOrderStatus(orderId, status, prepTime);
      setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status, estimatedPrepTime: prepTime || o.estimatedPrepTime } : o));
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  };

  const handleUpdateEta = async (order) => {
    const timeInput = prompt("Enter new Estimated Time of Arrival (e.g. '15 mins', '45 mins'):", "30 mins");
    if (!timeInput) return;
    try {
      await updateEta(order.userId, timeInput);
      alert("ETA notification sent to customer!");
    } catch (err) {
      console.error(err);
      alert("Failed to send ETA");
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItemId) {
        const updatedItem = await updateMenuItem(editingItemId, menuForm);
        setMenuItems(prev => prev.map(item => item.id === editingItemId ? updatedItem : item));
        alert("Menu item updated!");
      } else {
        const newItem = await addMenuItem(restaurant.id, menuForm);
        setMenuItems(prev => [...prev, newItem]);
        alert("Menu item added!");
      }
      setIsMenuModalOpen(false);
      setMenuForm({ name: '', description: '', price: '', type: 'Veg', image: '' });
      setEditingItemId(null);
    } catch (err) {
      console.error(err);
      alert(editingItemId ? "Failed to update menu item" : "Failed to add menu item");
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      try {
        await deleteMenuItem(itemId);
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
        alert("Menu item removed!");
      } catch (err) {
        console.error(err);
        alert("Failed to remove menu item");
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Loading Dashboard...</h2></div>;
  }

  if (!restaurant) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem' }}>Register Your Restaurant</h2>
        <div className="glass-panel">
          <form onSubmit={handleCreateRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="text" className="form-control" placeholder="Restaurant Name" required value={restaurantForm.name} onChange={e => setRestaurantForm({...restaurantForm, name: e.target.value})} />
            <input type="text" className="form-control" placeholder="Location" required value={restaurantForm.location} onChange={e => setRestaurantForm({...restaurantForm, location: e.target.value})} />
            <input type="tel" className="form-control" placeholder="Contact Number" required value={restaurantForm.contactNumber} onChange={e => setRestaurantForm({...restaurantForm, contactNumber: e.target.value})} />
            <input type="url" className="form-control" placeholder="Restaurant Image URL (Optional)" value={restaurantForm.imageUrl} onChange={e => setRestaurantForm({...restaurantForm, imageUrl: e.target.value})} />
            <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>Submit for Approval</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{restaurant.name} - Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Status: {restaurant.isApproved ? <span style={{ color: '#2ecc71' }}>Approved ✅</span> : <span style={{ color: '#f39c12' }}>Pending Approval ⏳</span>}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem' }}>Recent Orders</h2>
        
        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ 
                padding: '1.5rem', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '12px',
                borderLeft: '4px solid var(--primary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>Order #{order.id}</h3>
                    <span className={`badge ${order.status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.8rem' }}>{order.status}</span>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {order.status === 'PAID' && (
                        <>
                          <button className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}>Accept (Prepare)</button>
                          <button className="btn-primary" style={{ background: '#e74c3c', padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}>Reject</button>
                        </>
                      )}
                      {order.status === 'PREPARING' && (
                        <>
                          <button className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}>Ready for Pickup</button>
                          <button className="btn-primary" style={{ background: 'var(--secondary)', padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleUpdateEta(order)}>Update ETA</button>
                        </>
                      )}
                      {(order.status === 'READY_FOR_PICKUP' || order.status === 'ACCEPTED_BY_DELIVERY' || order.status === 'OUT_FOR_DELIVERY') && (
                        <span style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)' }}>Waiting for Delivery Partner...</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>₹{order.totalAmount}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>Customer Details</h4>
                  <p style={{ margin: '0 0 0.3rem 0' }}><strong>Name:</strong> {order.customerName || 'N/A'}</p>
                  <p style={{ margin: '0 0 0.3rem 0' }}><strong>Phone:</strong> {order.customerPhone || 'N/A'}</p>
                  <p style={{ margin: 0 }}><strong>Delivery Address:</strong> {order.deliveryAddress || 'N/A'}</p>
                </div>

                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Order Items:</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {order.items.map(item => (
                      <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <span>{item.quantity}x {item.menuItemName}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Your Menu</h2>
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={() => {
                setEditingItemId(null);
                setMenuForm({ name: '', description: '', price: '', type: 'Veg', image: '' });
                setIsMenuModalOpen(true);
            }}>+ Add Item</button>
          </div>
          
          {menuItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No menu items added.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {menuItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0' }}>{item.name} <span className="badge badge-success">{item.type}</span></h4>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.description}</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>₹{item.price}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem', background: 'var(--secondary)' }} onClick={() => {
                        setMenuForm({ name: item.name, description: item.description, price: item.price, type: item.type, image: item.image || '' });
                        setEditingItemId(item.id);
                        setIsMenuModalOpen(true);
                    }}>Edit</button>
                    <button className="btn-primary" style={{ background: '#e74c3c', padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteMenuItem(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isMenuModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setIsMenuModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingItemId ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            <form onSubmit={handleAddMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" className="form-control" placeholder="Item Name" required value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} />
              <input type="text" className="form-control" placeholder="Description" required value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} />
              <input type="number" className="form-control" placeholder="Price (₹)" required value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} />
              <select className="form-control" value={menuForm.type} onChange={e => setMenuForm({...menuForm, type: e.target.value})}>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
              <input type="url" className="form-control" placeholder="Image URL (Optional)" value={menuForm.image} onChange={e => setMenuForm({...menuForm, image: e.target.value})} />
              <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}>Save Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
