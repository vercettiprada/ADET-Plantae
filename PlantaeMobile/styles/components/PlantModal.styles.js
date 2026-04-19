import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: { flex: 1 },
  modalContent: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  headerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  heroImage: { width: '90%', height: 300, borderRadius: 30, alignSelf: 'center' },
  infoPadding: { padding: 25 },
  species: { color: '#4f9a44', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  name: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 15 },
  careGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  careBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 20, width: '48%' },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  value: { color: '#fff', fontSize: 14, fontWeight: '600' },
  editInput: { color: '#fff', borderBottomWidth: 1, borderColor: '#4f9a44', marginTop: 5, paddingVertical: 5 },
  secretBox: { backgroundColor: '#111', padding: 20, borderRadius: 25, borderLeftWidth: 4, borderLeftColor: '#4f9a44' },
  secretTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  secretText: { color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
  editArea: { color: '#fff', fontSize: 14, lineHeight: 22, minHeight: 60, textAlignVertical: 'top' },
});
