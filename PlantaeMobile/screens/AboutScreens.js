import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Garden</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.brandTitle}>About Plantae</Text>
        <Text style={styles.subtitle}>Cultivating Digital Serenity</Text>

        <View style={styles.missionCard}>
          <Text style={styles.cardHeader}>Our Mission</Text>
          <Text style={styles.bodyText}>
            Plantae was born from a desire to bridge the gap between technology and nature. 
            We believe that tracking your green companions should be as beautiful as the 
            plants themselves.
          </Text>
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.missionCard, styles.gridItem]}>
            <Text style={styles.cardHeader}>Design</Text>
            <Text style={styles.bodyText}>Clean aesthetics & organic curves.</Text>
          </View>
          <View style={[styles.missionCard, styles.gridItem]}>
            <Text style={styles.cardHeader}>Care</Text>
            <Text style={styles.bodyText}>Tailored light & water schedules.</Text>
          </View>
        </View>

        <Text style={styles.versionTag}>Version 2.0.26 • Built with React Native</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Deep dark background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  backText: {
    color: '#ffffff',
    fontSize: 14,
  },
  contentContainer: {
    padding: 25,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 40,
  },
  missionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 25,
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 0.48, // Takes up slightly less than half to leave a gap
    padding: 20,
  },
  cardHeader: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  bodyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  versionTag: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 30,
    fontSize: 12,
  },
});