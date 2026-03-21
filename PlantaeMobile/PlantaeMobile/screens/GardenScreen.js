import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>About Plantae</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          Plantae bridges the gap between technology and nature. Version 2.0.26.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 40, justifyContent: 'center' },
  back: { color: '#4f9a44', marginBottom: 20 },
  title: { fontSize: 28, color: '#fff', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 20, borderRadius: 20 },
  content: { color: '#eee', lineHeight: 24, textAlign: 'center' }
});