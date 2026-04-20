import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, Animated,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import MobilePlantCard from '../components/MobilePlantCard';
import SavedPlantRow from '../components/SavedPlantRow';
import AddPlantRow from '../components/AddPlantRow';
import {
  styles,
  EXPANDED_HEADER_HEIGHT,
  COLLAPSED_HEADER_HEIGHT,
  SEARCH_HEIGHT,
} from '../styles/screens/GardenScreen.styles';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sanctuary', label: 'My Sanctuary' },
  { key: 'fresh', label: 'Recently Watered' },
];

export default function GardenScreen({
  plants = [],
  onPlantClick,
  loadingMore,
  loadMorePlants,
  navigation,
  isDarkMode,
  profile,
  gardenView,
  onAddPlant,
  isIdentifyingPlant,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gardenView === 'sanctuary') {
      setActiveFilter('sanctuary');
      return;
    }

    setActiveFilter('all');
  }, [gardenView]);

  const sanctuaryPlants = useMemo(
    () => plants.filter((plant) => plant.care?.inSanctuary),
    [plants]
  );

  const freshPlants = useMemo(
    () => sanctuaryPlants.filter((plant) => plant.waterStatus?.key === 'good'),
    [sanctuaryPlants]
  );

  const duePlants = useMemo(
    () => sanctuaryPlants.filter((plant) => plant.waterStatus?.key === 'due' || plant.waterStatus?.key === 'new'),
    [sanctuaryPlants]
  );

  const todaysSpotlight = duePlants[0] || sanctuaryPlants[0] || plants[0] || null;

  const filteredPlants = useMemo(() => {
    const lowerQuery = searchQuery.trim().toLowerCase();

    const basePlants = (() => {
      switch (activeFilter) {
        case 'sanctuary':
          return sanctuaryPlants;
        case 'fresh':
          return freshPlants;
        default:
          return plants;
      }
    })();

    if (!lowerQuery) {
      return basePlants;
    }

    return basePlants.filter((plant) => (
      plant.name.toLowerCase().includes(lowerQuery) ||
      plant.species.toLowerCase().includes(lowerQuery) ||
      plant.light.toLowerCase().includes(lowerQuery) ||
      plant.water.toLowerCase().includes(lowerQuery)
    ));
  }, [activeFilter, freshPlants, plants, sanctuaryPlants, searchQuery]);

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
    outputRange: [14, 0],
    extrapolate: 'clamp',
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -8],
    extrapolate: 'clamp',
  });

  const renderHeaderContent = () => (
    <>
      <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#151915' : '#ffffff', borderColor: isDarkMode ? '#252d25' : '#dde4da' }]}>
        <View style={styles.summaryCopy}>
          <Text style={[styles.summaryTitle, { color: isDarkMode ? '#f3f5f1' : '#1b2d1d' }]}>
            {duePlants.length > 0
              ? `${duePlants.length} plant${duePlants.length > 1 ? 's need' : ' needs'} water`
              : sanctuaryPlants.length > 0
                ? 'Your saved plants look good'
                : 'Browse plants and save your favorites'}
          </Text>
          <Text style={[styles.summaryText, { color: isDarkMode ? '#99a699' : '#627064' }]}>
            {todaysSpotlight
              ? `${todaysSpotlight.name} is next on your list.`
              : 'Start with the plant library below.'}
          </Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active
                    ? (isDarkMode ? '#243224' : '#edf4ec')
                    : 'transparent',
                  borderColor: active
                    ? (isDarkMode ? '#3c523c' : '#cfd9ce')
                    : (isDarkMode ? '#252d25' : '#dde4da'),
                },
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: active ? (isDarkMode ? '#eaf3e8' : '#234325') : (isDarkMode ? '#aab4aa' : '#5d6b5f') },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionHeading, { color: isDarkMode ? '#f0f3ee' : '#18301d' }]}>
        {activeFilter === 'sanctuary' ? 'Saved Plants' : activeFilter === 'fresh' ? 'Recently Watered' : 'Plants'}
      </Text>

      {activeFilter === 'sanctuary' && (
        <AddPlantRow
          isDarkMode={isDarkMode}
          onPress={onAddPlant}
          loading={isIdentifyingPlant}
        />
      )}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#101310' : '#eef0ea' }]}>
      <Animated.View style={[styles.header, { height: headerHeight, backgroundColor: isDarkMode ? '#101310' : '#eef0ea' }]}>
        <View style={styles.topRow}>
          <View>
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
            <Text style={[styles.welcomeLine, { color: isDarkMode ? '#8e9d8f' : '#5f6d60' }]}>
              {profile?.firstName ? `${profile.firstName}'s plant space` : 'Simple plant care for everyday people'}
            </Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity onPress={onAddPlant} style={styles.addPlantButton} activeOpacity={0.85}>
              <Text style={styles.addPlantButtonText}>{isIdentifyingPlant ? '...' : '+'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
              <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27' }]} />
              <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27', width: 20 }]} />
              <View style={[styles.menuLine, { backgroundColor: isDarkMode ? '#e0e0e0' : '#2d5a27' }]} />
            </TouchableOpacity>
          </View>
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
          <TextInput
            style={[
              styles.search,
              {
                backgroundColor: isDarkMode ? '#181d18' : '#fff',
                color: isDarkMode ? '#e0e0e0' : '#333',
                borderColor: isDarkMode ? '#243024' : '#d9e3d7',
              },
            ]}
            placeholder="Search plants, species, light, water..."
            placeholderTextColor={isDarkMode ? '#6f7b70' : '#97a397'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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
        ListHeaderComponent={renderHeaderContent}
        renderItem={({ item }) => (
          activeFilter === 'sanctuary' || activeFilter === 'fresh' ? (
            <SavedPlantRow
              plant={item}
              isDarkMode={isDarkMode}
              variant={activeFilter === 'fresh' ? 'fresh' : 'saved'}
              onPress={() => onPlantClick(item)}
            />
          ) : (
            <MobilePlantCard
              plant={item}
              isDarkMode={isDarkMode}
              onPress={() => onPlantClick(item)}
            />
          )
        )}
        ListEmptyComponent={(
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDarkMode ? '#808c80' : '#889688' }]}>
              {plants.length === 0
                ? 'Loading your sanctuary...'
                : activeFilter === 'sanctuary'
                  ? 'No saved plants yet.'
                  : 'No plants match this view yet.'}
            </Text>
          </View>
        )}
        ListFooterComponent={
          loadingMore
            ? <ActivityIndicator size="small" color="#2d5a27" style={{ margin: 20 }} />
            : null
        }
      />
    </View>
  );
}
