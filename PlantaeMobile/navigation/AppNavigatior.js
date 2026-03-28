import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import GardenScreen from '../screens/GardenScreen';
import AboutScreen from '../screens/AboutScreen';
import SettingsSidebar from '../components/SettingsSidebar';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerLayer = ({ allPlants, setSelectedPlant, isDarkMode, setIsDarkMode, theme }) => (
  <Drawer.Navigator 
    drawerContent={(props) => (
      <SettingsSidebar {...props} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    )}
    screenOptions={{ 
      headerShown: false,
      drawerPosition: 'right', 
      drawerType: 'slide',
      drawerStyle: { width: '85%', backgroundColor: theme.background },
    }}
  >
    <Drawer.Screen name="garden">
      {(props) => (
        <GardenScreen 
          {...props} 
          plants={allPlants} 
          isDarkMode={isDarkMode}
          theme={theme}
          onPlantClick={setSelectedPlant}
        />
      )}
    </Drawer.Screen>
  </Drawer.Navigator>
);

export default function AppNavigator({ stateProps }) {
  const { isDarkMode, theme } = stateProps;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="main">
        {() => <DrawerLayer {...stateProps} />}
      </Stack.Screen>

      <Stack.Screen 
        name="about" 
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      >
        {(props) => <AboutScreen {...props} isDarkMode={isDarkMode} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}