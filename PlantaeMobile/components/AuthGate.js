import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import GardenScreen from '../screens/GardenScreen';

const Stack = createNativeStackNavigator();

export const AuthGate = ({ userToken, handleLogin, handleRegister, allPlants }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {userToken == null ? (
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}
      </Stack.Screen>
    ) : (
      <Stack.Screen name="Garden">
        {(props) => <GardenScreen {...props} plants={allPlants} />}
      </Stack.Screen>
    )}
  </Stack.Navigator>
);
