import React from 'react';

const PlantCard = ({ plant, onCardClick }) => (
  <article className="plant-card" onClick={() => onCardClick(plant)}>
    <img src={plant.imageUrl} alt={plant.name} className="plant-image" />
    <div className="card-overlay">
      <h2 className="clickable-name">{plant.name}</h2>
      <p className="species-text">{plant.species}</p>
      <div className="care-prompt">
        <span>Care Guide</span>
      </div>
    </div>
  </article>
);

export default PlantCard;
