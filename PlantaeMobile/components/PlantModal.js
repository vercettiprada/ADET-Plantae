import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';

export default function PlantModal({ plant, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState(plant);

  useEffect(() => { setEditedPlant(plant); }, [plant]);

  const handleSave = () => {
    onSave(editedPlant);
    setIsEditing(false);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={!!plant}>
      <BlurView intensity={95} tint="dark" style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}><Text style={styles.headerText}>Close</Text></TouchableOpacity>
            <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
              <Text style={[styles.headerText, { color: '#4f9a44' }]}>{isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={{ uri: plant.imageUrl }} style={styles.heroImage} />
            <View style={styles.infoPadding}>
              <Text style={styles.species}>{plant.species}</Text>
              <Text style={styles.name}>{plant.name}</Text>

              <View style={styles.careSection}>
                <Text style={styles.sectionHeader}>Plant Care & Info</Text>
                <View style={styles.careGrid}>
                  <View style={styles.careBox}>
                    <Text style={styles.label}>Light</Text>
                    {isEditing ? (
                      <TextInput style={styles.editInput} value={editedPlant.light} onChangeText={(val) => setEditedPlant({...editedPlant, light: val})} />
                    ) : ( <Text style={styles.value}>{plant.light}</Text> )}
                  </View>
                  <View style={styles.careBox}>
                    <Text style={styles.label}>Water</Text>
                    {isEditing ? (
                      <TextInput style={styles.editInput} value={editedPlant.water} onChangeText={(val) => setEditedPlant({...editedPlant, water: val})} />
                    ) : ( <Text style={styles.value}>{plant.water}</Text> )}
                  </View>
                </View>
              </View>

              <View style={styles.secretBox}>
                <Text style={styles.secretTitle}>Secret Fact</Text>
                {isEditing ? (
                  <TextInput multiline style={styles.editArea} value={editedPlant.secretfact} onChangeText={(val) => setEditedPlant({...editedPlant, secretfact: val})} />
                ) : ( <Text style={styles.secretText}>{plant.secretfact}</Text> )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1 },
  modalContent: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  headerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  heroImage: { width: '90%', height: 300, borderRadius: 30, alignSelf: 'center' },
  infoPadding: { padding: 25 },
  species: { color: '#4f9a44', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  name: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 15 },
  careGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  careBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 20, width: '48%' },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  value: { color: '#fff', fontSize: 14, fontWeight: '600' },
  editInput: { color: '#fff', borderBottomWidth: 1, borderColor: '#4f9a44', marginTop: 5 },
  secretBox: { backgroundColor: '#111', padding: 20, borderRadius: 25, borderLeftWidth: 4, borderLeftColor: '#4f9a44' },
  secretTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  secretText: { color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
  editArea: { color: '#fff', fontSize: 14, lineHeight: 22 }
});