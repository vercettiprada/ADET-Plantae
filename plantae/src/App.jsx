import React, { useState } from 'react';
import './styles/App.css'; 
import { plantData } from './data/plants';
import CareFact from './components/CareFact'; 
import PlantCard from './components/PlantCard'; // CAN USE NEW COMPONENT FOR PLANT CARDS IN STACK, PASS PROPS FOR NAME, SPECIES, IMAGE, HEALTH STATUS

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null); 

  const filteredPlants = plantData.filter((plant) => {
    const name = plant.name?.toLowerCase() || "";
    const species = plant.species?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || species.includes(query);
  });

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
            <PlantCard 
              key={plant.id} 
              plant={plant} 
              onCardClick={setSelectedPlant} 
            />
          ))}
        </section>
      </main>

      {/* EXPANDED SQUARE VIEW */}
      {selectedPlant && (
        <div className="modal-backdrop" onClick={() => setSelectedPlant(null)}>
          <div className="expanded-square-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setSelectedPlant(null)}>×</button>
            <div className="card-content">
              <div className="card-image-side">
                <img src={selectedPlant.imageUrl} alt={selectedPlant.name} />
              </div>
              
              <div className="card-info-side">

                <h1>{selectedPlant.name}</h1>

                <p className="latin-name">{selectedPlant.species}</p>

                  <div className="care-facts-row">{
                    
                    <>
                    <h3 className="care-facts-header">Care Facts</h3>
                    
                    <p className="care-facts-subheader">bla bla bla bla bla bla </p></>
                    
                    
                    }
            
                  </div>
                
               
              </div>
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;