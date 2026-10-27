import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div
          style={{
            display: 'inline-block',
            background: 'var(--accent-yellow)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-large)',
            padding: '24px 40px',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
          }}
        >
          AUTHENTICATING SESSION...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
