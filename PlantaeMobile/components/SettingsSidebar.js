import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/SettingsSidebar.styles';

export default function SettingsSidebar({
  navigation,
  isDarkMode,
  setIsDarkMode,
  onLogout,
  gardenView,
  setGardenView,
}) {
  const palette = {
    blurTint: isDarkMode ? 'dark' : 'light',
    background: isDarkMode ? 'rgba(18,18,18,0.86)' : 'rgba(255,255,255,0.3)',
    title: isDarkMode ? '#f3f5f1' : 'rgb(63,62,62)',
    text: isDarkMode ? 'rgba(236,240,233,0.92)' : 'rgba(78,78,78,0.8)',
    muted: isDarkMode ? 'rgba(196,201,193,0.68)' : 'rgb(112,112,112)',
    divider: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    activeTrack: '#2d5a27',
    inactiveTrack: isDarkMode ? '#475047' : '#ccc',
    thumb: isDarkMode ? '#f4f7f1' : '#fff',
  };

  const openProfile = () => {
    navigation.closeDrawer();
    navigation.getParent()?.navigate('Profile');
  };

  const openAbout = () => {
    navigation.closeDrawer();
    navigation.getParent()?.navigate('About');
  };

  const openPlantLibrary = () => {
    setGardenView?.('all');
    navigation.closeDrawer();
  };

  const openSanctuaryCollection = () => {
    setGardenView?.('sanctuary');
    navigation.closeDrawer();
  };

  const MenuItem = ({ title, onPress, isLogout, active }) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          borderBottomColor: palette.divider,
          backgroundColor: active
            ? (isDarkMode ? 'rgba(127,176,123,0.12)' : 'rgba(45,90,39,0.08)')
            : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.menuText,
          { color: active ? (isDarkMode ? '#d8ead5' : '#234a20') : palette.text },
          isLogout && styles.logoutText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <BlurView intensity={80} tint={palette.blurTint} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.sidebarHeaderContainer}>
          <Text style={[styles.sidebarHeaderTitle, { color: palette.title }]}>Settings</Text>
          <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <Text style={[styles.closeXApple, { color: palette.muted }]}>x</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuGroup}>
          <Text style={[styles.menuSectionTitle, { color: palette.muted }]}>Discover</Text>
          <MenuItem title="Plant Library" onPress={openPlantLibrary} active={gardenView === 'all'} />
          <MenuItem title="Saved Plants" onPress={openSanctuaryCollection} active={gardenView === 'sanctuary'} />

          <Text style={[styles.menuSectionTitle, { color: palette.muted }]}>Account</Text>
          <MenuItem title="Profile" onPress={openProfile} />
          <MenuItem title="Garden Stats" onPress={() => {}} />

          <View style={[styles.toggleRow, { borderBottomColor: palette.divider }]}>
            <Text style={[styles.menuText, { color: palette.text }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ true: palette.activeTrack, false: palette.inactiveTrack }}
              thumbColor={palette.thumb}
            />
          </View>

          <MenuItem title="Notifications" onPress={() => {}} />
          <MenuItem title="Account Settings" onPress={openProfile} />
          <MenuItem title="Help & Support" onPress={() => {}} />
          <MenuItem title="About Plantae" onPress={openAbout} />

          <MenuItem
            title="Logout"
            isLogout={true}
            onPress={() => {
              navigation.closeDrawer();
              if (onLogout) {
                onLogout();
              }
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
