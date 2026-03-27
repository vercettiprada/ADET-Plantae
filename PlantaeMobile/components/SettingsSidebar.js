import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur'; // Ensure expo-blur is installed

export default function SettingsSidebar({ navigation }) {
  const MenuItem = ({ title, onPress, isLogout }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={[styles.menuText, isLogout && styles.logoutText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* This mimics your --ios-blur and glass-white background */}
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.container}>
        <View style={styles.sidebarHeaderContainer}>
          <Text style={styles.sidebarHeaderTitle}>Settings</Text>
          <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <Text style={styles.closeXApple}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuGroup}>
          <MenuItem title="Profile" />
          <MenuItem title="Garden Stats" />
          <MenuItem title="Dark Mode" />
          <MenuItem title="Notifications" />
          <MenuItem title="Account Settings" />
          <MenuItem title="Help & Support" />
          
          {/* This matches: <p onClick={onAboutClick}>About Plantae</p> */}
          <MenuItem title="About Plantae" onPress={() => navigation.navigate('About')} />
          
          <MenuItem title="Logout" isLogout={true} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Matches your --glass-white background
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
  },
  sidebarHeaderContainer: {
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Matches your .sidebar-header styles
  },
  sidebarHeaderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgb(63, 62, 62)',
  },
  closeXApple: {
    fontSize: 28,
    color: 'rgb(112, 112, 112)',
    opacity: 0.7,
  },
  menuGroup: {
    paddingHorizontal: 34,
  },
  menuItem: {
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 16,
    color: 'rgba(78, 78, 78, 0.8)', // Matches your .menu-group p
  },
  logoutText: {
    color: '#636363',
    fontWeight: '600',
    marginTop: 20,
  }
});