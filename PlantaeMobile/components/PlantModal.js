import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, Image, TouchableOpacity,
  ScrollView, TextInput, SafeAreaView, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/PlantModal.styles.js';
import { buildHistoryEntry, createEmptyCareProfile, formatCalendarDate } from '../src/care';

export default function PlantModal({ plant, onClose, onSave, onUpdatePlantCare, onFocusSavedPlants }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState(plant);
  const [careDraft, setCareDraft] = useState(plant?.care);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plant) {
      setEditedPlant(plant);
      setCareDraft({ ...createEmptyCareProfile(), ...(plant.care || {}) });
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

    if (saved && onUpdatePlantCare) {
      onUpdatePlantCare(plant.id, {
        cadenceDays: careDraft.cadenceDays,
        notes: careDraft.notes,
        inSanctuary: careDraft.inSanctuary,
      });
      setIsEditing(false);
      onClose();
    }

    setIsSaving(false);
  };

  const toggleSanctuary = () => {
    if (!plant || !onUpdatePlantCare) {
      return;
    }

    const nextInSanctuary = !careDraft?.inSanctuary;
    const nextDraft = { ...careDraft, inSanctuary: nextInSanctuary };
    setCareDraft(nextDraft);
    onUpdatePlantCare(plant.id, {
      inSanctuary: nextInSanctuary,
      appendHistory: buildHistoryEntry(nextInSanctuary ? 'saved' : 'removed', nextInSanctuary ? 'Added to saved plants' : 'Removed from saved plants'),
    });

    if (nextInSanctuary) {
      onFocusSavedPlants?.();
      onClose?.();
    }
  };

  const markWatered = () => {
    if (!plant || !onUpdatePlantCare) {
      return;
    }

    const wateredAt = new Date().toISOString();
    const nextDraft = { ...careDraft, inSanctuary: true, lastWateredAt: wateredAt };
    setCareDraft(nextDraft);
    onUpdatePlantCare(plant.id, {
      inSanctuary: true,
      lastWateredAt: wateredAt,
      appendHistory: buildHistoryEntry('watered', 'Marked plant as watered'),
    });
    onFocusSavedPlants?.();
    onClose?.();
  };

  const changeCadence = (delta) => {
    const nextValue = Math.min(21, Math.max(2, (careDraft?.cadenceDays || 7) + delta));
    const nextDraft = { ...careDraft, cadenceDays: nextValue };
    setCareDraft(nextDraft);
    onUpdatePlantCare?.(plant.id, { cadenceDays: nextValue });
  };

  const saveNotes = () => {
    onUpdatePlantCare?.(plant.id, {
      notes: careDraft.notes,
      appendHistory: buildHistoryEntry('note', 'Updated care notes'),
    });
  };

  if (!plant) {
    return null;
  }

  const history = careDraft?.history || [];

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
                  <Text style={[styles.headerText, { color: '#8cc285' }]}>
                    {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Image source={{ uri: plant.imageUrl }} style={styles.heroImage} />

                <View style={styles.infoPadding}>
                  <Text style={styles.species}>{plant.species}</Text>
                  <Text style={styles.name}>{plant.name}</Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionButton, styles.primaryAction]} onPress={toggleSanctuary}>
                      <Text style={styles.primaryActionText}>
                        {careDraft?.inSanctuary ? 'Remove from Saved Plants' : 'Save Plant'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={markWatered}>
                      <Text style={styles.actionButtonText}>Mark Watered</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sanctuaryCard}>
                    <Text style={styles.sectionHeader}>Watering Schedule</Text>
                    <View style={styles.ritualMetaRow}>
                      <View style={styles.ritualMetric}>
                        <Text style={styles.label}>Last Watered</Text>
                        <Text style={styles.value}>{formatCalendarDate(careDraft?.lastWateredAt)}</Text>
                      </View>
                      <View style={styles.ritualMetric}>
                        <Text style={styles.label}>Water Every</Text>
                        <View style={styles.cadenceControls}>
                          <TouchableOpacity style={styles.cadenceButton} onPress={() => changeCadence(-1)}>
                            <Text style={styles.cadenceButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.value}>{careDraft?.cadenceDays || 7} days</Text>
                          <TouchableOpacity style={styles.cadenceButton} onPress={() => changeCadence(1)}>
                            <Text style={styles.cadenceButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

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
                    <Text style={styles.secretTitle}>Care Notes</Text>
                    <TextInput
                      multiline
                      style={styles.editArea}
                      value={careDraft?.notes || ''}
                      onChangeText={(val) => setCareDraft((prev) => ({ ...prev, notes: val }))}
                      placeholder="Write simple notes like where you placed it or when leaves changed..."
                      placeholderTextColor="rgba(255,255,255,0.34)"
                      blurOnSubmit={false}
                      onEndEditing={saveNotes}
                    />
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

                  <View style={styles.timelineCard}>
                    <Text style={styles.sectionHeader}>Care History</Text>
                    {history.length === 0 ? (
                      <Text style={styles.timelineEmpty}>No updates yet. Water this plant, save it, or write a note to start its history.</Text>
                    ) : history.map((entry) => (
                      <View key={entry.id} style={styles.timelineItem}>
                        <Text style={styles.timelineType}>{entry.type}</Text>
                        <Text style={styles.timelineDetail}>{entry.detail || 'Plant activity recorded'}</Text>
                        <Text style={styles.timelineDate}>{formatCalendarDate(entry.at)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}
