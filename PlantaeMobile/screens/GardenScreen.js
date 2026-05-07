import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, Animated,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import MobilePlantCard from '../components/MobilePlantCard';
import {
  styles,
  EXPANDED_HEADER_HEIGHT,
  COLLAPSED_HEADER_HEIGHT,
  SEARCH_HEIGHT,
} from '../styles/screens/GardenScreen.styles';

export default function GardenScreen({
  plants = [],
  onPlantClick,
  onAddPlant,
  loadingMore,
  loadMorePlants,
  navigation,
  theme,
  isDarkMode,
}) {
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
    outputRange: [EXPANDED_HEADER_HEIGHT, COLLAPSED_HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });

  const titleSize = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [42, 26],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -4],
    extrapolate: 'clamp',
  });

  const searchHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [SEARCH_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [1, 0.45, 0],
    extrapolate: 'clamp',
  });

  const searchMarginTop = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [12, 0],
    extrapolate: 'clamp',
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f1eeee' }]}>
      <Animated.View style={[styles.header, { height: headerHeight, backgroundColor: isDarkMode ? '#121212' : '#f1eeee' }]}>
        <View style={styles.topRow}>
          <Animated.Text
            style={[
              styles.brand,
              {
                opacity: titleOpacity,
                fontSize: titleSize,
                color: isDarkMode ? '#a5d6a7' : '#2d5a27',
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            Plantae.
          </Animated.Text>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
            <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27' }]} />
            <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27', width: 20 }]} />
            <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27' }]} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.searchWrap,
            {
              height: searchHeight,
              marginTop: searchMarginTop,
              opacity: searchOpacity,
              transform: [{ translateY: searchTranslateY }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.search, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', color: isDarkMode ? '#e0e0e0' : '#333' }]}
              placeholder="search species..."
              placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              onPress={onAddPlant}
              style={[styles.addPlantButton, { backgroundColor: isDarkMode ? '#7fb07b' : '#2d5a27' }]}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel="Add plant"
            >
              <Text style={styles.addPlantIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.FlatList
        data={filteredPlants}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
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
