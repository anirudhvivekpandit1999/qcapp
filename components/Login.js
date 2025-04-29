import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  BackHandler,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import Background from './Background';
import Btn from './Btn';
import {darkRed} from './Constants';
import Field from './Field';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QC_API} from '../public/config';
import {useTheme} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.1);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.05);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const MAIN_CONTENT_HEIGHT = height * 0.81;
const logoWidth = width * 0.75;
const logoHeight = logoWidth * (100 / 500);

const Login = props => {
  const theme = useTheme();

  const [username, setusername] = useState('');
  const [password, setpassword] = useState('');

  const [isValidUser, setIsValidUser] = useState(true);
  const [isValidPass, setIsValidPass] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      // justifyContent: 'center',
    },
    logo: {
      width: logoWidth,
      height: logoHeight,
      marginTop: height * 0.06,
      marginBottom: height * 0.04,
    },
    content: {
      backgroundColor: theme.colors.background,
      // height: MAIN_CONTENT_HEIGHT,
      height: height,
      width: width * 1,
      borderTopLeftRadius: width * 0.05,
      borderTopRightRadius: width * 0.05,
      // marginTop: height * 0.02,
      padding: width * 0.05,
      alignItems: 'center',
      // justifyContent: 'center',
    },
    title: {
      color: theme.colors.primary,
      fontSize: HEADER_FONT_SIZE,
      fontWeight: 'bold',
      // marginTop: height * 0.02,
    },
    subtitle: {
      color: theme.colors.secondary,
      fontSize: SUBTITLE_FONT_SIZE,
      fontWeight: 'bold',
      marginBottom: height * 0.1,
    },
    errorText: {
      color: 'red',
      marginBottom: '2%',
    },
    forgotPasswordContainer: {
      width: '78%',
      paddingRight: '3%',
      marginBottom: '9%',
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    signupText: {
      color: 'grey',
      fontSize: INPUT_HEADER_FONT_SIZE - 2,
      fontWeight: 'bold',
    },
    signupLink: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: INPUT_HEADER_FONT_SIZE - 2,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      marginBottom: height * 0.25,
      alignItems: 'center',
    },
  });

  const LoginApi = async () => {
    if (username.trim() === '') {
      setIsValidUser(false);
      return;
    }

    if (password.trim() === '') {
      setIsValidPass(false);
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(
        'No Internet Connection! Please check your Network Settings.',
      );
      return;
    }

    try {
      console.log(QC_API+'QC/'+'UserLogin')
      setIsLoading(true);
      const response = await axios.post(QC_API + 'UserLogin', {
        emailId: username,
        password: password,
      });

      if (response.data.statusCode === '00') {
        let logindata = response.data.userName;
        AsyncStorage.setItem('logindata', logindata);
        props.navigation.navigate('Dashboard');
      } else {
        Alert.alert(response.data.statusMessage);
        setpassword('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Background>
      <View style={styles.container}>
        <Image
          source={require('../components/images/Companylogo.png')}
          style={styles.logo}
        />
        <View style={styles.content}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
          <Field
            placeholder="Email / Employee ID"
            onChangeText={text => {
              const alphanumericValue = text.replace(/[^a-zA-Z0-9-@.]/g, '');
              setusername(alphanumericValue);
              setIsValidUser(true);
            }}
            value={username}
            maxLength={30}
          />
          {!isValidUser && (
            <Text style={styles.errorText}>
              Please enter your Email / Employee ID
            </Text>
          )}

          <Field
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={text => {
              const alphanumericValue = text.replace(/[^a-zA-Z0-9-@_#!$]/g, '');
              setpassword(alphanumericValue);
              setIsValidPass(true);
            }}
            value={password}
            maxLength={15}
          />
          {!isValidPass && (
            <Text style={styles.errorText}>Please enter the password</Text>
          )}
          <View style={styles.forgotPasswordContainer}>
            {/* <Text style={styles.signupLink}>Forgot Password ?</Text> */}
          </View>
          <Btn
            textColor={theme.colors.secondary}
            bgColor={theme.colors.primary}
            btnLabel="Login"
            Press={LoginApi}
          />
          {isLoading && (
            <View style={styles.overlay}>
              {/* <ActivityIndicator size="large" color={darkRed} style={styles.loader} /> */}
              <Image
                source={require('../components/images/loader.gif')}
                style={styles.loader}
              />
            </View>
          )}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? {''}</Text>
            <TouchableOpacity
              onPress={() =>
                props.navigation.reset({
                  index: 0,
                  routes: [{name: 'Signup'}],
                })
              }>
              <Text style={styles.signupLink}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Background>
  );
};

export default Login;
