import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// Helper function to capitalize the first letter of every word
const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const AboutScreen = ({ onBack }) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack?.();
      return true;
    });
    return () => backHandler.remove();
  }, [onBack]);

  return (
    <View style={styles.container}>
      <View style={styles.statusBarSpacer} />

      <TouchableOpacity 
        style={styles.backButton}
        activeOpacity={0.7}
        hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }} 
        onPress={onBack}
      >
        <Ionicons name="arrow-back-outline" size={26} color="#121212" />
        <Text style={styles.backText}>back</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader]}>
            {toTitleCase("about")}
          </Text>
          <Text style={styles.bodyText}>
            A bridge between the digital and the organic. Plantae is a sanctuary for 
            those who value the quiet intersection of technology and nature.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader]}>
            {toTitleCase("our mission")}
          </Text>
          <Text style={styles.bodyText}>
            To redefine plant care through a minimalist lens. We aim to provide 
            precision without sacrificing the "moody" visual energy of a curated space.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader]}>
            {toTitleCase("minimalist")}
          </Text>
          <Text style={styles.bodyText}>
            Design is the priority. By focusing on architectural silhouettes and 
            intentional white space, we create an interface that feels like a 
            high-end magazine.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader]}>
            {toTitleCase("smart care")}
          </Text>
          <Text style={styles.bodyText}>
            Integration of ESP32 hardware and cloud-based tracking ensures your 
            environment stays optimal. Precision meets aesthetic.
          </Text>
        </View>

        <View style={styles.designerCard}>
          <Text style={[styles.customFont, styles.sectionHeader]}>
            {toTitleCase("the designer's lens")}
          </Text>
          <Text style={styles.bodyText}>
            As an aspiring graphic designer, I view every interface as a canvas. 
            This drive to design appealingly moves away from generic UI toward 
            an avant-garde, "editorial niche" experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1eeee',
  },
  statusBarSpacer: {
    height: 60,
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 10,
    zIndex: 9999,
    gap: 8,
  },
  backText: {
    fontSize: 18,
    color: '#121212',
    fontWeight: '400',
     // "BACK" in all caps looks more editorial
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 80,
  },
  customFont: {
    fontFamily: 'AstonScript', 
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    fontSize: 40, // BIGGER size as requested
    lineHeight: 100, // Added line height so characters don't clip
    color: '#2d5a27',
    marginBottom: 0,
    // REMOVED textTransform: 'lowercase' to allow capitalization function to work
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

export default AboutScreen;