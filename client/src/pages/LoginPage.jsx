import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, Sparkles, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message || 'Login failed');
    }
  };

  const handleUseDemo = () => {
    setEmail('demo@imovies.com');
    setPassword('password123');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div
        className="card-brutal"
        style={{
          padding: '40px',
          background: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge-brutal badge-magenta">AUTHENTICATION</span>
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>WELCOME BACK</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#666', marginBottom: '24px' }}>
          LOG IN TO ACCESS SEAT RESERVATION AND YOUR BOOKING HISTORY
        </p>

        {error && (
          <div className="alert-brutal alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="neo@matrix.org"
                className="input-brutal"
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-brutal"
                style={{ paddingLeft: '40px' }}
              />
              <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-brutal"
            style={{ width: '100%', marginBottom: '16px' }}
          >
            <LogIn size={18} strokeWidth={3} />
            <span>{isSubmitting ? 'VERIFYING...' : 'LOGIN TO ACCOUNT'}</span>
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div
          style={{
            borderTop: 'var(--border-thin)',
            paddingTop: '20px',
            marginTop: '20px',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleUseDemo}
            className="btn-brutal btn-brutal-sm btn-brutal-cyan"
            style={{ width: '100%', marginBottom: '16px' }}
          >
            <Sparkles size={16} />
            <span>FILL DEMO CREDENTIALS (EVALUATOR SHORTCUT)</span>
          </button>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            Don't have an account yet?{' '}
            <Link
              to="/register"
              style={{
                fontFamily: 'var(--font-heading)',
                textDecoration: 'underline',
                color: 'var(--accent-magenta)',
              }}
            >
              SIGN UP HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
