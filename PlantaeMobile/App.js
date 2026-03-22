import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { plantData } from './data/Plant'; 
import GardenScreen from './screens/GardenScreen';
import AboutScreen from './screens/AboutScreen';
import PlantModal from './components/PlantModal';

export default function App() {
  const [allPlants, setAllPlants] = useState(plantData); 
  const [currentView, setCurrentView] = useState('garden');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);

  const filteredPlants = allPlants.filter((plant) => {
    const name = plant.name?.toLowerCase() || "";
    const species = plant.species?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || species.includes(query);
  });

  const handleSavePlant = (updatedPlant) => {
    setAllPlants(prev => prev.map(p => p.id === updatedPlant.id ? updatedPlant : p));
    setSelectedPlant(updatedPlant);
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" />
      {currentView === 'garden' ? (
        <GardenScreen 
          plants={filteredPlants} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAboutClick={() => setCurrentView('about')} 
          onPlantClick={(plant) => setSelectedPlant(plant)}
        />
      ) : (
        <AboutScreen onBack={() => setCurrentView('garden')} />
      )}
      {selectedPlant && (
        <PlantModal 
          plant={selectedPlant} 
          onClose={() => setSelectedPlant(null)} 
          onSave={handleSavePlant}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#f1eeee' },
});