import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { plantData } from './data/Plant';
import GardenScreen from './screens/GardenScreen';
import AboutScreen from './screens/AboutScreen';
import PlantModal from './components/PlantModal';

SplashScreen.preventAutoHideAsync();

// ALWAYS place styles above the component to avoid TDZ (Temporal Dead Zone)
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f1eeee' 
  }
});

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [allPlants, setAllPlants] = useState(plantData);
  const [currentView, setCurrentView] = useState('garden');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          'AstonScript': require('./assets/fonts/AstonScript.ttf'),
        });
      } catch (e) {
        console.warn("Font loading error:", e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadResources();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const handleSavePlant = (updatedPlant) => {
    setAllPlants(prev => prev.map(p => p.id === updatedPlant.id ? updatedPlant : p));
    setSelectedPlant(updatedPlant);
  };

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="dark-content" />
      {currentView === 'garden' ? (
        <GardenScreen 
          plants={allPlants.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.species.toLowerCase().includes(searchQuery.toLowerCase())
          )} 
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