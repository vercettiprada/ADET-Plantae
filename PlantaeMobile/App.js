import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// React Navigation Imports
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Your Components & Data
import { plantData } from './data/Plant';
import GardenScreen from './screens/GardenScreen';
import AboutScreen from './screens/AboutScreen';
import PlantModal from './components/PlantModal';
import SettingsSidebar from './components/SettingsSidebar';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f1eeee' 
  }
});

// We create a separate component for the main stack so the Drawer can wrap it
function MainStack({ allPlants, setSelectedPlant }) {
  return (
    <Stack.Navigator 
      initialRouteName="Garden"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Garden">
        {(props) => (
          <GardenScreen 
            {...props} 
            plants={allPlants} 
            onPlantClick={(plant) => setSelectedPlant(plant)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [allPlants, setAllPlants] = useState(plantData);
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Font Loading Logic
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
      
      <NavigationContainer>
        {/* Drawer Navigator is the root for the gesture control */}
        <Drawer.Navigator 
  drawerContent={(props) => <SettingsSidebar {...props} />}
  screenOptions={{ 
    headerShown: false,
    drawerPosition: 'right',
    drawerType: 'slide',
    swipeEnabled: true
  }}
>
  <Drawer.Screen name="HomeRoot">
    {() => <MainStack allPlants={allPlants} setSelectedPlant={setSelectedPlant} />}
  </Drawer.Screen>
  
  {/* Add this so the Drawer can resolve the 'About' action */}
  <Drawer.Screen name="About" component={AboutScreen} />
</Drawer.Navigator>

        {/* Plant Detail Modal (Global Overlay) */}
        {selectedPlant && (
          <PlantModal 
            plant={selectedPlant} 
            onClose={() => setSelectedPlant(null)} 
            onSave={handleSavePlant}
          />
        )}
      </NavigationContainer>
    </View>
  );
}