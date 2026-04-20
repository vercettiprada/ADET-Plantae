import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/AddPlantRow.styles';

export default function AddPlantRow({ isDarkMode, onPress, loading }) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: isDarkMode ? '#171b17' : '#ffffff',
          borderColor: isDarkMode ? '#262d26' : '#dde4da',
        },
      ]}
      activeOpacity={0.88}
      onPress={onPress}
      disabled={loading}
    >
      <BlurView intensity={50} tint={isDarkMode ? 'dark' : 'light'} style={styles.plusTile}>
        <Text style={styles.plus}>{loading ? '...' : '+'}</Text>
      </BlurView>
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDarkMode ? '#f1f4ef' : '#1a2d1d' }]}>
          Add My Plant
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#95a295' : '#68766a' }]}>
          Take a photo or upload one to identify it first.
        </Text>
      </View>
    </TouchableOpacity>
  );
}
