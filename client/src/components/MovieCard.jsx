import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Play } from 'lucide-react';

const MovieCard = ({ movie }) => {
  return (
    <div
      className="card-brutal"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Poster Image Container */}
      <div
        style={{
          width: '100%',
          height: '320px',
          overflow: 'hidden',
          borderBottom: 'var(--border-medium)',
          position: 'relative',
          backgroundColor: '#000000',
        }}
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: 'contrast(105%)',
          }}
          onError={(e) => {
            // Fallback placeholder
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--accent-yellow)',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-small)',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
          }}
        >
          <Star size={14} fill="#000000" />
          <span>{movie.rating || 'N/A'}</span>
        </div>
      </div>

      {/* Movie Info */}
      <div
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span className="badge-brutal badge-cyan">{movie.genre}</span>
          <span className="badge-brutal">{movie.language || 'English'}</span>
        </div>

        <h3
          style={{
            fontSize: '1.4rem',
            marginBottom: '10px',
            lineHeight: '1.2',
          }}
        >
          {movie.title}
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}
        >
          <Clock size={15} />
          <span>{movie.duration} MIN</span>
        </div>

        {movie.description && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: '#333',
              marginBottom: '20px',
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {movie.description}
          </p>
        )}

        {/* CTA Button */}
        <Link
          to={`/movies/${movie._id}`}
          className="btn-brutal btn-brutal-magenta"
          style={{ width: '100%', marginTop: 'auto' }}
        >
          <span>SELECT SHOWTIME</span>
          <Play size={16} fill="currentColor" />
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
