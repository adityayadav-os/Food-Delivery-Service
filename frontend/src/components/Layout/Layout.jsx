import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

export default function Layout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content animate-fade-in">
        <Outlet />
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto'
      }}>
        <p>© 2026 FoodExpress Monolithic UI. Built for Microservices.</p>
      </footer>
    </div>
  );
}
