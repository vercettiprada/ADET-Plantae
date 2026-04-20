import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cardContainer: {
    height: 410,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 22,
    backgroundColor: '#000',
  },
  plantImage: { width: '100%', height: '100%', position: 'absolute' },
  glassOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 22,
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginBottom: -10,
  },
  collectionPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  collectionPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    
  },
  speciesText: { color: 'rgba(255, 255, 255, 0.72)', fontSize: 13, fontStyle: 'italic' },
  commonName: { color: '#fff', fontSize: 26, fontWeight: '700', marginTop: 4 },
  detailText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  footerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  lightText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  openText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
});
