import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { plantData } from '../data/plants'; // Ensure this path is correct 
import MobilePlantCard from '../components/MobilePlantCard';

export default function GardenScreen({ navigation }) {
  // Task 1: Use useState for managing UI data [cite: 99]
  const [search, setSearch] = useState(''); 
  const [filteredPlants, setFilteredPlants] = useState(plantData);

  const handleSearch = (text) => {
    setSearch(text); // Task 2: Controlled component (TextInput with state) [cite: 114, 158]
    const filtered = plantData.filter(p => 
      p.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPlants(filtered); // State changes trigger visible UI updates [cite: 101, 161]
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plantae</Text>
        {/* Task 3: Navigation triggered via UI elements [cite: 131, 160] */}
        <TouchableOpacity onPress={() => navigation.navigate('About')}>
          <Text style={styles.navLink}>About</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search your garden..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredPlants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MobilePlantCard plant={item} />} // Task 3: Reusable component [cite: 37, 63]
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 }, // Task 4: Mobile-appropriate styling [cite: 47, 64]
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  navLink: { color: '#4f9a44', fontSize: 18, fontWeight: '600' },
  searchInput: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 20 }
});