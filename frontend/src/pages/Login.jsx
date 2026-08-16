import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(email, password);
      const userRole = response.user?.role || 'ROLE_CUSTOMER';
      
      if (userRole === 'ROLE_RESTAURANT_OWNER') {
        navigate('/restaurant/dashboard');
      } else if (userRole === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'ROLE_DELIVERY_BOY') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid credentials or backend not responding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to FoodExpress</p>
        </div>

        {error && <div style={{ background: 'rgba(240, 79, 35, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(240, 79, 35, 0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <Link to="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Forgot Password?</Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            New here? <Link to="/register" style={{ fontWeight: 600 }}>Register</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
