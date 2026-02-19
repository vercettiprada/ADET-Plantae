import React from 'react';

// We pass the 'plant' data as a prop
const PlantCard = ({ plant }) => {
  return (
    <div className="plant-card">
      <img src={plant.imageUrl} alt={plant.name} className="plant-image" />
      
      <div className="card-overlay">
        {/* Dynamic class name based on status could allow for different colors later */}
        <span className={`status-badge ${plant.healthStatus.toLowerCase().replace(' ', '-')}`}>
          {plant.healthStatus}
        </span>
        <h2>{plant.name}</h2>
        <p><i>{plant.species}</i></p>
      </div>
    </div>
  );
};

export default PlantCard;