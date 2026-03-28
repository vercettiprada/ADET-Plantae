import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  TouchableOpacity, Switch, Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
  'profile',
  'garden stats',
  'dark mode', // We'll add a switch here
  'notifications',
  'account settings',
  'help & support',
  'about plantae',
  'logout',
];

const SettingsSidebar = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. ARCHITECTURAL HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>settings</Text>
        <View style={styles.accentDot} />
      </View>

      {/* 2. HIGH-FASHION MINIMALIST MENU */}
      <View style={styles.menuContent}>
        {MENU_ITEMS.map((item, index) => {
          const isDarkModeToggle = item === 'dark mode';
          const isLogout = item === 'logout';

          return (
            <View key={index} style={[styles.menuRow, isDarkModeToggle && styles.rowWithToggle]}>
              <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                <Text style={[
                    styles.menuText, 
                    isLogout && { color: '#888' }, // Subtle grey for logout
                    isDarkModeToggle && { fontWeight: '700' } // Bold the toggle item
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>

              {isDarkModeToggle && (
                <Switch 
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: '#ccc', true: '#2d5a27' }}
                  thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                  ios_backgroundColor="#ccc"
                />
              )}
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Pure white, no light grey here
    paddingHorizontal: 40, // Massive padding for editorial feel
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 80, // Massive leading space
  },
  headerTitle: {
    fontSize: 48, // Poster-sized
    fontWeight: '700', // Heavy weight for title
    letterSpacing: -1,
    textTransform: 'lowercase',
    color: '#121212',
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4f9a44',
    marginLeft: 3,
    marginBottom: 10,
  },
  menuContent: {
    flex: 1,
  },
  menuRow: {
    marginBottom: 40, // BRUTAL spacing between items
  },
  rowWithToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    flex: 1,
  },
  menuText: {
    fontSize: 22, // Large and clean
    fontWeight: '400',
    letterSpacing: 0.5,
    textTransform: 'lowercase', // THE KEY aesthetic change
    color: '#121212',
  },
});

export default SettingsSidebar;