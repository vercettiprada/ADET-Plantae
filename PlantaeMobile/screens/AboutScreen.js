import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Garden</Text>
        </TouchableOpacity>

        <Text style={styles.title}>About Plantae</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Plantae bridges the gap between technology and nature. 
            Designed for digital serenity and botanical tracking.
          </Text>
        </View>

        <Text style={styles.version}>Version 2.0.26 • Built with React Native</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { padding: 30, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 30, backgroundColor: '#1e1e1e', padding: 10, borderRadius: 10 },
  backText: { color: '#4f9a44', fontWeight: 'bold' },
  title: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#161616', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  cardText: { color: '#ccc', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  version: { marginTop: 40, color: '#555', fontSize: 12 }
});