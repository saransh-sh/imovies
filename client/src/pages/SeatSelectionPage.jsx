import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import SeatGrid from '../components/SeatGrid';
import { Calendar, Clock, MapPin, Check, AlertCircle, ChevronLeft, ShieldCheck } from 'lucide-react';

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchShowtime = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/showtimes/${showtimeId}`);
      if (res.data.success) {
        setShowtime(res.data.showtime);
      } else {
        setError('Showtime could not be loaded.');
      }
    } catch (err) {
      console.error('Fetch showtime error:', err);
      setError('Failed to fetch showtime details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtime();
  }, [showtimeId]);

  const handleSeatToggle = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat before proceeding.');
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const res = await api.post('/bookings', {
        showtimeId: showtime._id,
        seats: selectedSeats,
      });

      if (res.data.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1200);
      }
    } catch (err) {
      console.error('Booking creation error:', err);
      const msg = err.response?.data?.message || 'Failed to complete booking.';
      setError(msg);
      // Refresh showtime to update bookedSeats in real-time
      fetchShowtime();
    } finally {
      setBookingLoading(false);
    }
  };

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
          LOADING SEAT MAP & AUDITORIUM...
        </div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div className="alert-brutal alert-error">
          <h3>Showtime Not Found</h3>
        </div>
        <Link to="/" className="btn-brutal">
          BACK TO HOME
        </Link>
      </div>
    );
  }

  const movie = showtime.movieId;
  const totalAmount = selectedSeats.length * showtime.price;
  const showDate = new Date(showtime.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={`/movies/${movie?._id || ''}`}
          className="btn-brutal btn-brutal-sm btn-brutal-cyan"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronLeft size={16} strokeWidth={3} />
          <span>BACK TO MOVIE DETAILS</span>
        </Link>
      </div>

      {/* Showtime Banner */}
      <div
        className="card-brutal"
        style={{
          padding: '24px',
          marginBottom: '32px',
          background: '#FFFFFF',
        }}
      >
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="badge-brutal badge-magenta">AUDITORIUM BOOKING</span>
              <span className="badge-brutal">{movie?.genre}</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{movie?.title}</h1>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: '#444',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} />
                <span>{showDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                <span>{showtime.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                <span>{showtime.hall}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              background: 'var(--bg-primary)',
              padding: '12px 20px',
              border: 'var(--border-thin)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#666' }}>
              SEAT PRICE
            </span>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>
              ₹{showtime.price}
            </div>
          </div>
        </div>
      </div>

      {/* Error or Success notification */}
      {error && (
        <div className="alert-brutal alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {bookingSuccess && (
        <div className="alert-brutal alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} />
          <span>SEATS CONFIRMED! REDIRECTING TO YOUR BOOKINGS DASHBOARD...</span>
        </div>
      )}

      {/* Interactive Seat Grid */}
      <SeatGrid
        totalSeats={showtime.totalSeats}
        bookedSeats={showtime.bookedSeats || []}
        selectedSeats={selectedSeats}
        onSeatToggle={handleSeatToggle}
      />

      {/* Sticky Bottom Booking Summary Bar */}
      <div className="booking-summary-bar">
        <div className="summary-details">
          <h4>YOUR SELECTED SEATS</h4>
          <div className="summary-meta">
            {selectedSeats.length > 0 ? (
              <span>
                SEATS:{' '}
                <strong style={{ color: 'var(--accent-magenta)', letterSpacing: '1px' }}>
                  {selectedSeats.join(', ')}
                </strong>{' '}
                ({selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'})
              </span>
            ) : (
              <span style={{ color: '#777' }}>Click on any neon green seat above to select</span>
            )}
          </div>
          {selectedSeats.length > 0 && (
            <div className="summary-total">
              TOTAL: ₹{totalAmount}
            </div>
          )}
        </div>

        <button
          onClick={handleConfirmBooking}
          disabled={selectedSeats.length === 0 || bookingLoading || bookingSuccess}
          className="btn-brutal btn-brutal-magenta"
          style={{ minWidth: '220px' }}
        >
          <Check size={18} strokeWidth={3} />
          <span>
            {bookingLoading ? 'RESERVING SEATS...' : `CONFIRM BOOKING (₹${totalAmount})`}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
