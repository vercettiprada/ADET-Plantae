import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Animated, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GardenScreen({ plants, onPlantClick, loadingMore, loadMorePlants, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredPlants = useMemo(() => {
    return plants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, plants]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [200, 100],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>Plantae.</Text>
          <TouchableOpacity onPress={onLogout}>
            <Ionicons name="log-out-outline" size={28} color="#2d5a27" />
          </TouchableOpacity>
        </View>
        <TextInput 
          style={styles.search} 
          placeholder="search species..." 
          onChangeText={setSearchQuery} 
        />
      </Animated.View>

      <FlatList
        data={filteredPlants}
        contentContainerStyle={{ paddingTop: 220, paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        onEndReached={loadMorePlants}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onPlantClick(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.img} />
            <View style={styles.cardInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.species}>{item.species}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 20 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1eeee' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#f1eeee', zIndex: 10, paddingHorizontal: 20, paddingTop: 50 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 32, fontFamily: 'AstonScript', color: '#2d5a27' },
  search: { backgroundColor: '#fff', padding: 12, borderRadius: 15, marginTop: 15 },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', elevation: 3 },
  img: { height: 200, width: '100%' },
  cardInfo: { padding: 15 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#2d5a27' },
  species: { color: '#888', fontStyle: 'italic' }
});