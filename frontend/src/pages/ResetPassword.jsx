import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Pre-fill email if passed from ForgotPassword screen
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      await resetPassword(email, otp, newPassword);
      setMessage('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Invalid OTP or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter OTP and your new password</p>
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

          <div className="form-group">
            <label className="form-label">OTP Code</label>
            <input 
              type="text" 
              className="form-control" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ fontWeight: 600 }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
