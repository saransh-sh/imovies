import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import MarqueeTicker from './components/MarqueeTicker';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import MyBookingsPage from './pages/MyBookingsPage';

const NotFoundPage = () => (
  <div style={{ textAlign: 'center', padding: '80px 20px' }}>
    <div
      className="card-brutal"
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '40px',
        background: '#FFFFFF',
      }}
    >
      <span className="badge-brutal badge-red" style={{ marginBottom: '16px' }}>
        ERROR 404
      </span>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>PAGE NOT FOUND</h1>
      <p style={{ fontFamily: 'var(--font-mono)', color: '#666', marginBottom: '24px' }}>
        The cinema reel you are looking for does not exist on this projector.
      </p>
      <Link to="/" className="btn-brutal">
        RETURN TO HOME
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <MarqueeTicker />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/movies/:id" element={<MovieDetailPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/book/:showtimeId"
                element={
                  <PrivateRoute>
                    <SeatSelectionPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <MyBookingsPage />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
