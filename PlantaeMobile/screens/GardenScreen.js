import React, { useMemo } from 'react';
// ... your other imports (BlurView, FlatList, etc.)

const GardenScreen = ({ plants, searchQuery, setSearchQuery, onAboutClick, onPlantClick }) => {
  
  // LAB 7 REQUIREMENT: Search/Filter Logic
  const filteredPlants = useMemo(() => {
    return plants.filter((plant) =>
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, plants]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header with your custom font title */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>plantae.</Text>
        <TouchableOpacity onPress={onAboutClick}>
          <Ionicons name="information-circle-outline" size={28} color="#121212" />
        </TouchableOpacity>
      </View>

      {/* 2. Search Bar (Lab 7 Interaction) */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="search species..."
          value={searchQuery}
          onChangeText={setSearchQuery} // This updates the state in your parent App.js
          placeholderTextColor="#999"
        />
      </View>

      {/* 3. The Filtered List */}
      <FlatList
        data={filteredPlants} // Use the filtered list here, not the raw plants array
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MobilePlantCard 
            plant={item} 
            onPress={() => onPlantClick(item)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Show this if no plants match the search
        ListEmptyComponent={
          <Text style={styles.emptyText}>no species found in this sanctuary.</Text>
        }
      />
    </SafeAreaView>
  );
};

export default GardenScreen;
