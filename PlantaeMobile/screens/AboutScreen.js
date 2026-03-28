import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const AboutScreen = ({ navigation, isDarkMode }) => {
  
  // Closing the modal returns you exactly to where the Settings were
  const handleDismiss = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleDismiss();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const dynamicBg = isDarkMode ? '#121212' : '#f1eeee';
  const dynamicText = isDarkMode ? '#e0e0e0' : '#4a4a4a';
  const dynamicHeader = isDarkMode ? '#fff' : '#2d5a27';
  const dynamicIcon = isDarkMode ? '#fff' : '#121212';

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      {/* Visual cue that it's a modal */}
      <View style={styles.modalGrabber} />

      <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleDismiss}>
        <Ionicons name="close-outline" size={32} color={dynamicIcon} />
        <Text style={[styles.backText, { color: dynamicIcon }]}>close</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader, { color: dynamicHeader }]}>
            {toTitleCase("about")}
          </Text>
          <Text style={[styles.bodyText, { color: dynamicText }]}>
            A bridge between the digital and the organic. Plantae is a sanctuary for 
            those who value the quiet intersection of technology and nature.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader, { color: dynamicHeader }]}>
            {toTitleCase("our mission")}
          </Text>
          <Text style={[styles.bodyText, { color: dynamicText }]}>
            To redefine plant care through a minimalist lens. We aim to provide 
            precision without sacrificing the "moody" visual energy of a curated space.
          </Text>
        </View>

        <View style={styles.designerCard}>
          <Text style={[styles.customFont, styles.sectionHeader, { color: dynamicHeader }]}>
            {toTitleCase("the designer's lens")}
          </Text>
          <Text style={[styles.bodyText, { color: dynamicText }]}>
            As an aspiring graphic designer, I view every interface as a canvas. 
            Moving away from generic UI toward an avant-garde experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalGrabber: { width: 40, height: 4, backgroundColor: '#888', borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, gap: 5 },
  backText: { fontSize: 18, fontWeight: '400' },
  scrollContent: { paddingHorizontal: 30, paddingTop: 10, paddingBottom: 80 },
  customFont: { fontFamily: 'AstonScript' },
  section: { marginBottom: 35 },
  sectionHeader: { fontSize: 42, lineHeight: 85, marginBottom: 0 },
  bodyText: { fontSize: 16, lineHeight: 24 },
  designerCard: { marginTop: 20, paddingTop: 30, borderTopWidth: 1, borderTopColor: '#dcdcdc', marginBottom: 40 },
});

export default AboutScreen;