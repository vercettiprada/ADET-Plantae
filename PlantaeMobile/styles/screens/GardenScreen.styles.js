import { StyleSheet } from 'react-native';

export const EXPANDED_HEADER_HEIGHT = 217;
export const COLLAPSED_HEADER_HEIGHT = 104;
export const SEARCH_HEIGHT = 50;

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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    fontFamily: 'AstonScript',
    includeFontPadding: false,
  },
  welcomeLine: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  addPlantButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  addPlantButtonText: {
    color: '#244625',
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 28,
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
    paddingHorizontal: 18,
    paddingVertical: 0,
    borderRadius: 18,
    fontSize: 15,
    lineHeight: 18,
    textAlignVertical: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  listContent: {
    paddingTop: EXPANDED_HEADER_HEIGHT + 18,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  summaryCard: {
    marginBottom: 18,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  summaryText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  filterChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16 },
});
