import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import GardenScreen from './screens/GardenScreen';
import AboutScreen from './screens/AboutScreen';
import LoginScreen from './screens/LoginScreen';
import PlantModal from './components/PlantModal';
import SettingsSidebar from './components/SettingsSidebar';

import { api } from './src/api/index';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

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
  const [authChecked, setAuthChecked] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allPlants, setAllPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const clearSession = useCallback(async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setAllPlants([]);
    setPage(1);
    setSelectedPlant(null);
  }, []);

  const loadPlants = useCallback(async (pageNum = 1) => {
    setLoadingMore(true);
    const result = await api.getPlants(pageNum);

    if (result.unauthorized) {
      await clearSession();
      setLoadingMore(false);
      return { unauthorized: true, data: [] };
    }

    if (pageNum === 1) {
      setAllPlants(result.data);
      setPage(1);
    } else if (result.data.length > 0) {
      setAllPlants(prev => [...prev, ...result.data]);
      setPage(pageNum);
    }

    setLoadingMore(false);
    return result;
  }, [clearSession]);

  const bootstrapAuth = useCallback(async () => {
    const storedToken = await AsyncStorage.getItem('userToken');

    if (!storedToken) {
      setUserToken(null);
      setAuthChecked(true);
      return;
    }

    setUserToken(storedToken);
    const result = await api.getPlants(1);

    if (result.unauthorized) {
      await clearSession();
    } else {
      setAllPlants(result.data);
      setPage(1);
    }

    setAuthChecked(true);
  }, [clearSession]);

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          AstonScript: require('./assets/fonts/AstonScript.ttf'),
        });
        await bootstrapAuth();
      } finally {
        setFontsLoaded(true);
      }
    }

    loadResources();
  }, [bootstrapAuth]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (authChecked && userToken && allPlants.length === 0) {
      loadPlants(1);
    }
  }, [authChecked, userToken, allPlants.length, loadPlants]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    const result = await api.login(credentials);

    if (result.token) {
      setUserToken(result.token);
      const plantsResult = await loadPlants(1);
      if (plantsResult.unauthorized) {
        Alert.alert('Session Expired', 'Please log in again.');
      }
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials.');
    }

    setLoading(false);
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    const result = await api.register(userData);

    if (result.access) {
      await AsyncStorage.setItem('userToken', result.access);
      setUserToken(result.access);
      await loadPlants(1);
    } else {
      Alert.alert('Registration Failed', result.error || 'Could not create account.');
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await clearSession();
  };

  if (!fontsLoaded || !authChecked) return null;

  const theme = {
    background: isDarkMode ? '#121212' : '#f1eeee',
    text: isDarkMode ? '#e0e0e0' : '#2d5a27',
  };

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
