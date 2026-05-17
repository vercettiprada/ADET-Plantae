import React from 'react';

const CareFact = ({ label, value }) => (
  <div className="care-item">
    <div className="care-text">
      <h4>{label}</h4>
      <p>{value}</p>
    </div>
  </div>
);

export default CareFact;
