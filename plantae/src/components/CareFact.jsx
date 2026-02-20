import React from 'react';

const CareFact = ({ icon, label, value, delay }) => {
  return (
    <div className="care-item" style={{ animationDelay: `${delay}s` }}>
      <div className="care-icon">{icon}</div>
      <div className="care-text">
        <h4>{label}</h4>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default CareFact;