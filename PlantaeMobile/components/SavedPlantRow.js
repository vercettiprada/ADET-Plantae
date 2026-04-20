import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/components/SavedPlantRow.styles';

export default function SavedPlantRow({ plant, isDarkMode, onPress, variant = 'saved' }) {
  const scheduleText = `Water every ${plant.care?.cadenceDays || 7} day${(plant.care?.cadenceDays || 7) === 1 ? '' : 's'}`;
  const historyText = plant.careLabel || 'Saved plant';

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
    >
      <Image source={{ uri: plant.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: isDarkMode ? '#f1f4ef' : '#1a2d1d' }]} numberOfLines={1}>
          {plant.name}
        </Text>
        <Text style={[styles.species, { color: isDarkMode ? '#95a295' : '#68766a' }]} numberOfLines={1}>
          {plant.species}
        </Text>
        <Text style={[styles.meta, { color: isDarkMode ? '#b9c4b8' : '#5b695d' }]} numberOfLines={1}>
          {historyText}
        </Text>
        <Text style={[styles.schedule, { color: isDarkMode ? '#8f9a8e' : '#748176' }]} numberOfLines={1}>
          {variant === 'fresh' ? scheduleText : scheduleText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
