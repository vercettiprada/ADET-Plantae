import React, { useState } from 'react';
import './styles/App.css'; 
import { plantData } from './data/plants';

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlants = plantData.filter((plant) =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.healthStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="App">
      <header className="main-header">
        <h1 className="brand-title">Plantae</h1>
        
        {/* Floating Glass Search Container */}
        <div className="search-floating-container">
          <input 
            type="text" 
            placeholder="Search your garden..." 
            className="glass-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="discovery-container">
        <section className="plant-stack">
          {filteredPlants.map((plant) => (
            <div key={plant.id} className="plant-card">
              <img src={plant.imageUrl} alt={plant.name} className="plant-image" />
              <div className="card-overlay">
                <span className="status-badge glass-badge">{plant.healthStatus}</span>
                <h2>{plant.name}</h2>
                <p><i>{plant.species}</i></p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer>
        <p className="footer-text">© 2026 Plantae Discovery System</p>
      </footer>
    </div>
  );
}

export default App;