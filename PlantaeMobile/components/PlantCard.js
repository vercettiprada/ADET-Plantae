import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from '../styles/components/PlantCard.styles';

export const PlantCard = ({ plant, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: plant.imageUrl }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.name}>{plant.name}</Text>
      <Text style={styles.species}>{plant.species}</Text>
    </View>
  </TouchableOpacity>
);
