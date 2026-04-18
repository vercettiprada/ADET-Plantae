import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Animated,
  FlatList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import MobilePlantCard from '../components/MobilePlantCard';

export default function GardenScreen({ plants = [], onPlantClick, loadingMore, loadMorePlants, navigation, theme, isDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredPlants = useMemo(() => {
    if (!searchQuery) return plants;
    return plants.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.species.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, plants]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [180, 90],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });

  const titleSize = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [42, 28],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f1eeee' }]}>

      {/* Animated header — same as original */}
      <Animated.View style={[styles.header, { height: headerHeight, backgroundColor: isDarkMode ? '#121212' : '#f1eeee' }]}>
        <View style={styles.topRow}>
          <Animated.Text style={[styles.brand, { opacity: titleOpacity, fontSize: titleSize, color: isDarkMode ? '#a5d6a7' : '#2d5a27' }]}>
            Plantae.
          </Animated.Text>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
            <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27' }]} />
            <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27', width: 20 }]} />
            <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27' }]} />
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.search, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', color: isDarkMode ? '#e0e0e0' : '#333' }]}
          placeholder="search species..."
          placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Animated.View>

      {/* Plant list — uses original MobilePlantCard (BlurView glass design) */}
      <Animated.FlatList
        data={filteredPlants}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ paddingTop: 195, paddingHorizontal: 20, paddingBottom: 40 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onEndReached={loadMorePlants}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MobilePlantCard
            plant={item}
            onPress={() => onPlantClick(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDarkMode ? '#666' : '#aaa' }]}>
              {plants.length === 0 ? 'Loading your garden...' : 'No plants found.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore
            ? <ActivityIndicator size="small" color="#2d5a27" style={{ margin: 20 }} />
            : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 10, paddingHorizontal: 20, paddingTop: 55,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  brand: {
    fontFamily: 'AstonScript', color: '#2d5a27',
  },
  menuBtn: { padding: 5, gap: 5 },
  menuLine: { width: 26, height: 2.5, borderRadius: 2, marginVertical: 2.5 },
  search: {
    padding: 12, borderRadius: 15, marginTop: 10, fontSize: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16 },
});
