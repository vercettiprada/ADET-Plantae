import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import GardenScreen from './screens/GardenScreen';
import AboutScreen from './screens/AboutScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import PlantModal from './components/PlantModal';
import AddPlantModal from './components/AddPlantModal';
import SettingsSidebar from './components/SettingsSidebar';

import { api } from './src/api/index';
import {
  buildHistoryEntry,
  createEmptyCareProfile,
  hydratePlant,
  sortPlantsForDashboard,
} from './src/care';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerLayer({
  plants,
  setSelectedPlant,
  isDarkMode,
  setIsDarkMode,
  theme,
  onLogout,
  loadingMore,
  loadMorePlants,
  profile,
  onUpdatePlantCare,
  gardenView,
  setGardenView,
  onFocusSavedPlants,
  onAddPlant,
  isIdentifyingPlant,
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
          gardenView={gardenView}
          setGardenView={setGardenView}
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
            plants={plants}
            isDarkMode={isDarkMode}
            theme={theme}
            loadingMore={loadingMore}
            loadMorePlants={loadMorePlants}
            profile={profile}
            onUpdatePlantCare={onUpdatePlantCare}
            gardenView={gardenView}
            onFocusSavedPlants={onFocusSavedPlants}
            onAddPlant={onAddPlant}
            isIdentifyingPlant={isIdentifyingPlant}
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
  const [hasNextPage, setHasNextPage] = useState(true);
  const [profile, setProfile] = useState({ username: '', email: '', firstName: '' });
  const [careProfiles, setCareProfiles] = useState({});
  const [careReady, setCareReady] = useState(false);
  const [gardenView, setGardenView] = useState('all');
  const [isIdentifyingPlant, setIsIdentifyingPlant] = useState(false);
  const [isSavingAddedPlant, setIsSavingAddedPlant] = useState(false);
  const [addPlantDraft, setAddPlantDraft] = useState(null);
  const [addPlantCandidates, setAddPlantCandidates] = useState([]);

  const careStorageKey = useMemo(() => (
    profile.username ? `plantae:care:${profile.username}` : null
  ), [profile.username]);

  const enrichedPlants = useMemo(() => sortPlantsForDashboard(
    allPlants.map((plant) => hydratePlant(plant, careProfiles[plant.id]))
  ), [allPlants, careProfiles]);

  const clearSession = useCallback(async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setAllPlants([]);
    setPage(1);
    setHasNextPage(true);
    setSelectedPlant(null);
    setProfile({ username: '', email: '', firstName: '' });
    setCareProfiles({});
    setCareReady(false);
    setGardenView('all');
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

    setUserToken(storedToken);
    const [plantsResult, profileResult] = await Promise.all([
      api.getPlants(1),
      api.getProfile(),
    ]);

    if (plantsResult.unauthorized || profileResult.unauthorized) {
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

  useEffect(() => {
    let isActive = true;

    const loadCareProfiles = async () => {
      if (!careStorageKey || !userToken) {
        if (isActive) {
          setCareProfiles({});
          setCareReady(false);
        }
        return;
      }

      const stored = await AsyncStorage.getItem(careStorageKey);
      if (!isActive) {
        return;
      }

      setCareProfiles(stored ? JSON.parse(stored) : {});
      setCareReady(true);
    };

    loadCareProfiles();

    return () => {
      isActive = false;
    };
  }, [careStorageKey, userToken]);

  useEffect(() => {
    if (!careStorageKey || !careReady) {
      return;
    }

    AsyncStorage.setItem(careStorageKey, JSON.stringify(careProfiles));
  }, [careProfiles, careReady, careStorageKey]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    const result = await api.login(credentials);

    if (result.token) {
      setUserToken(result.token);
      setProfile((prev) => ({ ...prev, username: result.username || prev.username }));
      const profileResult = await api.getProfile();
      if (profileResult.data) {
        setProfile(profileResult.data);
      }
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

  const handleUpdatePlantCare = useCallback((plantId, updates) => {
    setCareProfiles((prev) => {
      const current = { ...createEmptyCareProfile(), ...(prev[plantId] || {}) };
      const next = { ...current, ...updates };

      if (updates.appendHistory) {
        next.history = [updates.appendHistory, ...(current.history || [])].slice(0, 12);
      }

      delete next.appendHistory;

      return {
        ...prev,
        [plantId]: next,
      };
    });
  }, []);

  const focusSavedPlants = useCallback(() => {
    setGardenView('sanctuary');
    setSelectedPlant(null);
  }, []);

  const selectedPlantData = useMemo(() => {
    if (!selectedPlant?.id) {
      return null;
    }

    return enrichedPlants.find((plant) => plant.id === selectedPlant.id) || selectedPlant;
  }, [enrichedPlants, selectedPlant]);

  const closeAddPlantModal = useCallback(() => {
    setAddPlantDraft(null);
    setAddPlantCandidates([]);
    setIsIdentifyingPlant(false);
  }, []);

  const handleCreatePlant = useCallback(async (draft) => {
    setIsSavingAddedPlant(true);
    const result = await api.createPlant({
      name: draft.name,
      species: draft.species,
      imageUrl: draft.imageUrl,
      secretfact: draft.secretfact || 'Added from your own photo.',
      light: draft.light,
      water: draft.water,
    });

    if (result.unauthorized) {
      await clearSession();
      Alert.alert('Session Expired', 'Please log in again.');
      setIsSavingAddedPlant(false);
      return false;
    }

    if (result.error) {
      Alert.alert('Could Not Save Plant', result.error);
      setIsSavingAddedPlant(false);
      return false;
    }

    if (result.data) {
      setAllPlants((prev) => [result.data, ...prev]);
      handleUpdatePlantCare(result.data.id, {
        inSanctuary: true,
        notes: draft.secretfact || '',
        appendHistory: buildHistoryEntry('saved', 'Added from your own plant photo'),
      });
      focusSavedPlants();
      setAddPlantDraft(null);
      setAddPlantCandidates([]);
    }

    setIsSavingAddedPlant(false);
    return true;
  }, [clearSession, focusSavedPlants, handleUpdatePlantCare]);

  const launchPlantPicker = useCallback(() => {
    const handleAsset = async (asset) => {
      if (!asset?.base64) {
        Alert.alert('Image Missing', 'Please choose a photo that can be processed.');
        return;
      }

      const imageUrl = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
      setIsIdentifyingPlant(true);
      setAddPlantDraft({
        name: '',
        species: '',
        imageUrl,
        secretfact: 'Added from your own photo.',
        light: 'Bright, indirect light',
        water: 'Water when the top soil feels dry',
      });
      setAddPlantCandidates([]);

      const identifyResult = await api.identifyPlant({
        imageBase64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName || 'plant.jpg',
      });

      if (identifyResult.unauthorized) {
        await clearSession();
        Alert.alert('Session Expired', 'Please log in again.');
        closeAddPlantModal();
        return;
      }

      if (identifyResult.error) {
        setIsIdentifyingPlant(false);
        Alert.alert('Identification Unavailable', `${identifyResult.error}\n\nYou can still add the plant manually from this photo.`);
        return;
      }

      const firstCandidate = identifyResult.data?.candidates?.[0];
      setAddPlantCandidates(identifyResult.data?.candidates || []);
      setAddPlantDraft((prev) => ({
        ...prev,
        name: firstCandidate?.name || prev.name,
        species: firstCandidate?.species || prev.species,
      }));
      setIsIdentifyingPlant(false);
    };

    Alert.alert(
      'Add My Plant',
      'Choose how you want to add your plant.',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Camera Permission', 'Camera access is required to take a plant photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              base64: true,
              quality: 0.7,
            });
            if (!result.canceled) {
              handleAsset(result.assets[0]);
            }
          },
        },
        {
          text: 'Library',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Library Permission', 'Photo library access is required to choose a plant photo.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              base64: true,
              quality: 0.7,
            });
            if (!result.canceled) {
              handleAsset(result.assets[0]);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [clearSession, closeAddPlantModal]);

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
                plants={enrichedPlants}
                setSelectedPlant={setSelectedPlant}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                theme={theme}
                onLogout={handleLogout}
                loadingMore={loadingMore}
                loadMorePlants={handleLoadMorePlants}
                profile={profile}
                onUpdatePlantCare={handleUpdatePlantCare}
                gardenView={gardenView}
                setGardenView={setGardenView}
                onFocusSavedPlants={focusSavedPlants}
                onAddPlant={launchPlantPicker}
                isIdentifyingPlant={isIdentifyingPlant}
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
            plant={selectedPlantData}
            isDarkMode={isDarkMode}
            onClose={() => setSelectedPlant(null)}
            onSave={handleSavePlant}
            onUpdatePlantCare={handleUpdatePlantCare}
            onFocusSavedPlants={focusSavedPlants}
          />
        )}

        <AddPlantModal
          visible={!!addPlantDraft}
          draft={addPlantDraft}
          candidates={addPlantCandidates}
          loading={isIdentifyingPlant}
          saving={isSavingAddedPlant}
          onClose={closeAddPlantModal}
          onSave={handleCreatePlant}
        />
      </NavigationContainer>
    </View>
  );
}
