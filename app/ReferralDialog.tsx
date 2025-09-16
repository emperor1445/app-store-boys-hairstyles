import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions, Share } from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const ReferralDialog: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {

    const checkFirstLaunch = async () => {
      const hasShown = await AsyncStorage.getItem('hasShownReferralDialog');
      if (!hasShown) {
        setVisible(true);
        await AsyncStorage.setItem('hasShownReferralDialog', 'true');
      }
    };

    checkFirstLaunch();
  }, []);

  const handleReferNow = async () => {
    try {
      const result = await Share.share({
        message: 'Hey! Check out this awesome app for hairstyles I found: https://apps.apple.com/app/idYOUR_APP_ID', // Replace with your actual app link
      });

      // Optionally check if the user actually shared
      // if (result.action === Share.sharedAction) {
      //   console.log('User shared the app');
      // }

      // Always close the dialog after share action completes
      setVisible(false);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
          <View style={styles.dialogContainer}>
            <LottieView
              source={require('../assets/json/gift.json')}
              autoPlay
              loop
              style={{ width: 150, height: 150 }}
            />
            <Text style={styles.title}>
              "Share this app with your fashion enthusiast friends and let them explore trendy hairstyles too!"
            </Text>

            <TouchableOpacity style={styles.referButton} onPress={handleReferNow}>
              <Text style={styles.referButtonText}>Refer Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={() => setVisible(false)}>
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default ReferralDialog;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  referButton: {
    backgroundColor: 'red',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  referButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  laterButton: {
    backgroundColor: 'orange',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  laterButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
