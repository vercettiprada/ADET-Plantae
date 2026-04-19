import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/MobilePlantCard.styles';

export default function MobilePlantCard({ plant, onPress }) {
  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: plant.imageUrl }} style={styles.plantImage} />
      <BlurView intensity={40} tint="dark" style={styles.glassOverlay}>
        <Text style={styles.speciesText}>{plant.species}</Text>
        <Text style={styles.commonName}>{plant.name}</Text>
        <View style={styles.carePrompt}><Text style={styles.carePromptText}>Care Guide</Text></View>
      </BlurView>
    </TouchableOpacity>
  );
}
