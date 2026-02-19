import React, { useState } from 'react';
import './styles/App.css'; 
import { plantData } from './data/plants';

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlants = plantData.filter((plant) =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.healthStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showCareGuide = (plantName, species) => {
    alert(`fetching AI Care Guide for: ${plantName} (${species})...`);
  };

  const triggerUpload = () => {
    document.getElementById('ai-upload-input').click();
  };

  return (
    <div className="App">
      <header className="main-header">
        <h1 className="brand-title">Plantae</h1>
        
        <div className="search-and-add-row">
          <div className="search-wrapper">
            <input 
              type="text" 
              placeholder="Search your garden..." 
              className="glass-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="glass-add-btn" onClick={triggerUpload}>
            <span className="plus-icon">+</span>
          </button>

          <input 
            type="file" 
            id="ai-upload-input" 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={(e) => alert("Analyzing image...")}
          />
        </div>
      </header>

      <main className="discovery-container">
        <section className="plant-stack">
          {filteredPlants.map((plant) => (
            <div 
              key={plant.id} 
              className="plant-card" 
              onClick={() => showCareGuide(plant.name, plant.species)}
            >
              <img src={plant.imageUrl} alt={plant.name} className="plant-image" />
              <div className="card-overlay">
                {/* Removed static badge, made name look clickable */}
                <h2 className="clickable-name">{plant.name}</h2>
                <p className="species-text"><i>{plant.species}</i></p>
                
                <div className="care-prompt">
                  <span>Tap for Care Guide →</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;