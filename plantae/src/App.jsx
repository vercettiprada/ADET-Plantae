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
      <header>
        <h1 style={{ textAlign: 'center', color: '#2d5a27', marginTop: '20px' }}>Plantae</h1>
        
        {/* --- SEARCH BAR START --- */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <input 
            type="text" 
            placeholder="Type to search plants..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '12px 20px',
              width: '300px',
              borderRadius: '25px',
              border: '2px solid #2d5a27',
              outline: 'none',
              fontSize: '16px'
            }}
          />
        </div>
        {/* --- SEARCH BAR END --- */}
      </header>

      <main className="discovery-container">
        <section className="plant-stack">
          {filteredPlants.map((plant) => (
            <div key={plant.id} className="plant-card">
              <img src={plant.imageUrl} alt={plant.name} className="plant-image" />
              <div className="card-overlay">
                <span className="status-badge">{plant.healthStatus}</span>
                <h2>{plant.name}</h2>
                <p><i>{plant.species}</i></p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer>
        <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>
          © 2026 Plantae Discovery System
        </p>
      </footer>
    </div>
  );
}

export default App;