import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      await forgotPassword(email);
      setMessage('OTP sent successfully to your email/phone.');
      setTimeout(() => {
        // Pass email state to next screen
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. User may not exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Forgot Password</h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter your email to receive an OTP</p>
        </div>

        {error && <div style={{ background: 'rgba(240, 79, 35, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(240, 79, 35, 0.2)' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(46, 204, 113, 0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(46, 204, 113, 0.2)' }}>{message}</div>}

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
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Remember your password? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
