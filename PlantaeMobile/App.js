import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Screens & Components (original design preserved)
import GardenScreen from './src/screens/GardenScreen';
import AboutScreen from './src/screens/AboutScreen';
import LoginScreen from './src/screens/LoginScreen';
import PlantModal from './src/components/PlantModal';
import SettingsSidebar from './src/components/SettingsSidebar';

// API
import { api } from './src/api/index';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Original Drawer layout — preserved exactly
function DrawerLayer({ allPlants, setSelectedPlant, isDarkMode, setIsDarkMode, theme, onLogout }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <SettingsSidebar
          {...props}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onLogout={onLogout}
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
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allPlants, setAllPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          'AstonScript': require('./assets/fonts/AstonScript.ttf'),
        });
        // Check persisted login — but do NOT auto-fetch plants here
        // Plants are only loaded after confirmed login via loadPlants()
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setUserToken(storedToken);
        }
      } finally {
        setFontsLoaded(true);
      }
    }
    loadResources();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Load plants ONLY when userToken is set (not on mount)
  useEffect(() => {
    if (userToken && allPlants.length === 0) {
      loadPlants(1);
    }
  }, [userToken]);

  const loadPlants = async (pageNum = 1) => {
    setLoadingMore(true);
    const result = await api.getPlants(pageNum);
    if (result.data.length > 0) {
      setAllPlants(prev => pageNum === 1 ? result.data : [...prev, ...result.data]);
      setPage(pageNum);
    }
    setLoadingMore(false);
  };

  const handleLogin = async (credentials) => {
    setLoading(true);
    const result = await api.login(credentials);
    setLoading(false);
    if (result.token) {
      setUserToken(result.token);
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials.');
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    const result = await api.register(userData);
    setLoading(false);
    if (result.access) {
      await AsyncStorage.setItem('userToken', result.access);
      setUserToken(result.access);
    } else {
      Alert.alert('Registration Failed', result.error || 'Could not create account.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setAllPlants([]);
    setPage(1);
  };

  if (!fontsLoaded) return null;

  const theme = {
    background: isDarkMode ? '#121212' : '#f1eeee',
    text: isDarkMode ? '#e0e0e0' : '#2d5a27',
  };

  // Show Login if no token
  if (!userToken) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }} onLayout={onLayoutRootView}>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <LoginScreen
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={loading}
          />
        </NavigationContainer>
      </View>
    );
  }

  // Show main app once logged in — original design preserved
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }} onLayout={onLayoutRootView}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainApp">
            {() => (
              <DrawerLayer
                allPlants={allPlants}
                setSelectedPlant={setSelectedPlant}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                theme={theme}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="About"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          >
            {(props) => <AboutScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
        </Stack.Navigator>

        {/* PlantModal — original floating modal over everything */}
        {selectedPlant && (
          <PlantModal
            plant={selectedPlant}
            isDarkMode={isDarkMode}
            onClose={() => setSelectedPlant(null)}
            onSave={(updated) => {
              setAllPlants(prev => prev.map(p => p.id === updated.id ? updated : p));
              setSelectedPlant(null);
            }}
          />
        )}
      </NavigationContainer>
    </View>
  );
}
