import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/MobilePlantCard.styles';

export default function MobilePlantCard({ plant, onPress }) {
  const careLabel = plant.careLabel || 'Add to your sanctuary';

  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.92} onPress={onPress}>
      <Image source={{ uri: plant.imageUrl }} style={styles.plantImage} />
      <BlurView intensity={40} tint="dark" style={styles.glassOverlay}>
        <View style={styles.topMeta}>
          {plant.care?.inSanctuary && (
            <View style={styles.collectionPill}>
              <Text style={styles.collectionPillText}>Saved</Text>
            </View>
          )}
        </View>

        <Text style={styles.speciesText}>{plant.species}</Text>
        <Text style={styles.commonName}>{plant.name}</Text>
        <Text style={styles.detailText}>{careLabel}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.lightText}>{plant.light}</Text>
          <Text style={styles.openText}>Open Details</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}
