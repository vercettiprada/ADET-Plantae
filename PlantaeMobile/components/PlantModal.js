import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, Image, TouchableOpacity,
  ScrollView, TextInput, SafeAreaView, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/PlantModal.styles';

const displayValue = (value, fallback = 'Not available') => {
  const normalized = typeof value === 'string' ? value.trim() : value;
  return normalized ? normalized : fallback;
};

export default function PlantModal({ plant, onClose, onSave, loading = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState(plant);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plant) {
      setEditedPlant(plant);
      setIsEditing(false);
      setIsSaving(false);
    }
  }, [plant]);

  const handleSave = async () => {
    if (!onSave || isSaving) {
      return;
    }

    setIsSaving(true);
    const saved = await onSave(editedPlant);

    if (saved) {
      setIsEditing(false);
      onClose();
    }

    setIsSaving(false);
  };

  const hardinessRange = plant?.hardinessMin && plant?.hardinessMax
    ? `${plant.hardinessMin} - ${plant.hardinessMax}`
    : '';

  return (
    <Modal animationType="slide" transparent={true} visible={!!plant}>
      <BlurView intensity={95} tint="dark" style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.headerText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={isSaving}
                >
                  <Text style={[styles.headerText, { color: '#4f9a44' }]}>
                    {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {plant && (
                  <>
                    <Image source={{ uri: plant.imageUrl }} style={styles.heroImage} />

                    <View style={styles.infoPadding}>
                      <Text style={styles.species}>{plant.species}</Text>
                      <Text style={styles.name}>{plant.name}</Text>

                      <View>
                        <Text style={styles.sectionHeader}>Plant Care & Info</Text>
                        <View style={styles.careGrid}>
                          <View style={styles.careBox}>
                            <Text style={styles.label}>Light</Text>
                            {isEditing ? (
                              <TextInput
                                style={styles.editInput}
                                value={editedPlant.light}
                                onChangeText={(val) => setEditedPlant({ ...editedPlant, light: val })}
                                placeholderTextColor="rgba(255,255,255,0.3)"
                              />
                            ) : (
                              <Text style={styles.value}>{displayValue(plant.light)}</Text>
                            )}
                          </View>

                          <View style={styles.careBox}>
                            <Text style={styles.label}>Water</Text>
                            {isEditing ? (
                              <TextInput
                                style={styles.editInput}
                                value={editedPlant.water}
                                onChangeText={(val) => setEditedPlant({ ...editedPlant, water: val })}
                                placeholderTextColor="rgba(255,255,255,0.3)"
                              />
                            ) : (
                              <Text style={styles.value}>{displayValue(plant.water)}</Text>
                            )}
                          </View>

                          <View style={styles.careBox}>
                            <Text style={styles.label}>Cycle</Text>
                            <Text style={styles.value}>{displayValue(plant.cycle)}</Text>
                          </View>

                          <View style={styles.careBox}>
                            <Text style={styles.label}>Maintenance</Text>
                            <Text style={styles.value}>{displayValue(plant.maintenance)}</Text>
                          </View>

                          <View style={styles.careBox}>
                            <Text style={styles.label}>Growth Rate</Text>
                            <Text style={styles.value}>{displayValue(plant.growthRate)}</Text>
                          </View>

                          <View style={styles.careBox}>
                            <Text style={styles.label}>Hardiness</Text>
                            <Text style={styles.value}>{hardinessRange || 'Not available'}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.secretBox}>
                        <Text style={styles.secretTitle}>Description</Text>
                        {loading ? (
                          <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#4f9a44" />
                            <Text style={styles.secretText}>Fetching full plant details...</Text>
                          </View>
                        ) : (
                          <Text style={styles.secretText}>{displayValue(plant.description)}</Text>
                        )}
                      </View>

                      <View style={styles.secretBox}>
                        <Text style={styles.secretTitle}>Secret Fact</Text>
                        {isEditing ? (
                          <TextInput
                            multiline
                            style={styles.editArea}
                            value={editedPlant.secretfact}
                            onChangeText={(val) => setEditedPlant({ ...editedPlant, secretfact: val })}
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            blurOnSubmit={false}
                          />
                        ) : (
                          <Text style={styles.secretText}>{displayValue(plant.secretfact)}</Text>
                        )}
                      </View>

                      {plant.careGuides?.length ? (
                        <View style={styles.secretBox}>
                          <Text style={styles.secretTitle}>Care Guides</Text>
                          {plant.careGuides.slice(0, 4).map((guide) => (
                            <Text key={guide.id || `${guide.type}-${guide.section || ''}`} style={styles.secretText}>
                              {(guide.type || 'Guide') + ': '}{guide.description || guide.summary || 'No details available.'}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}
