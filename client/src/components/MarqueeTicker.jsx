import React from 'react';

const MarqueeTicker = () => {
  const tickerText =
    '/// NOW SHOWING /// INSTANT SEAT MAP /// NO ADS /// ZERO FEES /// HACKTOBERFEST 2026 VIBES /// RAW BRUTALISM /// CONFIRMED SEATING /// BOOK IN SECONDS /// ';

  return (
    <div className="marquee-container" aria-hidden="true">
      <div className="marquee-content">
        {tickerText.repeat(4)}
      </div>
    </div>
  );
};

export default MarqueeTicker;
