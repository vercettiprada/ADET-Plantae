import React from 'react';

// We use "destructuring" to get the plant data directly from props
const PlantCard = ({ plant }) => {
  return (
    <section className="plant-card">
      <img src={plant.imageUrl} alt={plant.name} className="plant-image" />
      <div className="gradient-overlay">
        <span className="status-badge">{plant.healthStatus}</span>
        <h2>{plant.name}</h2>
        <p><i>{plant.species}</i></p>
      </div>
    </section>
  );
};

export default PlantCard;