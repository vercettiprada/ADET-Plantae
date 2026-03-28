import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, BackHandler } from 'react-native';

const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const AboutScreen = ({ navigation }) => {
  
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

  return (
    <View style={styles.container}>
      {/* Visual cue for swipe-to-close modal */}
      <View style={styles.modalGrabber} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        <View style={styles.designerCard}>
          <Text style={[styles.customFont, styles.sectionHeader]}>
            {toTitleCase("the designer's lens")}
          </Text>
          <Text style={styles.bodyText}>
            As an aspiring graphic designer, I view every interface as a canvas. 
            Moving away from generic UI toward an avant-garde experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    backgroundColor: '#f1eeee' 
  },
  modalGrabber: { 
    width: 40, 
    height: 4, 
    backgroundColor: '#888', 
    borderRadius: 2, 
    alignSelf: 'center', 
    marginTop: 12 
  },
  scrollContent: { 
    paddingHorizontal: 30, 
    paddingTop: 40, 
    paddingBottom: 80 
  },
  customFont: { 
    fontFamily: 'AstonScript' 
  },
  section: { 
    marginBottom: 35 
  },
  sectionHeader: { 
    fontSize: 42, 
    lineHeight: 85, 
    marginBottom: 0, 
    color: '#2d5a27' 
  },
  bodyText: { 
    fontSize: 16, 
    lineHeight: 24, 
    color: '#4a4a4a' 
  },
  designerCard: { 
    marginTop: 20, 
    paddingTop: 30, 
    borderTopWidth: 1, 
    borderTopColor: '#dcdcdc', 
    marginBottom: 40 
  },
});

export default AboutScreen;