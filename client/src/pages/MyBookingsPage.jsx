import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import BookingCard from '../components/BookingCard';
import { Ticket, RefreshCw, AlertCircle, Film, ArrowRight } from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/bookings/me');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      } else {
        setError('Failed to fetch bookings.');
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError('Could not load your bookings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking? The reserved seats will immediately be released back to the auditorium.'
    );
    if (!confirmed) return;

    setCancellingId(bookingId);
    setFeedbackMessage(null);

    try {
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? res.data.booking : b))
        );
        setFeedbackMessage({
          type: 'success',
          text: 'Booking cancelled successfully. Your seats have been released.',
        });
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      const msg = err.response?.data?.message || 'Failed to cancel booking.';
      setFeedbackMessage({ type: 'error', text: msg });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="section-title">MY BOOKINGS</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
            MANAGE YOUR CINEMA PASSES AND VIEW AUDITORIUM SCHEDULES
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="btn-brutal btn-brutal-sm btn-brutal-cyan"
          disabled={loading}
        >
          <RefreshCw size={14} />
          <span>REFRESH</span>
        </button>
      </div>

      {feedbackMessage && (
        <div
          className={`alert-brutal ${
            feedbackMessage.type === 'success' ? 'alert-success' : 'alert-error'
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      {error && (
        <div className="alert-brutal alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'var(--accent-yellow)',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow-large)',
              padding: '20px 32px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
            }}
          >
            RETRIEVING RESERVATIONS...
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div
          className="card-brutal"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#FFFFFF',
          }}
        >
          <Ticket size={48} style={{ marginBottom: '16px', color: 'var(--accent-magenta)' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>NO BOOKINGS FOUND</h2>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              color: '#555',
              maxWidth: '450px',
              margin: '0 auto 24px auto',
            }}
          >
            You have not booked any movie tickets yet. Browse currently showing films and reserve your seat!
          </p>
          <Link to="/" className="btn-brutal">
            <span>BROWSE NOW SHOWING</span>
            <ArrowRight size={18} strokeWidth={3} />
          </Link>
        </div>
      ) : (
        <div>
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancelBooking}
              isCancelling={cancellingId === booking._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
