import React, { useState } from 'react';
import './styles/App.css'; 
import { plantData } from './data/plants';
import PlantCard from './components/PlantCard';
import PlantModal from './components/PlantModal';
import SettingsSidebar from './components/SettingsSidebar';

function App() {
  // 1. CREATE STATES FIRST (Initialization)
  const [allPlants, setAllPlants] = useState(plantData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 2. DEFINE LOGIC SECOND (Now allPlants exists)
  const filteredPlants = allPlants.filter((plant) => {
    const name = plant.name?.toLowerCase() || "";
    const species = plant.species?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || species.includes(query);
  });

  // 3. DEFINE FUNCTIONS THIRD
  const handleSavePlant = (updatedPlant) => {
    setAllPlants(prevPlants => 
      prevPlants.map(p => p.id === updatedPlant.id ? updatedPlant : p)
    );
    setSelectedPlant(updatedPlant); // Keep the modal updated with new data
  };

  return (
    <div className="App">
      <SettingsSidebar 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <header className="main-header">
        <h1 className="brand-title">Plantae</h1>
        
        <div className="header-controls-container">
          <div className="controls-left">
            <button className="icon-circle-btn" onClick={() => setIsSettingsOpen(true)}>
              <span className="bar-icon">☰</span>
            </button>
            <button className="icon-circle-btn" onClick={() => window.location.reload()}>
              <span className="home-icon">⌂</span>
            </button>
          </div>

          <div className="controls-center">
            <input 
              type="text" 
              placeholder="Search your garden..." 
              className="glass-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="controls-right">
            <button className="icon-circle-btn" onClick={() => alert("AI Analyzing...")}>
              <span className="plus-icon">+</span>
            </button>
          </div>
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

      {/* The Modal with the Save handler */}
      <PlantModal 
        plant={selectedPlant} 
        onClose={() => setSelectedPlant(null)} 
        onSave={handleSavePlant} 
      />

      <footer className="main-footer">
        <p>© 2026 Plantae Discovery System</p>
      </footer>
    </div>
  );
}

export default App;