import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#f1eeee',
  },
  modalGrabber: {
    width: 40,
    height: 4,
    backgroundColor: '#888',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 80,
  },
  customFont: {
    fontFamily: 'AstonScript',
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    fontSize: 42,
    lineHeight: 85,
    marginBottom: 0,
    color: '#2d5a27',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
  },
  designerCard: {
    marginTop: 20,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#dcdcdc',
    marginBottom: 40,
  },
});
