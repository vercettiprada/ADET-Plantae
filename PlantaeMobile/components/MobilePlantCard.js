import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function MobilePlantCard({ plant }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image source={{ uri: plant.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.species}>{plant.species}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 10 },
  info: { marginLeft: 15 },
  name: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  species: { color: '#aaa', fontSize: 14, fontStyle: 'italic' }
});