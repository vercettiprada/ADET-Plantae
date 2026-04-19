import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cardContainer: { height: 400, borderRadius: 30, overflow: 'hidden', marginBottom: 20, backgroundColor: '#000' },
  plantImage: { width: '100%', height: '100%', position: 'absolute' },
  glassOverlay: { position: 'absolute', bottom: 0, width: '100%', padding: 25, borderTopWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  speciesText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontStyle: 'italic' },
  commonName: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: 4 },
  carePrompt: { marginTop: 15, paddingVertical: 6, paddingHorizontal: 15, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20, alignSelf: 'flex-start' },
  carePromptText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});
