import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import ProfileScreen from './screens/ProfileScreen';
import PlantModal from './components/PlantModal';
import SettingsSidebar from './components/SettingsSidebar';

import { api } from './src/api/index';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerLayer({
  allPlants,
  onPlantClick,
  isDarkMode,
  setIsDarkMode,
  theme,
  onLogout,
  loadingMore,
  loadMorePlants,
  profile,
}) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <SettingsSidebar
          {...props}
          profile={profile}
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
            loadingMore={loadingMore}
            loadMorePlants={loadMorePlants}
            onPlantClick={onPlantClick}
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
  const [plantModalLoading, setPlantModalLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [profile, setProfile] = useState({ username: '', email: '', firstName: '' });
  const plantRequestRef = useRef(0);

  const clearSession = useCallback(async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setAllPlants([]);
    setPage(1);
    setHasNextPage(true);
    setSelectedPlant(null);
    setProfile({ username: '', email: '', firstName: '' });
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
      setHasNextPage(result.hasNext);
    } else if (result.data.length > 0) {
      setAllPlants(prev => [...prev, ...result.data]);
      setPage(pageNum);
      setHasNextPage(result.hasNext);
    } else {
      setHasNextPage(false);
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

    const sessionResult = await api.verifySession(storedToken);

    if (!sessionResult.valid) {
      await clearSession();
      setAuthChecked(true);
      return;
    }

    setUserToken(storedToken);
    const [plantsResult, profileResult] = await Promise.all([
      api.getPlants(1),
      api.getProfile(),
    ]);

    if (plantsResult.unauthorized || profileResult.unauthorized || plantsResult.error || profileResult.error) {
      await clearSession();
    } else {
      setAllPlants(plantsResult.data);
      setPage(1);
      setHasNextPage(plantsResult.hasNext);
      if (profileResult.data) {
        setProfile(profileResult.data);
      }
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
      const sessionResult = await api.verifySession(result.token);

      if (!sessionResult.valid) {
        await clearSession();
        Alert.alert('Login Failed', sessionResult.error || 'Please try again.');
        setLoading(false);
        return;
      }

      setUserToken(result.token);
      setProfile((prev) => ({ ...prev, username: result.username || prev.username }));
      const profileResult = await api.getProfile();
      if (profileResult.data) {
        setProfile(profileResult.data);
      }
      const plantsResult = await loadPlants(1);
      if (plantsResult.unauthorized || profileResult.unauthorized || plantsResult.error || profileResult.error) {
        await clearSession();
        Alert.alert(
          'Login Failed',
          plantsResult.error || profileResult.error || 'Please log in again.',
        );
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
      setUserToken(result.access);
      setProfile({
        username: result.username || '',
        email: userData.email,
        firstName: '',
      });
      await loadPlants(1);
    } else {
      Alert.alert('Registration Failed', result.error || 'Could not create account.');
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await clearSession();
  };

  const handleSaveProfile = useCallback(async (updates) => {
    const result = await api.updateProfile(updates);

    if (result.unauthorized) {
      await clearSession();
      Alert.alert('Session Expired', 'Please log in again.');
      return false;
    }

    if (result.error) {
      Alert.alert('Save Failed', result.error);
      return false;
    }

    if (result.data) {
      setProfile(result.data);
    }

    return true;
  }, [clearSession]);

  const handleDeleteAccount = useCallback(async () => {
    const result = await api.deleteAccount();

    if (result.unauthorized) {
      await clearSession();
      Alert.alert('Session Expired', 'Please log in again.');
      return false;
    }

    if (result.error) {
      Alert.alert('Delete Failed', result.error);
      return false;
    }

    await clearSession();
    return true;
  }, [clearSession]);

  const handleLoadMorePlants = useCallback(() => {
    if (loadingMore || !hasNextPage || !userToken) {
      return;
    }

    loadPlants(page + 1);
  }, [hasNextPage, loadPlants, loadingMore, page, userToken]);

  const handleSavePlant = useCallback(async (updatedPlant) => {
    const result = await api.updatePlant(updatedPlant.id, updatedPlant);

    if (result.unauthorized) {
      await clearSession();
      Alert.alert('Session Expired', 'Please log in again.');
      return false;
    }

    if (result.error) {
      Alert.alert('Save Failed', result.error);
      return false;
    }

    if (result.data) {
      setAllPlants((prev) => prev.map((plant) => (
        plant.id === result.data.id ? result.data : plant
      )));
      setSelectedPlant(result.data);
    }

    return true;
  }, [clearSession]);

  const handlePlantClick = useCallback(async (plant) => {
    if (!plant?.id) {
      return;
    }

    const requestId = plantRequestRef.current + 1;
    plantRequestRef.current = requestId;
    setSelectedPlant(plant);
    setPlantModalLoading(true);

    const result = await api.getPlant(plant.id);

    if (plantRequestRef.current !== requestId) {
      return;
    }

    if (result.unauthorized) {
      setPlantModalLoading(false);
      await clearSession();
      Alert.alert('Session Expired', 'Please log in again.');
      return;
    }

    if (result.error) {
      setPlantModalLoading(false);
      Alert.alert('Plant Details', result.error);
      return;
    }

    if (result.data) {
      setSelectedPlant(result.data);
      setAllPlants((prev) => prev.map((item) => (
        item.id === result.data.id ? { ...item, ...result.data } : item
      )));
    }

    setPlantModalLoading(false);
  }, [clearSession]);

  const handleClosePlantModal = useCallback(() => {
    plantRequestRef.current += 1;
    setPlantModalLoading(false);
    setSelectedPlant(null);
  }, []);

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
                onPlantClick={handlePlantClick}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                theme={theme}
                onLogout={handleLogout}
                loadingMore={loadingMore}
                loadMorePlants={handleLoadMorePlants}
                profile={profile}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Profile"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          >
            {(props) => (
              <ProfileScreen
                {...props}
                isDarkMode={isDarkMode}
                profile={profile}
                plantCount={allPlants.length}
                onSaveProfile={handleSaveProfile}
                onDeleteAccount={handleDeleteAccount}
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
            loading={plantModalLoading}
            isDarkMode={isDarkMode}
            onClose={handleClosePlantModal}
            onSave={handleSavePlant}
          />
        )}
      </NavigationContainer>
    </View>
  );
}
