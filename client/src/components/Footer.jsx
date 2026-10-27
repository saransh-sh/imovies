import React from 'react';
import { Film, Github, Terminal, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-brutal">
      <div className="main-content" style={{ padding: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '32px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--accent-yellow)',
                color: '#000000',
                padding: '6px 14px',
                border: 'var(--border-medium)',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                marginBottom: '14px',
              }}
            >
              <Film size={22} strokeWidth={3} />
              <span>IMOVIES</span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: '#BBB',
                maxWidth: '400px',
              }}
            >
              Raw, honest, high-contrast cinema ticket booking.
              Built as an individual capstone project inspired by Hacktoberfest 2026.
            </p>
          </div>

          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                marginBottom: '12px',
                color: 'var(--accent-cyan)',
              }}
            >
              TECH STACK
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge-brutal">REACT 18</span>
              <span className="badge-brutal badge-magenta">VITE</span>
              <span className="badge-brutal badge-green">EXPRESS.JS</span>
              <span className="badge-brutal">MONGOOSE</span>
              <span className="badge-brutal badge-cyan">JWT AUTH</span>
            </div>
          </div>

          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                marginBottom: '12px',
                color: 'var(--accent-magenta)',
              }}
            >
              DEPLOYMENT TARGETS
            </h4>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#CCC', lineHeight: '1.8' }}>
              <div>• Render Web Service (API)</div>
              <div>• Vercel Edge / SPA (Client)</div>
              <div>• MongoDB Atlas Cloud M0</div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #444',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#888',
          }}
        >
          <div>
            © 2026 IMovies — Authored by Saransh. Zero tracking, zero trackers.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={14} />
            <span>NEO-BRUTALISM // CAPS ONLY HEADINGS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
