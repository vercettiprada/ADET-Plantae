import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from '../styles/components/PlantCard.styles';
import { api } from '../src/api';

export const PlantCard = ({ plant, onPress }) => {
  const [imageUrl, setImageUrl] = useState(plant.imageUrl || api.getFallbackPlantImage(plant));

  useEffect(() => {
    setImageUrl(plant.imageUrl || api.getFallbackPlantImage(plant));
  }, [plant]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        onError={() => setImageUrl(api.getFallbackPlantImage(plant))}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.species}>{plant.species}</Text>
      </View>
    </TouchableOpacity>
  );
};
