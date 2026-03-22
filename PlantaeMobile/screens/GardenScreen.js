import React from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import MobilePlantCard from '../components/MobilePlantCard';

export default function GardenScreen({ plants, searchQuery, setSearchQuery, onAboutClick, onPlantClick }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>CULTIVATING DIGITAL SERENITY</Text>
          <Text style={styles.brandTitle}>Plantae</Text>
        </View>
        <TouchableOpacity style={styles.iconCircleBtn} onPress={onAboutClick}>
          <Text style={styles.barIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <BlurView intensity={30} tint="light" style={styles.glassSearchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your garden.."
            placeholderTextColor="rgba(45, 90, 39, 0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </BlurView>
      </View>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MobilePlantCard plant={item} onPress={() => onPlantClick(item)} />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  subtitle: { fontSize: 10, fontWeight: '700', color: '#2d5a27', letterSpacing: 1, opacity: 0.6 },
  brandTitle: { fontSize: 48, fontWeight: '700', color: '#2d5a27', letterSpacing: -1.5 },
  iconCircleBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)', alignItems: 'center', justifyContent: 'center' },
  barIcon: { fontSize: 20, color: '#2d5a27' },
  searchWrapper: { paddingHorizontal: 20, marginBottom: 25 },
  glassSearchContainer: { borderRadius: 50, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)' },
  searchInput: { padding: 16, textAlign: 'center', fontSize: 16, color: '#2d5a27' }
});