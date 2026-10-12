import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function OAuth2RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthData } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    try {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const token = params.get('token');
      const email = params.get('email');
      const name = params.get('name');
      const role = params.get('role') || 'ROLE_CUSTOMER';
      const id = params.get('id');
      const error = params.get('error');

      if (error) {
        setErrorMessage(error || 'Failed to authenticate with Google.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (token) {
        let cleanName = name || 'Google User';
        try {
          if (cleanName.includes('%')) {
            cleanName = decodeURIComponent(cleanName);
          }
        } catch (e) {
          // ignore malformed URI
        }

        const userData = {
          id: id ? parseInt(id, 10) : Date.now(),
          name: cleanName,
          email: email || '',
          role: role
        };

        setAuthData(token, userData);

        let redirectTarget = '/';
        if (role === 'ROLE_RESTAURANT_OWNER') {
          redirectTarget = '/restaurant/dashboard';
        } else if (role === 'ROLE_ADMIN') {
          redirectTarget = '/admin/dashboard';
        } else if (role === 'ROLE_DELIVERY_BOY') {
          redirectTarget = '/delivery/dashboard';
        }

        // Redirect immediately
        window.location.href = redirectTarget;
      } else {
        setErrorMessage('No authentication token received from Google.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      console.error('OAuth redirect error:', err);
      window.location.href = '/';
    }
  }, [setAuthData]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--bg-color)',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
        {errorMessage ? (
          <div>
            <div style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#ef4444' }}>Login Failed</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{errorMessage}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '16px' }}>Redirecting to Login...</p>
          </div>
        ) : (
          <div>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Signing in with Google</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please wait, authenticating your account...</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
