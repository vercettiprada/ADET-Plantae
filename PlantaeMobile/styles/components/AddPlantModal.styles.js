import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: { flex: 1 },
  content: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: '#8cc285',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    marginBottom: 20,
    backgroundColor: '#1a1f1a',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  candidateSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  candidateCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candidateCopy: {
    flex: 1,
    marginRight: 10,
  },
  candidateName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  candidateSpecies: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    marginTop: 4,
  },
  candidateConfidence: {
    color: '#8cc285',
    fontSize: 13,
    fontWeight: '700',
  },
  formSection: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#fff',
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
