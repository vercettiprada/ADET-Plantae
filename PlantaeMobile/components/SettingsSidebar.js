import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/SettingsSidebar.styles';

export default function SettingsSidebar({ navigation, isDarkMode, setIsDarkMode, onLogout }) {
  const MenuItem = ({ title, onPress, isLogout }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={[styles.menuText, isLogout && styles.logoutText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.sidebarHeaderContainer}>
          <Text style={styles.sidebarHeaderTitle}>Settings</Text>
          <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <Text style={styles.closeXApple}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuGroup}>
          <MenuItem title="Profile" onPress={() => {}} />
          <MenuItem title="Garden Stats" onPress={() => {}} />

          <View style={styles.toggleRow}>
            <Text style={styles.menuText}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ true: '#2d5a27', false: '#ccc' }}
              thumbColor="#fff"
            />
          </View>

          <MenuItem title="Notifications" onPress={() => {}} />
          <MenuItem title="Account Settings" onPress={() => {}} />
          <MenuItem title="Help & Support" onPress={() => {}} />
          <MenuItem title="About Plantae" onPress={() => navigation.navigate('About')} />

          <MenuItem
            title="Logout"
            isLogout={true}
            onPress={() => {
              navigation.closeDrawer();
              if (onLogout) onLogout();
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
