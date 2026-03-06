import React, { useState } from 'react';
import './styles/App.css'; 
import { plantData } from './data/plants';
import PlantCard from './components/PlantCard';
import PlantModal from './components/PlantModal'; // Import the new component

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null); 

  const filteredPlants = plantData.filter((plant) => {
    const name = plant.name?.toLowerCase() || "";
    const species = plant.species?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || species.includes(query);
  });

  return (
    <div className="App">
      <header className="main-header">
        <h1 className="brand-title">Plantae</h1>
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder="Search your garden..." 
            className="glass-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="discovery-container">
        <section className="plant-stack">
          {filteredPlants.map((plant) => (
            <PlantCard 
              key={plant.id} 
              plant={plant} 
              onCardClick={setSelectedPlant} 
            />
          ))}
        </section>
      </main>

    
      <PlantModal 
        plant={selectedPlant} 
        onClose={() => setSelectedPlant(null)} 
      />

      <footer className="main-footer">
        <p>© 2026 Plantae Discovery System</p>
      </footer>
    </div>
  );
}

export default App;