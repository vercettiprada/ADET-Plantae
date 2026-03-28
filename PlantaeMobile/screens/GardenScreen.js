import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  Animated, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MobilePlantCard from '../components/MobilePlantCard'; // Reusable Component Lab 6

const GardenScreen = ({ plants, onPlantClick, navigation }) => {
  // 1. STATE MANAGEMENT (Satisfies Lab 7 Task 1)
  const [searchQuery, setSearchQuery] = useState(""); 
  const scrollY = useRef(new Animated.Value(0)).current;

  // Instagram Style Clamping
  const diffClamp = Animated.diffClamp(scrollY, 0, 100);

  const headerTranslateY = diffClamp.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const titleScale = diffClamp.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });

  const searchOpacity = diffClamp.interpolate({
    inputRange: [0, 50],
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
    <SafeAreaView style={styles.container}>
      
      {/* HEADER LAYER */}
      <Animated.View style={[styles.fixedHeaderContainer, { transform: [{ translateY: headerTranslateY }] }]}>
        <View style={styles.header}>
          <Animated.Text style={[styles.brandTitle, { transform: [{ scale: titleScale }] }]}>
            Plantae.
          </Animated.Text>
          
          {/* NAVIGATION BUTTON (Satisfies Lab 7 Task 3) */}
          <TouchableOpacity 
            style={styles.aboutButton} 
            onPress={() => navigation.navigate('About')}
          >
            <Ionicons name="information-circle-outline" size={24} color="#2d5a27" />
          </TouchableOpacity>
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1eeee' },
  fixedHeaderContainer: { backgroundColor: '#f1eeee', zIndex: 10, position: 'absolute', top: 50, left: 0, right: 0, height: 140 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 70, position: 'relative' },
  aboutButton: { position: 'absolute', right: 25 },
  brandTitle: { fontSize: 52, fontFamily: 'AstonScript', color: '#2d5a27' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 6, paddingHorizontal: 12, height: 42 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#2d5a27' },
  listContent: { paddingHorizontal: 20, paddingTop: 150, paddingBottom: 20 },
});

export default GardenScreen;