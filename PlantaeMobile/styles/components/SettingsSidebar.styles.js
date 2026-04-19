import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  sidebarHeaderContainer: {
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarHeaderTitle: { fontSize: 24, fontWeight: '600', color: 'rgb(63,62,62)' },
  closeXApple: { fontSize: 28, color: 'rgb(112,112,112)', opacity: 0.7 },
  menuGroup: { paddingHorizontal: 34 },
  menuItem: { paddingVertical: 12, marginVertical: 4, borderRadius: 12 },
  menuText: { fontSize: 16, color: 'rgba(78,78,78,0.8)' },
  logoutText: { color: '#e53935', fontWeight: '600', marginTop: 20 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 4,
  },
});
