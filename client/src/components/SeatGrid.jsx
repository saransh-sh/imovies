import React from 'react';
import '../styles/seat-grid.css';

const SeatGrid = ({
  bookedSeats = [],
  selectedSeats = [],
  onSeatToggle,
}) => {
  // 5 rows (A-E) x 8 columns = 40 seats
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const columns = [1, 2, 3, 4, 5, 6, 7, 8];

  const isBooked = (seatId) => bookedSeats.includes(seatId);
  const isSelected = (seatId) => selectedSeats.includes(seatId);

  return (
    <div style={{ width: '100%' }}>
      {/* Curved Screen */}
      <div className="theatre-screen-wrapper">
        <div className="theatre-screen">
          <span>CINEMA SCREEN HERE</span>
          <div className="screen-curve"></div>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '6px', color: '#666' }}>
          EYES TOWARDS FRONT OF THE AUDITORIUM
        </p>
      </div>

      {/* Seat Grid */}
      <div className="seat-map-container">
        {rows.map((row) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>

            <div className="seats-in-row">
              {columns.map((col) => {
                const seatId = `${row}${col}`;
                const booked = isBooked(seatId);
                const selected = isSelected(seatId);

                let seatClass = 'seat-btn available';
                if (booked) seatClass = 'seat-btn booked';
                else if (selected) seatClass = 'seat-btn selected';

                return (
                  <React.Fragment key={seatId}>
                    <button
                      type="button"
                      className={seatClass}
                      disabled={booked}
                      onClick={() => onSeatToggle(seatId)}
                      title={`Seat ${seatId} - ${booked ? 'Already Booked' : selected ? 'Selected' : 'Available'}`}
                    >
                      {seatId}
                    </button>
                    {/* Add aisle gap between column 4 and 5 */}
                    {col === 4 && <div className="seat-aisle-gap" />}
                  </React.Fragment>
                );
              })}
            </div>

            <span className="row-label">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-indicator legend-available"></div>
          <span>AVAILABLE</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator legend-selected"></div>
          <span>SELECTED</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator legend-booked"></div>
          <span>BOOKED</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
