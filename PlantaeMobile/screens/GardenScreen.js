import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MobilePlantCard from '../components/MobilePlantCard';

const GardenScreen = ({ plants, onPlantClick, navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");

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
      {/* 1. Header - Minimalist Style */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Plantae.</Text>
        {/* The 'i' icon is removed. Users open settings by swiping from the right edge */}
      </View>

      {/* 2. Search Bar - Implementation of "Controlled Form" */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="search species..."
          value={searchQuery}
          onChangeText={setSearchQuery} 
          placeholderTextColor="#999"
        />
      </View>

      {/* 3. The Filtered List */}
      <FlatList
        data={filteredPlants}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1eeee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center', // Centered brand for a balanced minimalist look
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 50,
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
    paddingHorizontal: 20,
    paddingBottom: 20, 
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