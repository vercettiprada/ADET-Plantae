import React, { useEffect, useState } from 'react';
import { api } from '../api';
import CareFact from './CareFact';

const PlantModal = ({ plant, onClose, onSave, saving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState(plant || {});
  const [imageSrc, setImageSrc] = useState(plant?.imageUrl || api.imageFallback);

  useEffect(() => {
    setEditedPlant(plant || {});
    setImageSrc(plant?.imageUrl || api.imageFallback);
    setIsEditing(false);
  }, [plant]);

  if (!plant) {
    return null;
  }

  const handleSave = async () => {
    const saved = await onSave(editedPlant);
    if (saved) {
      setIsEditing(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedPlant((prev) => ({ ...prev, [field]: value }));
  };

  const hardinessRange = editedPlant.hardinessMin && editedPlant.hardinessMax
    ? `${editedPlant.hardinessMin} - ${editedPlant.hardinessMax}`
    : '';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="expanded-square-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-top-controls">
          <button
            className={`edit-toggle-btn ${isEditing ? 'saving' : ''}`}
            type="button"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={saving}
          >
            {isEditing ? (saving ? 'Saving...' : 'Save') : 'Edit'}
          </button>
          <button className="close-x" type="button" onClick={onClose}>x</button>
        </div>

        <div className="card-content">
          <div className="card-image-side">
            <img
              src={imageSrc}
              alt={editedPlant.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageSrc(api.imageFallback)}
            />
          </div>

          <div className="card-info-side">
            {isEditing ? (
              <>
                <input
                  className="edit-input-title"
                  value={editedPlant.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                />
                <input
                  className="edit-input-species"
                  value={editedPlant.species}
                  onChange={(event) => handleChange('species', event.target.value)}
                />
              </>
            ) : (
              <>
                <h1>{editedPlant.name}</h1>
                <p className="latin-name">{editedPlant.species}</p>
              </>
            )}

            <div className="care-section">
              <h3 className="care-facts-header">Plant Care and Info</h3>
              <div className="care-facts-grid">
                <CareFact label="Light" value={editedPlant.light} />
                <CareFact label="Water" value={editedPlant.water} />
                <CareFact label="Cycle" value={editedPlant.cycle || 'Not available'} />
                <CareFact label="Maintenance" value={editedPlant.maintenance || 'Not available'} />
                <CareFact label="Growth Rate" value={editedPlant.growthRate || 'Not available'} />
                <CareFact label="Hardiness" value={hardinessRange || 'Not available'} />
              </div>
            </div>

            {editedPlant.description ? (
              <div className="secret-fact-box">
                <h4>Description</h4>
                <p>{editedPlant.description}</p>
              </div>
            ) : null}

            <div className="secret-fact-box">
              <h4>Secret Fact</h4>
              {isEditing ? (
                <textarea
                  className="edit-textarea"
                  value={editedPlant.secretfact}
                  onChange={(event) => handleChange('secretfact', event.target.value)}
                />
              ) : (
                <p>{editedPlant.secretfact}</p>
              )}
            </div>

            {editedPlant.careGuides?.length ? (
              <div className="secret-fact-box">
                <h4>Care Guides</h4>
                {editedPlant.careGuides.slice(0, 4).map((guide) => (
                  <p key={guide.id || `${guide.type}-${guide.section || ''}`}>
                    <strong>{guide.type || 'Guide'}:</strong> {guide.description || guide.summary || 'No details available.'}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantModal;
