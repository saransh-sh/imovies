import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(['All', 'Sci-Fi', 'Action', 'Drama', 'Animation', 'Comedy']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/movies');
      if (res.data.success) {
        setMovies(res.data.movies);
      } else {
        setError('Failed to fetch movies from server.');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(
        'Could not connect to the movie API. If hosted on a free Render tier, please wait 30-40 seconds for spin-up.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Filter movies based on genre and search keyword
  const filteredMovies = movies.filter((movie) => {
    const matchesGenre = selectedGenre === 'All' || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div>
      <HeroBanner />

      <section id="movies-section">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h2 className="section-title">NOW PLAYING IN THEATRES</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
              SELECT A FILM TO VIEW AUDITORIUM SCHEDULES & LIVE SEAT MAPS
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <input
              type="text"
              placeholder="SEARCH MOVIES OR GENRE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-brutal"
              style={{ paddingLeft: '42px' }}
            />
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        {/* Genre Filter Badges */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {genres.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`btn-brutal btn-brutal-sm ${isActive ? 'btn-brutal-magenta' : 'btn-brutal-cyan'}`}
                style={{
                  border: 'var(--border-medium)',
                  boxShadow: isActive ? '3px 3px 0px #000' : '2px 2px 0px #000',
                }}
              >
                {genre.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-brutal alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button onClick={fetchMovies} className="btn-brutal btn-brutal-sm">
              <RefreshCw size={14} /> RETRY
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--accent-yellow)',
                border: 'var(--border-thick)',
                boxShadow: 'var(--shadow-large)',
                padding: '20px 32px',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
              }}
            >
              <RefreshCw size={24} className="spin-icon" />
              <span>LOADING FEATURE FILMS...</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#666', marginTop: '16px' }}>
              Render cold-starts may take ~30 seconds on the free tier. Hang tight!
            </p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow-large)',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>NO MOVIES FOUND</h3>
            <p style={{ fontFamily: 'var(--font-mono)', color: '#666', marginBottom: '20px' }}>
              No films match your search term "{searchTerm}" in category "{selectedGenre}".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('All');
              }}
              className="btn-brutal"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
