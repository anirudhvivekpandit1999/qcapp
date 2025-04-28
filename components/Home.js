import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import Btn from './Btn';
import {useTheme} from 'react-native-paper';

const {width, height} = Dimensions.get('window');
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const logoWidth = width * 0.85; // Adjust the multiplier as needed
const logoHeight = logoWidth * (100 / 500); // Assuming the original aspect ratio is 500:100

const appVersion = '1.0.0';

const Home = props => {
  const theme = useTheme();

  const logoOpacity = useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    label: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: windowHeight * 0.1,
    },
    subtitle: {
      // color: theme.colors.secondary,
      color: 'white',
      fontSize: windowWidth * 0.07,
      fontWeight: 'bold',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: logoWidth,
      height: logoHeight,
      // marginTop: height * 0.01,
      marginBottom: height * 0.01,
      alignItems: 'center',
      justifyContent: 'center',
    },
    version: {
      position: 'absolute',
      top: windowHeight * 0.945,
      right: 0,
      color: 'grey',
      fontSize: 12,
      fontWeight: 'bold',
    },
    trademark: {
      flex: 1,
      position: 'absolute',
      top: windowHeight * 0.97,
      color: 'grey',
      fontSize: 10,
      fontWeight: 'bold',
    },
    animatedLogo: {
      width: logoWidth,
      height: logoHeight,
      marginBottom: height * 0.01,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0, // Initial opacity set to 0 for animation
    },
    container: {
      flex: 1,
    },
    image: {
      height: '100%',
    },
    content: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
  });

  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 2000,
      easing: Easing.easeInOut,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./images/hd.jpg')}
        style={styles.image}
      />
      <View style={styles.content}>
        <SafeAreaView>
          <View style={styles.label}>
            <Animated.Image
              source={require('../components/images/Companylogo.png')}
              style={[styles.logo, styles.animatedLogo, {opacity: logoOpacity}]}
            />
            <Animated.Text style={[styles.subtitle, {opacity: logoOpacity}]}>
              Quality Control
            </Animated.Text>
            <View style={{marginTop: windowHeight * 0.57}}>
              <Btn
                bgColor={theme.colors.secondary}
                textColor={theme.colors.primary}
                btnLabel="Login"
                Press={() => props.navigation.navigate('Login')}
              />
              <Btn
                bgColor={theme.colors.primary}
                textColor={theme.colors.secondary}
                btnLabel="Signup"
                Press={() => props.navigation.navigate('Signup')}
              />
            </View>
            <Animated.Text style={[styles.version, {opacity: logoOpacity}]}>
              Version {appVersion}
            </Animated.Text>
            <Animated.Text style={[styles.trademark, {opacity: logoOpacity}]}>
              ©2023, All Rights Reserved To Technocrafts Switchgears Pvt. Ltd.
            </Animated.Text>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default Home;
