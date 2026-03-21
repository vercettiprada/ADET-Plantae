import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function MobilePlantCard({ plant, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: plant.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.species}>{plant.species}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginVertical: 10,
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  image: { width: 60, height: 60, borderRadius: 10 },
  info: { marginLeft: 15, justifyContent: 'center' },
  name: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  species: { color: '#ccc', fontStyle: 'italic' },
});