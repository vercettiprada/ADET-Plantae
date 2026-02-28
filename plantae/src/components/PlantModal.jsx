import React from 'react';
import CareFact from './CareFact';

const PlantModal = ({ plant, onClose }) => {
  if (!plant) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="expanded-square-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>×</button>
        
        <div className="card-content">
          <div className="card-image-side">
            <img src={plant.imageUrl} alt={plant.name} />
          </div>
          
          <div className="card-info-side">
            <h1>{plant.name}</h1>
            <p className="latin-name"><i>{plant.species}</i></p>

            <div className="care-section">
              <h3 className="care-facts-header">Plant Care & Info</h3>
              <div className="care-facts-grid">
                <CareFact label="Light" value={plant.light} delay={0.1} />
                <CareFact label="Water" value={plant.water} delay={0.2} />
              </div>
            </div>

            <div className="secret-fact-box">
              <h4>Secret Fact</h4>
              <p>{plant.secretfact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantModal;