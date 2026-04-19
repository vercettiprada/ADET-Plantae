import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, Switch
} from 'react-native';
import { styles } from '../styles/screens/ProfileScreen.styles';

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
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: green }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={[styles.username, { color: text }]}>@{username || 'gardener'}</Text>
          <Text style={[styles.tagline, { color: muted }]}>Plant enthusiast</Text>
        </View>

        <View style={styles.statsRow}>
          {[['Plants', '11'], ['Days', '1'], ['Streak', '🌿']].map(([label, val]) => (
            <View key={label} style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.statVal, { color: green }]}>{val}</Text>
              <Text style={[styles.statLabel, { color: muted }]}>{label}</Text>
            </View>
          ))}
        </View>

        <Section title="PERSONAL INFO">
          <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" />
          <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Tell your garden story..." />
          <Field label="Username" value={username} placeholder={username} editable={false} />
        </Section>

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

        <Section title="ACCOUNT">
          <TouchableOpacity style={[styles.field, { borderBottomColor: 'transparent' }]} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete account</Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
