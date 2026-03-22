import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

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

const styles = StyleSheet.create({
  cardContainer: { height: 400, borderRadius: 30, overflow: 'hidden', marginBottom: 20, backgroundColor: '#000' },
  plantImage: { width: '100%', height: '100%', position: 'absolute' },
  glassOverlay: { position: 'absolute', bottom: 0, width: '100%', padding: 25, borderTopWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  speciesText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontStyle: 'italic' },
  commonName: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: 4 },
  carePrompt: { marginTop: 15, paddingVertical: 6, paddingHorizontal: 15, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20, alignSelf: 'flex-start' },
  carePromptText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }
});