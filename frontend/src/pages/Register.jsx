import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('ROLE_CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, phone, address, role);
      navigate('/login'); // Redirect to login upon successful registration
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Backend might be unreachable or email already exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join FoodExpress today!</p>
        </div>

        {error && <div style={{ background: 'rgba(240, 79, 35, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(240, 79, 35, 0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              className="form-control" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input 
              type="text" 
              className="form-control" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select 
              className="form-control" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: 'white' }}
            >
              <option value="ROLE_CUSTOMER">Customer</option>
              <option value="ROLE_RESTAURANT_OWNER">Restaurant Owner</option>
              <option value="ROLE_DELIVERY_BOY">Delivery Partner</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
