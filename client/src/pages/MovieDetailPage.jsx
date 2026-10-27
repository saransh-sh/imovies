import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Clock, Star, Calendar, MapPin, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/movies/${id}`);
        if (res.data.success) {
          setMovie(res.data.movie);
          setShowtimes(res.data.showtimes || []);
        } else {
          setError('Movie not found.');
        }
      } catch (err) {
        console.error('Fetch movie details error:', err);
        setError('Failed to load movie information. Please retry.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

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
          LOADING FEATURE FILM DETAILS...
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div className="alert-brutal alert-error">
          <AlertCircle size={24} style={{ marginBottom: '8px' }} />
          <h3>{error || 'Movie Not Found'}</h3>
          <p style={{ marginTop: '8px' }}>The requested film could not be retrieved from the database.</p>
        </div>
        <Link to="/" className="btn-brutal">
          BACK TO HOME
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          marginBottom: '24px',
        }}
      >
        <Link to="/" style={{ textDecoration: 'underline' }}>
          MOVIES
        </Link>
        <ChevronRight size={14} />
        <span style={{ fontWeight: 700 }}>{movie.title.toUpperCase()}</span>
      </div>

      {/* Main Movie Hero Section */}
      <div
        className="card-brutal"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          padding: '32px',
          marginBottom: '48px',
          background: '#FFFFFF',
        }}
      >
        {/* Poster */}
        <div
          style={{
            height: '420px',
            border: 'var(--border-medium)',
            boxShadow: 'var(--shadow-medium)',
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <img
            src={movie.posterUrl}
            alt={movie.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge-brutal badge-magenta">{movie.genre}</span>
            <span className="badge-brutal badge-cyan">{movie.language}</span>
            <span className="badge-brutal badge-green">IN CINEMAS</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '14px' }}>
            {movie.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: 'var(--border-thin)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>{movie.duration} MINUTES</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} fill="var(--accent-yellow)" />
              <span style={{ fontWeight: 700 }}>{movie.rating} / 10</span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>SYNOPSIS</h4>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.05rem',
                lineHeight: '1.6',
                color: '#222',
              }}
            >
              {movie.description || 'No synopsis available for this feature film.'}
            </p>
          </div>

          <div
            style={{
              marginTop: 'auto',
              background: 'var(--bg-primary)',
              padding: '12px 16px',
              border: 'var(--border-thin)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            <div>RELEASE DATE: {new Date(movie.releaseDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div>
        <h2 className="section-title">AVAILABLE SHOWTIMES</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#666', marginBottom: '24px' }}>
          PICK A TIME SLOT TO SELECT YOUR SEATS ON THE INTERACTIVE SCREEN MAP
        </p>

        {showtimes.length === 0 ? (
          <div
            className="card-brutal"
            style={{ padding: '32px', textAlign: 'center', background: '#FFFFFF' }}
          >
            <h3>NO ACTIVE SHOWTIMES FOUND</h3>
            <p style={{ fontFamily: 'var(--font-mono)', color: '#666', marginTop: '8px' }}>
              Please check back soon for newly scheduled auditoriums.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {showtimes.map((st) => {
              const availableSeatsCount = st.totalSeats - (st.bookedSeats?.length || 0);
              const showDate = new Date(st.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={st._id}
                  className="card-brutal"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#FFFFFF',
                  }}
                >
                  <div>
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                      <span className="badge-brutal">{showDate}</span>
                      <span
                        className={`badge-brutal ${
                          availableSeatsCount <= 5 ? 'badge-red' : 'badge-green'
                        }`}
                      >
                        {availableSeatsCount} SEATS LEFT
                      </span>
                    </div>

                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2rem',
                        marginBottom: '8px',
                      }}
                    >
                      {st.time}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        color: '#555',
                        marginBottom: '16px',
                      }}
                    >
                      <MapPin size={15} />
                      <span>{st.hall}</span>
                    </div>
                  </div>

                  <div>
                    <div
                      className="flex-between"
                      style={{
                        marginBottom: '16px',
                        paddingTop: '12px',
                        borderTop: 'var(--border-thin)',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        TICKET PRICE
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.4rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        ₹{st.price}
                      </span>
                    </div>

                    <Link
                      to={`/book/${st._id}`}
                      className="btn-brutal btn-brutal-cyan"
                      style={{ width: '100%' }}
                    >
                      <span>SELECT SEATS</span>
                      <ChevronRight size={18} strokeWidth={3} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
