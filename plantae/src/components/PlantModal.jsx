import React, { useState, useEffect } from 'react';
import CareFact from './CareFact';

const PlantModal = ({ plant, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState({ ...plant });

  // Update local state if a different plant is selected
  useEffect(() => {
    setEditedPlant({ ...plant });
    setIsEditing(false);
  }, [plant]);

  if (!plant) return null;

  const handleSave = () => {
    onSave(editedPlant);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedPlant(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="expanded-square-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Control Buttons */}
        <div className="modal-top-controls">
          <button 
            className={`edit-toggle-btn ${isEditing ? 'saving' : ''}`} 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? 'Save' : '✎'}
          </button>
          <button className="close-x" onClick={onClose}>×</button>
        </div>
        
        <div className="card-content">
          <div className="card-image-side">
            <img src={editedPlant.imageUrl} alt={editedPlant.name} />
          </div>
          
          <div className="card-info-side">
            {isEditing ? (
              <>
                <input 
                  className="edit-input-title" 
                  value={editedPlant.name} 
                  onChange={(e) => handleChange('name', e.target.value)} 
                />
                <input 
                  className="edit-input-species" 
                  value={editedPlant.species} 
                  onChange={(e) => handleChange('species', e.target.value)} 
                />
              </>
            ) : (
              <>
                <h1>{editedPlant.name}</h1>
                <p className="latin-name"><i>{editedPlant.species}</i></p>
              </>
            )}

            <div className="care-section">
              <h3 className="care-facts-header">Plant Care & Info</h3>
              <div className="care-facts-grid">
                <CareFact label="Light" value={editedPlant.light}  />
                <CareFact label="Water" value={editedPlant.water} />
              </div>
            </div>

            <div className="secret-fact-box">
              <h4>Secret Fact</h4>
              {isEditing ? (
                <textarea 
                  className="edit-textarea"
                  value={editedPlant.secretfact}
                  onChange={(e) => handleChange('secretfact', e.target.value)}
                />
              ) : (
                <p>{editedPlant.secretfact}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantModal;