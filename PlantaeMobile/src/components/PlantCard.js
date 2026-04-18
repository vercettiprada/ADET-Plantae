import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export const PlantCard = ({ plant, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: plant.imageUrl }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.name}>{plant.name}</Text>
      <Text style={styles.species}>{plant.species}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, overflow: 'hidden' },
  image: { height: 200, width: '100%' },
  info: { padding: 15 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#2d5a27' },
  species: { fontSize: 14, color: '#888', fontStyle: 'italic' }
});