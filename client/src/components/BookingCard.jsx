import React from 'react';
import { Calendar, Clock, MapPin, XCircle, CheckCircle, Ticket } from 'lucide-react';

const BookingCard = ({ booking, onCancel, isCancelling }) => {
  const isConfirmed = booking.status === 'confirmed';
  const showtime = booking.showtimeId;
  const movie = showtime?.movieId;

  const formattedDate = showtime?.date
    ? new Date(showtime.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date Unavailable';

  return (
    <div
      className="card-brutal"
      style={{
        padding: '24px',
        marginBottom: '24px',
        borderLeft: isConfirmed ? '8px solid var(--accent-green)' : '8px solid var(--accent-red)',
      }}
    >
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              className={`badge-brutal ${isConfirmed ? 'badge-green' : 'badge-red'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {isConfirmed ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {booking.status.toUpperCase()}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#666' }}>
              ID: {booking._id}
            </span>
          </div>

          <h3 style={{ fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
            {movie?.title || 'Unknown Feature Film'}
          </h3>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#666' }}>
            TOTAL PAID
          </span>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              color: 'var(--text-primary)',
            }}
          >
            ₹{booking.totalAmount}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          background: 'var(--bg-primary)',
          padding: '16px',
          border: 'var(--border-thin)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} />
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#666' }}>DATE</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formattedDate}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} />
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#666' }}>TIME</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{showtime?.time || 'N/A'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} />
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#666' }}>AUDITORIUM</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{showtime?.hall || 'Screen 1'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ticket size={18} />
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#666' }}>SEATS ({booking.seats.length})</div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                fontSize: '0.95rem',
                color: 'var(--accent-magenta)',
              }}
            >
              {booking.seats.join(', ')}
            </div>
          </div>
        </div>
      </div>

      {isConfirmed && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onCancel(booking._id)}
            disabled={isCancelling}
            className="btn-brutal btn-brutal-sm btn-brutal-magenta"
          >
            <XCircle size={16} strokeWidth={3} />
            <span>{isCancelling ? 'PROCESSING CANCELLATION...' : 'CANCEL BOOKING'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
