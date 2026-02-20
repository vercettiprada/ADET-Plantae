import React from 'react';

const PlantCard = ({ plant, onCardClick }) => {
  return (
    <div 
      className="plant-card" 
      onClick={() => onCardClick(plant)}
    >
      <img src={plant.imageUrl} alt={plant.name} className="plant-image" />
      <div className="card-overlay">
        <h2 className="clickable-name">{plant.name}</h2>
        <p className="species-text"><i>{plant.species}</i></p>
        <div className="care-prompt">
          <span>Care Guide</span>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;