import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, Switch
} from 'react-native';

export default function ProfileScreen({ navigation, isDarkMode, username, onLogout }) {
  const [displayName, setDisplayName] = useState(username || '');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [editing, setEditing] = useState(false);

  const bg = isDarkMode ? '#121212' : '#f1eeee';
  const card = isDarkMode ? '#1e1e1e' : '#fff';
  const text = isDarkMode ? '#e0e0e0' : '#2d2d2d';
  const muted = isDarkMode ? '#888' : '#aaa';
  const green = '#2d5a27';
  const border = isDarkMode ? '#333' : '#ebebeb';

  const initials = (displayName || 'U').slice(0, 2).toUpperCase();

  const handleSave = () => {
    setEditing(false);
    Alert.alert('Saved', 'Profile updated successfully.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onLogout() },
      ]
    );
  };

  const Section = ({ title, children }) => (
    <View style={[styles.section, { backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.sectionLabel, { color: muted }]}>{title}</Text>
      {children}
    </View>
  );

  const Field = ({ label, value, onChangeText, placeholder, editable = true }) => (
    <View style={[styles.field, { borderBottomColor: border }]}>
      <Text style={[styles.fieldLabel, { color: muted }]}>{label}</Text>
      {editing && editable ? (
        <TextInput
          style={[styles.fieldInput, { color: text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={muted}
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => navigation.closeDrawer()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: green }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Profile</Text>
        <TouchableOpacity onPress={editing ? handleSave : () => setEditing(true)}>
          <Text style={[styles.editBtn, { color: green }]}>{editing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: green }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={[styles.username, { color: text }]}>@{username || 'gardener'}</Text>
          <Text style={[styles.tagline, { color: muted }]}>Plant enthusiast</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[['Plants', '11'], ['Days', '1'], ['Streak', '🌿']].map(([label, val]) => (
            <View key={label} style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.statVal, { color: green }]}>{val}</Text>
              <Text style={[styles.statLabel, { color: muted }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Personal info */}
        <Section title="PERSONAL INFO">
          <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" />
          <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Tell your garden story..." />
          <Field label="Username" value={username} placeholder={username} editable={false} />
        </Section>

        {/* Preferences */}
        <Section title="PREFERENCES">
          <View style={[styles.field, { borderBottomColor: border }]}>
            <Text style={[styles.fieldLabel, { color: text }]}>Push notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: green, false: '#ccc' }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.field, { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.fieldLabel, { color: text }]}>Garden reminders</Text>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ true: green, false: '#ccc' }}
              thumbColor="#fff"
            />
          </View>
        </Section>

        {/* Danger zone */}
        <Section title="ACCOUNT">
          <TouchableOpacity style={[styles.field, { borderBottomColor: 'transparent' }]} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete account</Text>
          </TouchableOpacity>
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, fontWeight: '300' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  editBtn: { fontSize: 16, fontWeight: '500' },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarInitials: { color: '#fff', fontSize: 30, fontWeight: '600' },
  username: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  tagline: { fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRadius: 14, borderWidth: 0.5,
  },
  statVal: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  section: {
    borderRadius: 14, borderWidth: 0.5, marginBottom: 16,
    paddingHorizontal: 16, overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    paddingTop: 12, paddingBottom: 6,
  },
  field: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, borderBottomWidth: 0.5,
  },
  fieldLabel: { fontSize: 15, flex: 1 },
  fieldValue: { fontSize: 15, flex: 1.5, textAlign: 'right' },
  fieldInput: { fontSize: 15, flex: 1.5, textAlign: 'right' },
  deleteText: { fontSize: 15, color: '#e53935', paddingVertical: 2 },
});
