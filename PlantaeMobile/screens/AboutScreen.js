import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

export default function AboutScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Garden</Text> 
        </TouchableOpacity>
        
        <Text style={styles.title}>About Plantae</Text>
        <Text style={styles.subtitle}>Cultivating Digital Serenity</Text> 

        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardText}>
            Plantae was born from a desire to bridge the gap between technology and nature. 
            We believe that tracking your green companions should be as beautiful as the plants themselves.
          </Text> 
        </View>

        <View style={styles.grid}>
          <View style={[styles.glassCard, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.smallTitle}>Minimalist</Text>
            <Text style={styles.smallText}>Inspired by Apple's clean aesthetics.</Text>
          </View>
          <View style={[styles.glassCard, { flex: 1 }]}>
            <Text style={styles.smallTitle}>Smart Care</Text>
            <Text style={styles.smallText}>Tailored schedules for every species.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1eeee' },
  container: { padding: 25 },
  backBtn: { marginBottom: 30 },
  backBtnText: { color: '#2d5a27', fontWeight: '700' }, // [cite: 147]
  title: { fontSize: 36, fontWeight: '700', color: '#2d5a27', textAlign: 'center' }, // [cite: 102]
  subtitle: { fontSize: 16, color: '#2d5a27', opacity: 0.6, textAlign: 'center', marginBottom: 40 }, // [cite: 103]
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // [cite: 153]
    borderRadius: 24, padding: 25, // [cite: 155-156]
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 20
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d5a27', marginBottom: 12 },
  cardText: { color: '#444', lineHeight: 22, fontSize: 15 }, // [cite: 158]
  grid: { flexDirection: 'row', justifyContent: 'space-between' }, // [cite: 164-167]
  smallTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d5a27', marginBottom: 5 },
  smallText: { fontSize: 12, color: '#666' }
});