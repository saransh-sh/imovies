import React from 'react';
import { ArrowDown, Flame, ShieldCheck, Zap } from 'lucide-react';

const HeroBanner = () => {
  const scrollToMovies = () => {
    const el = document.getElementById('movies-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-dark)',
        color: '#FFFFFF',
        border: 'var(--border-thick)',
        boxShadow: 'var(--shadow-large)',
        padding: '48px 32px',
        marginBottom: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span className="badge-brutal">HACKTOBERFEST 2026 EDITION</span>
        <span className="badge-brutal badge-magenta">NO BLOAT</span>
        <span className="badge-brutal badge-green">LIVE SEATS</span>
      </div>

      <h1
        style={{
          fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
          letterSpacing: '-1.5px',
          maxWidth: '900px',
          marginBottom: '20px',
          color: '#FFFFFF',
          textShadow: '3px 3px 0px #000000',
        }}
      >
        SKIP THE LINE. <br />
        <span style={{ background: 'var(--accent-yellow)', color: '#000000', padding: '0 8px' }}>
          GRAB YOUR SEAT.
        </span>
      </h1>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.1rem',
          maxWidth: '680px',
          marginBottom: '32px',
          color: '#E0E0E0',
          lineHeight: '1.6',
        }}
      >
        No tracking cookies. No 20-step checkout tunnels. A raw, high-contrast
        experience that connects you directly to the theatre screen.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button onClick={scrollToMovies} className="btn-brutal">
          <span>BROWSE NOW SHOWING</span>
          <ArrowDown size={20} strokeWidth={3} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#AAAAAA',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="var(--accent-yellow)" />
            <span>Real-time availability</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--accent-green)" />
            <span>Anti-race-condition booking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
