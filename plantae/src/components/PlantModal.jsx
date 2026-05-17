import React, { useEffect, useState } from 'react';
import { api } from '../api';
import CareFact from './CareFact';

const PlantModal = ({ plant, onClose, onSave, onDelete, saving, error }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState(plant || {});
  const [imageSrc, setImageSrc] = useState(plant ? (plant.imageUrl || api.getFallbackPlantImage(plant)) : '');

  useEffect(() => {
    setEditedPlant(plant || {});
    setImageSrc(plant ? (plant.imageUrl || api.getFallbackPlantImage(plant)) : '');
    setIsEditing(Boolean(plant?.isNew));
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

  const handleCancel = () => {
    if (plant.isNew) {
      onClose();
      return;
    }

    setEditedPlant(plant);
    setImageSrc(plant.imageUrl || api.getFallbackPlantImage(plant));
    setIsEditing(false);
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
          {isEditing ? (
            <button
              className="modal-action-btn ghost"
              type="button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          ) : null}
          <button
            className={`edit-toggle-btn ${isEditing ? 'saving' : ''}`}
            type="button"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={saving}
          >
            {isEditing ? (saving ? 'Saving...' : plant.isNew ? 'Create' : 'Save') : 'Edit'}
          </button>
          {!plant.isNew ? (
              <button
            			className="modal-action-btn danger"
            			type="button"
            			onClick={() => onDelete?.(plant?.id)}
            			disabled={saving || !plant?.id}
            		>
            			Delete
            		</button>
          ) : null}
          <button className="close-x" type="button" onClick={onClose}>x</button>
        </div>

        <div className="card-content">
          <div className="card-image-side">
            <img
              src={imageSrc}
              alt={editedPlant.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageSrc(api.getFallbackPlantImage(editedPlant))}
            />
          </div>

          <div className="card-info-side">
            {error ? <p className="form-message error modal-message">{error}</p> : null}
            {isEditing ? (
              <>
                <input
                  className="edit-input-title"
                  value={editedPlant.name || ''}
                  placeholder="Plant name"
                  onChange={(event) => handleChange('name', event.target.value)}
                />
                <input
                  className="edit-input-species"
                  value={editedPlant.species || ''}
                  placeholder="Species"
                  onChange={(event) => handleChange('species', event.target.value)}
                />
                <input
                  className="edit-input-species"
                  value={editedPlant.imageUrl || ''}
                  placeholder="Image URL"
                  onChange={(event) => {
                    handleChange('imageUrl', event.target.value);
                    setImageSrc(event.target.value || api.getFallbackPlantImage(editedPlant));
                  }}
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
              {isEditing ? (
                <div className="edit-field-grid">
                  <label>
                    <span>Light</span>
                    <input
                      className="edit-input-species"
                      value={editedPlant.light || ''}
                      placeholder="Bright, indirect light"
                      onChange={(event) => handleChange('light', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Water</span>
                    <input
                      className="edit-input-species"
                      value={editedPlant.water || ''}
                      placeholder="Water when soil feels dry"
                      onChange={(event) => handleChange('water', event.target.value)}
                    />
                  </label>
                </div>
              ) : (
                <div className="care-facts-grid">
                  <CareFact label="Light" value={editedPlant.light} />
                  <CareFact label="Water" value={editedPlant.water} />
                  <CareFact label="Cycle" value={editedPlant.cycle || 'Not available'} />
                  <CareFact label="Maintenance" value={editedPlant.maintenance || 'Not available'} />
                  <CareFact label="Growth Rate" value={editedPlant.growthRate || 'Not available'} />
                  <CareFact label="Hardiness" value={hardinessRange || 'Not available'} />
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="secret-fact-box">
                <h4>Description</h4>
                <textarea
                  className="edit-textarea"
                  value={editedPlant.description || ''}
                  placeholder="Short plant description"
                  onChange={(event) => handleChange('description', event.target.value)}
                />
              </div>
            ) : editedPlant.description ? (
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
                  value={editedPlant.secretfact || ''}
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
