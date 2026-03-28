import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Animated, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MobilePlantCard from '../components/MobilePlantCard'; // Reusable Component Lab 6

const GardenScreen = ({ plants, onPlantClick }) => {
  // 1. STATE MANAGEMENT (Satisfies Lab 7 Task 1)
  const [searchQuery, setSearchQuery] = useState(""); 
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- THE FIX ---
  // 1. Prevent negative values from iOS bounce
  const clampedScrollY = scrollY.interpolate({
    inputRange: [0, 10000],
    outputRange: [0, 10000],
    extrapolateLeft: 'clamp', 
  });

  // 2. Map directly to scroll position (Removes the "snap/reappear" behavior)
  // This makes it vanish as you scroll down and ONLY reappear when you hit the top.
  const headerTranslateY = clampedScrollY.interpolate({
    inputRange: [0, 150], // Distance it takes to fully hide
    outputRange: [0, -150], 
    extrapolate: 'clamp',
  });

  const titleScale = clampedScrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const searchOpacity = clampedScrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 2. CONTROLLED FORM LOGIC (Satisfies Lab 7 Task 2)
  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const name = plant.name ? plant.name.toLowerCase() : "";
      const species = plant.species ? plant.species.toLowerCase() : "";
      const query = searchQuery ? searchQuery.toLowerCase() : "";
      return name.includes(query) || species.includes(query);
    });
  }, [searchQuery, plants]);

  return (
    <View style={styles.container}>
      
      {/* HEADER LAYER */}
      <Animated.View style={[
          styles.fixedHeaderContainer, 
          { transform: [{ translateY: headerTranslateY }] }
      ]}>
        <View style={styles.header}>
          <Animated.Text style={[styles.brandTitle, { transform: [{ scale: titleScale }] }]}>
            Plantae.
          </Animated.Text>
        </View>

        {/* CONTROLLED TEXT INPUT FORM */}
        <Animated.View style={[styles.searchContainer, { opacity: searchOpacity }]}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="search species..."
            value={searchQuery} // Controlled Input
            onChangeText={setSearchQuery} // Updates State
            placeholderTextColor="#999"
          />
        </Animated.View>
      </Animated.View>

      {/* RENDERED LIST */}
      <Animated.FlatList
        data={filteredPlants}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MobilePlantCard 
            plant={item} 
            onPress={() => onPlantClick(item)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>no species found in this sanctuary.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1eeee',
  },
  fixedHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f1eeee',
    zIndex: 10,
    paddingTop: 50, 
    height: 200, // Fixed height to cover the title during the slide
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    height: 100,
  },
  brandTitle: {
    fontSize: 52,
    fontFamily: 'AstonScript', 
    color: '#2d5a27',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 18, 
    paddingHorizontal: 12,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d5a27',
  },
  listContent: {
    paddingTop: 220, 
    paddingHorizontal: 20,
    paddingBottom: 40, 
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic',
  }
});

export default GardenScreen;