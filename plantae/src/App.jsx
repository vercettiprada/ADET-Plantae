import React from 'react';
import './styles/App.css'; // Adjust path if needed
import { plantData } from './data/plants';

function App() {
  return (
    <div className="App">
      <header>
        <h1 style={{ textAlign: 'center', color: '#2d5a27' }}>Plantae</h1>
      </header>

      <main className="discovery-container">
        <section className="plant-stack">
          {plantData.map((plant) => (
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