import { StyleSheet } from 'react-native';

export const EXPANDED_HEADER_HEIGHT = 194;
export const COLLAPSED_HEADER_HEIGHT = 96;
export const SEARCH_HEIGHT = 48;

export const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  brand: {
    fontFamily: 'AstonScript',
    color: '#2d5a27',
    includeFontPadding: false,
  },
  menuBtn: { padding: 5, gap: 5 },
  menuLine: { width: 26, height: 2.5, borderRadius: 2, marginVertical: 2.5 },
  searchWrap: {
    overflow: 'hidden',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  search: {
    height: SEARCH_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderRadius: 16,
    fontSize: 15,
    lineHeight: 18,
    textAlignVertical: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    paddingTop: EXPANDED_HEADER_HEIGHT + 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16 },
});
