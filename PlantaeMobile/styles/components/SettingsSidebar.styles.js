import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  sidebarHeaderContainer: {
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarHeaderTitle: { fontSize: 24, fontWeight: '600' },
  closeXApple: { fontSize: 28, opacity: 0.7 },
  menuGroup: { paddingHorizontal: 34 },
  menuItem: { paddingVertical: 12, marginVertical: 4, borderRadius: 12, borderBottomWidth: 1 },
  menuText: { fontSize: 16 },
  logoutText: { color: '#e53935', fontWeight: '600', marginTop: 20 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 4,
    borderBottomWidth: 1,
  },
});
