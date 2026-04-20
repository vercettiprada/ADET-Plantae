import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { styles } from '../styles/screens/ProfileScreen.styles';

export default function ProfileScreen({
  navigation,
  isDarkMode,
  profile,
  plantCount,
  onSaveProfile,
  onDeleteAccount,
}) {
  const [displayName, setDisplayName] = useState(profile?.firstName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.firstName || '');
    setEmail(profile?.email || '');
  }, [profile]);

  const bg = isDarkMode ? '#121212' : '#f1eeee';
  const card = isDarkMode ? '#1e1e1e' : '#fff';
  const text = isDarkMode ? '#e0e0e0' : '#2d2d2d';
  const muted = isDarkMode ? '#888' : '#aaa';
  const green = isDarkMode ? '#7fb07b' : '#2d5a27';
  const border = isDarkMode ? '#333' : '#ebebeb';
  const inputBg = isDarkMode ? '#161a16' : '#f8f8f6';

  const initials = useMemo(() => {
    const source = displayName || profile?.username || 'U';
    return source.slice(0, 2).toUpperCase();
  }, [displayName, profile?.username]);

  const handleSave = async () => {
    if (!editing || saving) {
      return;
    }

    setSaving(true);
    const saved = await onSaveProfile({
      firstName: displayName.trim(),
      email: email.trim(),
    });

    setSaving(false);

    if (saved) {
      setEditing(false);
      Alert.alert('Saved', 'Profile updated successfully.');
    }
  };

  const confirmDeleteAccount = () => {
    if (deleting) {
      return;
    }

    Alert.alert(
      'Delete Account',
      'This permanently deletes your account. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const deleted = await onDeleteAccount();
            setDeleting(false);

            if (deleted) {
              navigation.popToTop();
            }
          },
        },
      ]
    );
  };

  const Section = ({ title, children }) => (
    <View style={[styles.section, { backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.sectionLabel, { color: muted }]}>{title}</Text>
      {children}
    </View>
  );

  const Field = ({ label, value, onChangeText, placeholder, editable = true, keyboardType = 'default' }) => (
    <View style={[styles.field, { borderBottomColor: border }]}>
      <Text style={[styles.fieldLabel, { color: muted }]}>{label}</Text>
      {editing && editable ? (
        <TextInput
          style={[styles.fieldInput, { color: text, backgroundColor: inputBg, borderColor: border }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={muted}
          autoCapitalize="none"
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: value ? text : muted }]}>
          {value || placeholder}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: green }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Profile</Text>
        <TouchableOpacity onPress={editing ? handleSave : () => setEditing(true)} disabled={saving || deleting}>
          {saving ? (
            <ActivityIndicator size="small" color={green} />
          ) : (
            <Text style={[styles.editBtn, { color: green }]}>{editing ? 'Save' : 'Edit'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        style={{ backgroundColor: bg }}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: green }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={[styles.username, { color: text }]}>@{profile?.username || 'gardener'}</Text>
          <Text style={[styles.tagline, { color: muted }]}>
            {displayName ? `Welcome back, ${displayName}.` : 'Keep your sanctuary in sync.'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.statVal, { color: green }]}>{plantCount}</Text>
            <Text style={[styles.statLabel, { color: muted }]}>Plants</Text>
          </View>
        </View>

        <Section title="PERSONAL INFO">
          <Field
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
          />
          <Field
            label="Username"
            value={profile?.username || ''}
            placeholder="username"
            editable={false}
          />
        </Section>

        <Section title="ACCOUNT">
          <TouchableOpacity
            style={[styles.field, { borderBottomColor: 'transparent' }]}
            onPress={confirmDeleteAccount}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#e53935" />
            ) : (
              <Text style={styles.deleteText}>Delete account</Text>
            )}
          </TouchableOpacity>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
