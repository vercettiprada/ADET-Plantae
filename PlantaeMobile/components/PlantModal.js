import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, Image, TouchableOpacity,
  ScrollView, TextInput, SafeAreaView, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/PlantModal.styles';

export default function PlantModal({ plant, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState(plant);

  useEffect(() => {
    if (plant) setEditedPlant(plant);
  }, [plant]);

  const handleSave = () => {
    onSave(editedPlant);
    setIsEditing(false);
  };

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
                <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
                  <Text style={[styles.headerText, { color: '#4f9a44' }]}>
                    {isEditing ? 'Save' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
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
                              <Text style={styles.value}>{plant.light}</Text>
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
                              <Text style={styles.value}>{plant.water}</Text>
                            )}
                          </View>
                        </View>
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
                          <Text style={styles.secretText}>{plant.secretfact}</Text>
                        )}
                      </View>
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
