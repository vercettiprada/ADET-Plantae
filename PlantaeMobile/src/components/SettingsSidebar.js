import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { BlurView } from 'expo-blur';

export default function SettingsSidebar({ navigation, isDarkMode, setIsDarkMode, onLogout }) {
  const MenuItem = ({ title, onPress, isLogout }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={[styles.menuText, isLogout && styles.logoutText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
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

          {/* Dark Mode toggle */}
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

          {/* Logout — calls handleLogout from App.js */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  sidebarHeaderContainer: {
    padding: 30, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  sidebarHeaderTitle: { fontSize: 24, fontWeight: '600', color: 'rgb(63,62,62)' },
  closeXApple: { fontSize: 28, color: 'rgb(112,112,112)', opacity: 0.7 },
  menuGroup: { paddingHorizontal: 34 },
  menuItem: { paddingVertical: 12, marginVertical: 4, borderRadius: 12 },
  menuText: { fontSize: 16, color: 'rgba(78,78,78,0.8)' },
  logoutText: { color: '#e53935', fontWeight: '600', marginTop: 20 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12, marginVertical: 4,
  },
});
