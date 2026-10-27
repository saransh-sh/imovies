import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut, Ticket } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-brutal">
      <div className="navbar-inner">
        <Link to="/" className="nav-logo">
          <Film size={26} strokeWidth={3} />
          <span>IMOVIES</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className="btn-brutal btn-brutal-sm btn-brutal-cyan">
            BROWSE MOVIES
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" className="btn-brutal btn-brutal-sm">
                <Ticket size={16} strokeWidth={3} />
                MY BOOKINGS
              </Link>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: '#FFFFFF',
                  padding: '6px 12px',
                  border: 'var(--border-thin)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <User size={14} />
                <span>{user?.name?.split(' ')[0] || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-brutal btn-brutal-sm btn-brutal-magenta"
                title="Logout"
              >
                <LogOut size={16} strokeWidth={3} />
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-brutal btn-brutal-sm">
                LOGIN
              </Link>
              <Link to="/register" className="btn-brutal btn-brutal-sm btn-brutal-magenta">
                SIGN UP
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
