import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// Utility to keep headers clean and consistent
const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const AboutScreen = ({ navigation, isDarkMode }) => {
  
  // Closing the modal returns the user to the Home/Settings layer
  const handleDismiss = () => {
    navigation.goBack();
  };

  // Android hardware back button support
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleDismiss();
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  // Dynamic Theme Colors
  const dynamicBg = isDarkMode ? '#121212' : '#f1eeee';
  const dynamicText = isDarkMode ? '#e0e0e0' : '#4a4a4a';
  const dynamicHeader = isDarkMode ? '#fff' : '#2d5a27';
  const dynamicIcon = isDarkMode ? '#fff' : '#121212';

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      {/* Visual cue for the slide-down modal gesture */}
      <View style={styles.modalGrabber} />

      <TouchableOpacity 
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={handleDismiss}
      >
        <Ionicons name="close-outline" size={32} color={dynamicIcon} />
        <Text style={[styles.backText, { color: dynamicIcon }]}>close</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader, { color: dynamicHeader }]}>
            {toTitleCase("minimalist")}
          </Text>
          <Text style={[styles.bodyText, { color: dynamicText }]}>
            Design is the priority. By focusing on architectural silhouettes and 
            intentional white space, we create an interface that feels like a 
            high-end magazine.
          </Text>
        </View>

        <View style={styles.designerCard}>
          <Text style={[styles.customFont, styles.sectionHeader, { color: dynamicHeader }]}>
            {toTitleCase("the designer's lens")}
          </Text>
          <Text style={[styles.bodyText, { color: dynamicText }]}>
            As an aspiring graphic designer, I view every interface as a canvas. 
            This drive moves away from generic UI toward an avant-garde experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Soft rounding at the top for the modal "sheet" look
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  modalGrabber: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    gap: 4,
  },
  backText: {
    fontSize: 18,
    fontWeight: '400',
    textTransform: 'lowercase',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 10,
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
    lineHeight: 85, // Prevents AstonScript from clipping
    marginBottom: 0,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  designerCard: {
    marginTop: 20,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    marginBottom: 40,
  },
});

export default AboutScreen;