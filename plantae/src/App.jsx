import React, { useState } from 'react';
import './styles/App.css';
import { plantData } from './data/plants';
import PlantCard from './components/PlantCard'; // Import our new component

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic: Checks if the name or health status matches the search
  const filteredPlants = plantData.filter((plant) =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.healthStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="App">
      <header>
  <h1 style={{ textAlign: 'center', color: '#2d5a27' }}>Plantae</h1>
  
  {/* THIS IS THE SEARCH BAR AREA */}
  <div className="search-container">
    <input 
      type="text" 
      placeholder="Search plants..." 
      className="search-input"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
</header>

      <main className="discovery-container">
        <section className="plant-stack">
          {filteredPlants.length > 0 ? (
            filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No plants found matching your search.</p>
          )}
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