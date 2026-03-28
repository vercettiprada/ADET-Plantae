import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { plantData as initialData } from './data/Plant';
import PlantModal from './components/PlantModal';
import useCachedResources from './hooks/useCachedResources';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allPlants, setAllPlants] = useState(initialData);
  const [selectedPlant, setSelectedPlant] = useState(null);

  if (!isLoadingComplete) return null;

  const theme = {
    background: isDarkMode ? '#121212' : '#fff',
    text: isDarkMode ? '#e0e0e0' : '#121212',
  };

  const handleUpdatePlant = (updatedPlant) => {
    setAllPlants(prev => prev.map(p => p.id === updatedPlant.id ? updatedPlant : p));
    setSelectedPlant(null);
  };

  // Grouping props to keep the Navigator call clean
  const stateProps = { allPlants, setSelectedPlant, isDarkMode, setIsDarkMode, theme };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <NavigationContainer>
        <AppNavigator stateProps={stateProps} />
        
        {selectedPlant && (
          <PlantModal 
            plant={selectedPlant} 
            isDarkMode={isDarkMode}
            onClose={() => setSelectedPlant(null)} 
            onSave={handleUpdatePlant} 
          />
        )}
      </NavigationContainer>
    </View>
  );
}