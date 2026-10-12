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
  const googleAuthUrl = (import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081') + '/oauth2/authorization/google';

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

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.85rem' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
        </div>

        <a 
          href={googleAuthUrl} 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign in with Google
        </a>
        
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
