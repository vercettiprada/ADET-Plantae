import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import GardenScreen from './src/screens/GardenScreen';
import { api } from './src/api';

const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const [plants, setPlants] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [savedToken] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          Font.loadAsync({ 'AstonScript': require('./assets/fonts/AstonScript.ttf') })
        ]);
        if (savedToken) {
          setToken(savedToken);
          const res = await api.getPlants(1);
          setPlants(res.data);
          setHasNext(res.hasNext);
          setPage(2);
        }
      } catch (e) { console.warn(e); }
      finally { setReady(true); await SplashScreen.hideAsync(); }
    }
    init();
  }, []);

  const handleRegister = async (userData) => {
    setLoading(true);
    const res = await api.register(userData);
    if (res.token || res.id) { // Depending on if your Django returns a token immediately
      Alert.alert("Success", "Account created! You can now login.");
    } else {
      Alert.alert("Registration Error", res.error || "Could not create account");
    }
    setLoading(false);
  };

  const handleLogin = async (creds) => {
    setLoading(true);
    const res = await api.login(creds);
    if (res.token) {
      await AsyncStorage.setItem('userToken', res.token);
      setToken(res.token);
      const plantRes = await api.getPlants(1);
      setPlants(plantRes.data);
      setHasNext(plantRes.hasNext);
      setPage(2);
    } else {
      Alert.alert("Login Failed", res.error || "Check your credentials");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setToken(null);
    setPlants([]);
    setPage(1);
  };

  const loadMore = async () => {
    if (loading || !hasNext) return;
    setLoading(true);
    const res = await api.getPlants(page);
    setPlants(prev => [...prev, ...res.data]);
    setHasNext(res.hasNext);
    setPage(p => p + 1);
    setLoading(false);
  };

  if (!ready) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token == null ? (
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen 
                {...props} 
                onLogin={handleLogin} 
                onRegister={handleRegister} 
                loading={loading} 
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Garden">
            {(props) => (
              <GardenScreen 
                {...props} 
                plants={plants} 
                onLogout={handleLogout} 
                loadMorePlants={loadMore}
                loadingMore={loading}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}