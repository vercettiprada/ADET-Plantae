import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, Image, TouchableOpacity,
  ScrollView, TextInput, SafeAreaView, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/PlantModal.styles';
import { api } from '../src/api';

const displayValue = (value, fallback = 'Not available') => {
  const normalized = typeof value === 'string' ? value.trim() : value;
  return normalized ? normalized : fallback;
};

export default function PlantModal({ plant, onClose, onSave, onDelete, loading = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState(plant);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    if (plant) {
      setEditedPlant(plant);
      setIsEditing(Boolean(plant.isNew));
      setIsSaving(false);
      setIsDeleting(false);
      setImageLoadFailed(false);
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

  const handleCancel = () => {
    if (plant?.isNew) {
      onClose();
      return;
    }

    setEditedPlant(plant);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!onDelete || !plant?.id || isDeleting) {
      return;
    }

    setIsDeleting(true);
    const deleted = await onDelete(plant.id);

    if (deleted) {
      onClose();
    }

    setIsDeleting(false);
  };

  const updateField = (field, value) => {
    setEditedPlant((prev) => ({ ...prev, [field]: value }));
  };

  const hardinessRange = plant?.hardinessMin && plant?.hardinessMax
    ? `${plant.hardinessMin} - ${plant.hardinessMax}`
    : '';
  const fallbackImage = api.getFallbackPlantImage(editedPlant || plant);
  const imageUrl = imageLoadFailed ? fallbackImage : (editedPlant?.imageUrl || plant?.imageUrl || fallbackImage);

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
                <View style={styles.headerActions}>
                  {isEditing ? (
                    <TouchableOpacity onPress={handleCancel} disabled={isSaving || isDeleting}>
                      <Text style={styles.headerText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : null}
                  {!plant?.isNew && !isEditing ? (
                    <TouchableOpacity onPress={handleDelete} disabled={isDeleting || isSaving}>
                      <Text style={[styles.headerText, styles.deleteText]}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    onPress={isEditing ? handleSave : () => setIsEditing(true)}
                    disabled={isSaving || isDeleting}
                  >
                    <Text style={[styles.headerText, { color: '#4f9a44' }]}>
                      {isEditing ? (isSaving ? 'Saving...' : plant?.isNew ? 'Create' : 'Save') : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {plant && (
                  <>
                    <Image source={{ uri: imageUrl }} style={styles.heroImage} onError={() => setImageLoadFailed(true)} />

                    <View style={styles.infoPadding}>
                      {isEditing ? (
                        <View style={styles.titleForm}>
                          <TextInput
                            style={styles.editTitle}
                            value={editedPlant?.name || ''}
                            onChangeText={(val) => updateField('name', val)}
                            placeholder="Plant name"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                          />
                          <TextInput
                            style={styles.editSpecies}
                            value={editedPlant?.species || ''}
                            onChangeText={(val) => updateField('species', val)}
                            placeholder="Species"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                          />
                          <TextInput
                            style={styles.editSpecies}
                            value={editedPlant?.imageUrl || ''}
                            onChangeText={(val) => updateField('imageUrl', val)}
                            placeholder="Image URL"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            autoCapitalize="none"
                          />
                        </View>
                      ) : (
                        <>
                          <Text style={styles.species}>{plant.species}</Text>
                          <Text style={styles.name}>{plant.name}</Text>
                        </>
                      )}

                      <View>
                        <Text style={styles.sectionHeader}>Plant Care & Info</Text>
                        <View style={styles.careGrid}>
                          <View style={styles.careBox}>
                            <Text style={styles.label}>Light</Text>
                            {isEditing ? (
                              <TextInput
                                style={styles.editInput}
                                value={editedPlant?.light || ''}
                                onChangeText={(val) => updateField('light', val)}
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
                                value={editedPlant?.water || ''}
                                onChangeText={(val) => updateField('water', val)}
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
                        {isEditing ? (
                          <TextInput
                            multiline
                            style={styles.editArea}
                            value={editedPlant?.description || ''}
                            onChangeText={(val) => updateField('description', val)}
                            placeholder="Short plant description"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            blurOnSubmit={false}
                          />
                        ) : loading ? (
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
                            value={editedPlant?.secretfact || ''}
                            onChangeText={(val) => updateField('secretfact', val)}
                            placeholder="A memorable care note or fact"
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
