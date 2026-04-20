import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: '#d9ded7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  species: {
    marginTop: 3,
    fontSize: 13,
  },
  meta: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: '600',
  },
  schedule: {
    marginTop: 4,
    fontSize: 12,
  },
});
