import React, { useMemo } from 'react';
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

const GardenScreen = ({ plants, searchQuery, setSearchQuery, onAboutClick, onPlantClick }) => {
  
  const filteredPlants = useMemo(() => {
    return plants.filter((plant) =>
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, plants]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Plantae.</Text>
        <TouchableOpacity onPress={onAboutClick}>
          <Ionicons name="information-circle-outline" size={28} color="#121212" />
        </TouchableOpacity>
      </View>

      {/* 2. Search Bar */}
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
          <Text style={styles.emptyText}>no species found in this sanctuary.</Text>
        }
      />
    </SafeAreaView>
  );
};

// MISSING STYLES WAS CAUSING THE ERROR
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1eeee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  brandTitle: {
    fontSize: 62,
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
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    // Elevation for Android
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
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontSize: 16,
  }
});

export default GardenScreen;