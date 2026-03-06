import React, { useState } from 'react';
import './styles/App.css'; 
import { plantData } from './data/plants';
import PlantCard from './components/PlantCard';
import PlantModal from './components/PlantModal';
import SettingsSidebar from './components/SettingsSidebar';
import About from './About'; // Import the new About component

function App() {
  // 1. INITIAL STATES
  const [allPlants, setAllPlants] = useState(plantData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('garden'); // 'garden' or 'about'

  // 2. FILTER LOGIC
  const filteredPlants = allPlants.filter((plant) => {
    const name = plant.name?.toLowerCase() || "";
    const species = plant.species?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || species.includes(query);
  });

  // 3. HANDLER FUNCTIONS
  const handleSavePlant = (updatedPlant) => {
    setAllPlants(prevPlants => 
      prevPlants.map(p => p.id === updatedPlant.id ? updatedPlant : p)
    );
    setSelectedPlant(updatedPlant); 
  };

  // 4. NAVIGATION RENDER
  return (
    <div className="App">
      {currentView === 'garden' ? (
        /* GARDEN VIEW */
        <>
          <SettingsSidebar 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            onAboutClick={() => {
              setCurrentView('about');
              setIsSettingsOpen(false);
            }}
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

          <PlantModal 
            plant={selectedPlant} 
            onClose={() => setSelectedPlant(null)} 
            onSave={handleSavePlant} 
          />
        </>
      ) : (
        /* ABOUT VIEW */
        <About onBack={() => setCurrentView('garden')} />
      )}

      <footer className="main-footer">
        <p>© 2026 Plantae Discovery System</p>
      </footer>
    </div>
  );
}

export default App;