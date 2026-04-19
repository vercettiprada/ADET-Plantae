import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1eeee' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, marginBottom: 50 },
  logo: { fontSize: 48, fontFamily: 'AstonScript', color: '#2d5a27', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  button: { backgroundColor: '#2d5a27', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toggleLink: { marginTop: 25 },
  toggleText: { textAlign: 'center', fontSize: 14 },
  dimText: { color: '#aaa', fontWeight: '400' },
  highlightText: { color: '#2d5a27bd', fontWeight: '700' },
});
