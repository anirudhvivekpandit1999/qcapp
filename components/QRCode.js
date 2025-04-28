import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Button,
} from 'react-native';
import Background from './Background';
import {darkRed, red} from './Constants';
import Btn from './Btn';
import {Dimensions, BackHandler, Alert, Platform} from 'react-native';
import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.06);
const MAIN_CONTENT_HEIGHT = height * 0.89;
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const logoWidth = width * 0.8;
const logoHeight = logoWidth;
const logoMarginTop = height * 0.1;
const buttonWidth = width * 0.5;

const QRCode = props => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    background: {
      flex: 1,
      alignItems: 'center',
    },
    header: {
      // color: theme.colors.secondary,
      color: 'white',
      fontSize: HEADER_FONT_SIZE,
      fontWeight: 'bold',
      // marginTop: height * 0.01,
      // marginBottom: height * 0.03,
    },
    subtitle: {
      // color: theme.colors.secondary,
      color: 'white',
      fontSize: SUBTITLE_FONT_SIZE,
      fontWeight: 'bold',
      marginBottom: height * 0.02,
    },
    mainContent: {
      backgroundColor: theme.colors.background,
      height: MAIN_CONTENT_HEIGHT,
      width: width * 1,
      padding: width * 0.01,
      alignItems: 'center',
      marginBottom: height * 0.05, // Add margin to create space between table and buttons
    },
    scrollView: {
      width: '100%',
      marginBottom: height * 0.01,
      // marginTop: height * 0.03,
    },
    logoutButton: {
      // position: 'absolute',
      top: height * 0.015,
      left: width * 0.3,
    },
    nextButton: {
      position: 'absolute',
      right: width * 0.08,
      bottom: height * 0.01,
    },
    nextButtonText: {
      color: darkRed,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
      paddingBottom: height * 0.02,
    },
    button: {
      borderRadius: 100,
      alignItems: 'center',
      paddingVertical: 5,
      marginVertical: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      // marginTop: height * 0.01, // Adjust the margin for the button container
    },
  });

  const handleBackPress = () => {
    Alert.alert(
      'Confirmation',
      'Do you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            AsyncStorage.clear();
            props.navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            });
          },
        },
      ],
      {cancelable: true},
    );

    return true; // Prevents the default back button action
  };

  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  const [imageUrl, setImageUrl] = useState(null);
  const [kioskNo, setkioskNo] = useState('');

  const retrieveKioskNo = async () => {
    try {
      const kiosksrno = await AsyncStorage.getItem('kiosksrno');
      setkioskNo(kiosksrno);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const retrieveData = async () => {
    try {
      const qrurl = await AsyncStorage.getItem('qrurl');
      setImageUrl(qrurl);
      console.log('Image URL:', imageUrl);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    retrieveData();
    retrieveKioskNo();
  }, []);

  const downloadImage = async () => {
    if (!imageUrl) {
      console.error('Image URL is null or undefined');
      return;
    }

    const downloadsDir =
      Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : undefined;
    const fileName = `${kioskNo}_QCCode.jpeg`;
    const imagePath = `${downloadsDir}/${fileName}`;
    const imageOptions = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: imagePath,
        description: 'Downloading QR Code...',
      },
    };

    try {
      const res = await RNFetchBlob.config(imageOptions).fetch('GET', imageUrl);
      console.log('Image downloaded! Path:', res.path());
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>QR Code</Text>
          <Text style={styles.subtitle}>Scan the QR code to view the PDF</Text>
          <View style={styles.mainContent}>
            {/* <View style={styles.logoutButton}>
          <TouchableOpacity onPress={() => handleBackPress()}>
            <Text style={styles.nextButtonText}>Logout</Text>
          </TouchableOpacity>
          </View> */}
            <ScrollView style={styles.scrollView}>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  // source={{ uri: 'http://20.197.56.56:930/QCApp/1.Jpeg' }}
                  source={{uri: imageUrl}}
                  style={{
                    marginTop: logoMarginTop,
                    width: logoWidth,
                    height: logoHeight,
                  }}
                />
              </View>
            </ScrollView>
            <View style={{marginlefft: 0}}>
              {/* <TouchableOpacity onPress={() => props.navigation.navigate('Dashboard')}>
                <Text style={{ color: darkRed, fontWeight: 'bold', fontSize: 30 }}>Previous</Text>
            </TouchableOpacity> */}
            </View>

            <Button
              title="Download Image"
              titleStyle={{color: theme.colors.primary}}
              onPress={downloadImage}
              color={darkRed}
            />

            <TouchableOpacity
              onPress={() => {
                // AsyncStorage.clear();
                AsyncStorage.removeItem('qrurl');
                AsyncStorage.removeItem('filepath');
                AsyncStorage.removeItem('filename');
                props.navigation.reset({
                  index: 0,
                  routes: [{name: 'Form'}],
                });
              }}
              style={[
                styles.button,
                {backgroundColor: theme.colors.primary, width: buttonWidth},
              ]}>
              <Text
                style={{
                  color: theme.colors.secondary,
                  fontSize: 25,
                  fontWeight: 'bold',
                }}>
                FINISH
              </Text>
            </TouchableOpacity>
            {/* <Btn  textColor="white" bgColor={darkRed}  btnLabel="FINISH"
          Press={() => { 
              // downloadImage();
              // AsyncStorage.clear();
              AsyncStorage.removeItem('qrurl');
              AsyncStorage.removeItem('filepath');
              AsyncStorage.removeItem('filename');
              props.navigation.reset({
                index: 0,
                routes: [{ name: 'Form' }],
              })
              // uploadFile(fileUri);
          }}
          /> */}
          </View>
        </View>
      </Background>
    </View>
  );
};

export default QRCode;
