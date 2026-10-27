import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.message || 'Registration failed');
    }
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
          <span className="badge-brutal badge-green">JOIN THE REVOLUTION</span>
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>CREATE ACCOUNT</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#666', marginBottom: '24px' }}>
          REGISTER TO BOOK SEATS IN 3 CLICKS WITH ZERO REDIRECTS
        </p>

        {error && (
          <div className="alert-brutal alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              FULL NAME
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="input-brutal"
                style={{ paddingLeft: '40px' }}
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

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
                placeholder="ada@lovelace.dev"
                className="input-brutal"
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              PASSWORD (MIN 6 CHARS)
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

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              CONFIRM PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="btn-brutal btn-brutal-magenta"
            style={{ width: '100%', marginBottom: '16px' }}
          >
            <UserPlus size={18} strokeWidth={3} />
            <span>{isSubmitting ? 'CREATING PROFILE...' : 'REGISTER & CONTINUE'}</span>
          </button>
        </form>

        <div
          style={{
            borderTop: 'var(--border-thin)',
            paddingTop: '20px',
            marginTop: '20px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            Already registered?{' '}
            <Link
              to="/login"
              style={{
                fontFamily: 'var(--font-heading)',
                textDecoration: 'underline',
                color: 'var(--text-primary)',
              }}
            >
              LOG IN INSTEAD
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
