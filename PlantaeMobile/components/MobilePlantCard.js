import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/MobilePlantCard.styles';
import { api } from '../src/api';

export default function MobilePlantCard({ plant, onPress }) {
  const [imageUrl, setImageUrl] = useState(plant.imageUrl || api.getFallbackPlantImage(plant));

  useEffect(() => {
    setImageUrl(plant.imageUrl || api.getFallbackPlantImage(plant));
  }, [plant]);

  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.plantImage}
        onError={() => setImageUrl(api.getFallbackPlantImage(plant))}
      />
      <BlurView intensity={40} tint="dark" style={styles.glassOverlay}>
        <Text style={styles.speciesText}>{plant.species}</Text>
        <Text style={styles.commonName}>{plant.name}</Text>
        <View style={styles.carePrompt}><Text style={styles.carePromptText}>Care Guide</Text></View>
      </BlurView>
    </TouchableOpacity>
  );
}
