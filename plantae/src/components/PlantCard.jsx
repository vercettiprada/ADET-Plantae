import React, { useEffect, useState } from 'react';
import { api } from '../api';

const PlantCard = ({ plant, onCardClick }) => {
  // Update state if the plant prop changes (e.g., after the POST/GET cycle)
  const [imageSrc, setImageSrc] = useState(plant.imageUrl || api.imageFallback);

  useEffect(() => {
    setImageSrc(plant.imageUrl || api.imageFallback);
  }, [plant.imageUrl]);

  return (
    <article className="plant-card" onClick={() => onCardClick(plant)}>
      <img
        src={imageSrc}
        alt={plant.name}
        className="plant-image"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setImageSrc(api.imageFallback)}
      />
      <div className="card-overlay">
        <h2 className="clickable-name">{plant.name}</h2>
        <p className="species-text">{plant.species}</p>
        <div className="care-prompt">
          <span>Care Guide</span>
        </div>
      </div>
    </article>
  );
};

export default PlantCard;