import React, { useEffect } from 'react';
import { Text, View, ScrollView, BackHandler } from 'react-native';
import { styles } from '../styles/screens/AboutScreen.styles';

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
      <View style={styles.modalGrabber} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader]}>
            {toTitleCase('about')}
          </Text>
          <Text style={styles.bodyText}>
            A bridge between the digital and the organic. Plantae is a sanctuary for
            those who value the quiet intersection of technology and nature.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.customFont, styles.sectionHeader]}>
            {toTitleCase('our mission')}
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

export default AboutScreen;
