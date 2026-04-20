import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/components/AddPlantModal.styles';

export default function AddPlantModal({
  visible,
  draft,
  candidates = [],
  loading,
  saving,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(draft);

  useEffect(() => {
    setForm(draft);
  }, [draft]);

  if (!visible || !form) {
    return null;
  }

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <BlurView intensity={95} tint="dark" style={styles.overlay}>
        <SafeAreaView style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.headerText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSave(form)} disabled={loading || saving}>
              <Text style={[styles.headerText, styles.saveText]}>
                {saving ? 'Saving...' : 'Save Plant'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Image source={{ uri: form.imageUrl }} style={styles.previewImage} />

            <Text style={styles.title}>Confirm Plant</Text>
            <Text style={styles.subtitle}>
              Review the suggestion before adding it to your plant database.
            </Text>

            {candidates.length > 0 && (
              <View style={styles.candidateSection}>
                <Text style={styles.sectionTitle}>Suggested Matches</Text>
                {candidates.map((candidate) => (
                  <TouchableOpacity
                    key={`${candidate.species}-${candidate.confidence}`}
                    style={styles.candidateCard}
                    onPress={() => setForm((prev) => ({
                      ...prev,
                      name: candidate.name || prev.name,
                      species: candidate.species || prev.species,
                    }))}
                  >
                    <View style={styles.candidateCopy}>
                      <Text style={styles.candidateName}>{candidate.name || candidate.species}</Text>
                      <Text style={styles.candidateSpecies}>{candidate.species}</Text>
                    </View>
                    <Text style={styles.candidateConfidence}>{candidate.confidence}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Plant Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Common name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={form.name}
                onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Species"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={form.species}
                onChangeText={(value) => setForm((prev) => ({ ...prev, species: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Light needs"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={form.light}
                onChangeText={(value) => setForm((prev) => ({ ...prev, light: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Water needs"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={form.water}
                onChangeText={(value) => setForm((prev) => ({ ...prev, water: value }))}
              />
              <TextInput
                multiline
                style={[styles.input, styles.textArea]}
                placeholder="Care notes or what the API got right/wrong"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={form.secretfact}
                onChangeText={(value) => setForm((prev) => ({ ...prev, secretfact: value }))}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}
