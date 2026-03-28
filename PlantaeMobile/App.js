import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Your Components
import { plantData } from './data/Plant';
import GardenScreen from './screens/GardenScreen';
import AboutScreen from './screens/AboutScreen';
import PlantModal from './components/PlantModal';
import SettingsSidebar from './components/SettingsSidebar';

SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// This is the "Base Layer" of your app
function DrawerLayer({ allPlants, setSelectedPlant, isDarkMode, setIsDarkMode, theme }) {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => (
        <SettingsSidebar 
          {...props} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
        />
      )}
      screenOptions={{ 
        headerShown: false,
        drawerPosition: 'right', 
        drawerType: 'slide',
        drawerStyle: { width: '85%' },
      }}
    >
      <Drawer.Screen name="Garden">
        {(props) => (
          <GardenScreen 
            {...props} 
            plants={allPlants} 
            isDarkMode={isDarkMode}
            theme={theme}
            onPlantClick={(plant) => setSelectedPlant(plant)}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allPlants] = useState(plantData);
  const [selectedPlant, setSelectedPlant] = useState(null);

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          'AstonScript': require('./assets/fonts/AstonScript.ttf'),
        });
      } finally {
        setFontsLoaded(true);
      }
    }
    loadResources();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const theme = {
    background: isDarkMode ? '#121212' : '#f1eeee',
    text: isDarkMode ? '#e0e0e0' : '#2d5a27',
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }} onLayout={onLayoutRootView}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <NavigationContainer>
        {/* The Root Stack handles the Modal transition */}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainApp">
            {() => (
              <DrawerLayer 
                allPlants={allPlants} 
                setSelectedPlant={setSelectedPlant} 
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                theme={theme}
              />
            )}
          </Stack.Screen>

          {/* About slides up from bottom - very smooth transition */}
          <Stack.Screen 
            name="About" 
            options={{ 
              presentation: 'modal', 
              animation: 'slide_from_bottom' 
            }}
          >
            {(props) => <AboutScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
        </Stack.Navigator>

        {selectedPlant && (
          <PlantModal 
            plant={selectedPlant} 
            isDarkMode={isDarkMode}
            onClose={() => setSelectedPlant(null)} 
          />
        )}
      </NavigationContainer>
    </View>
  );
}