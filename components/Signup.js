import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Touchable,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import axios from 'axios';
import Background from './Background';
import {ProgressBar} from 'react-native-paper';
import Btn from './Btn';
import {darkRed} from './Constants';
import Field from './Field';
import {QC_API} from '../public/config';
import {useTheme} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import zxcvbn from 'zxcvbn';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.1);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.05);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const TEXT_HEADER_FONT_SIZE = Math.round(width * 0.035) - 4;
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const MAIN_CONTENT_HEIGHT = height * 0.9085;

const Signup = props => {
  const theme = useTheme();

  const [userId, setuserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [isValidUserID, setisValidUserID] = useState(true);
  const [isValidFirstName, setisValidFirstName] = useState(true);
  const [isValidLastName, setisValidLastName] = useState(true);
  const [isValidEmail, setisValidEmail] = useState(true);
  const [isValidContactNumber, setisValidContactNumber] = useState(true);
  const [isValidPassword, setisValidPassword] = useState(true);
  const [isValidConfirmPassword, setisValidConfirmPassword] = useState(true);

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTypingPassword, setIsTypingPassword] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    background: {
      flex: 1,
      alignItems: 'center',
    },
    header: {
      color: theme.colors.secondary,
      fontSize: HEADER_FONT_SIZE,
      fontWeight: 'bold',
      // marginTop: height * 0.02,
    },
    signuptitle: {
      color: theme.colors.primary,
      fontSize: SUBTITLE_FONT_SIZE,
      fontWeight: 'bold',
      marginBottom: height * 0.03,
    },
    mainContent: {
      backgroundColor: theme.colors.background,
      // height: MAIN_CONTENT_HEIGHT,
      height: height * 0.93,
      width: width * 1,
      borderTopLeftRadius: width * 0.05,
      borderTopRightRadius: width * 0.05,
      padding: width * 0.05,
      alignItems: 'center',
    },
    logoutButton: {
      position: 'absolute',
      top: height * 0.015,
      right: width * 0.08,
    },
    scrollView: {
      width: '100%',
      marginBottom: height * 0.01,
      // marginTop: height * 0.03,
    },
    fields: {
      display: 'flex',
      flexDirection: 'row',
      width: '78%',
      justifyContent: 'center',
      marginTop: height * 0.06,
      marginBottom: height * 0.001,
    },
    inputheader: {
      color: theme.colors.primary,
      fontSize: INPUT_HEADER_FONT_SIZE,
      fontWeight: 'bold',
    },
    validation: {
      color: 'red',
      marginBottom: height * 0.01,
      fontSize: INPUT_HEADER_FONT_SIZE - 6,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const handleSignup = async () => {
    const url = QC_API + 'InsertUserDetails';
    const requestBody = {
      userId: userId,
      userName: firstName,
      emailId: email,
      contactNo: contactNumber,
      password: confirmPassword,
    };

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(
        'No internet connection. Please check your network settings.',
      );
      return;
    }

    let response; // Declare response variable outside the try block

    try {
      setIsLoading(true);
      response = await axios.post(url, requestBody);
      // console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);

      if (response && response.data.statusCode !== '00') {
        Alert.alert(response.data.statusMessage);
      } else if (response) {
        Alert.alert(response.data.statusMessage);
        setuserId('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setContactNumber('');
        setPassword('');
        setConfirmPassword('');
        props.navigation.navigate('Login');
      }
    }
  };

  const handleLogin = () => {
    // Clear the form after clicking the login button
    setuserId('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setContactNumber('');
    setPassword('');
    setConfirmPassword('');

    props.navigation.navigate('Login');
  };

  const handleValidate = () => {
    let isValid = true;
    let passwordMatch = true;
    let isContactValid = true;
    let isEmailValid = true;

    if (userId.trim() === '') {
      setisValidUserID(false);
      isValid = false;
    }

    if (firstName.trim() === '') {
      setisValidFirstName(false);
      isValid = false;
    }

    if (lastName.trim() === '') {
      setisValidLastName(false);
      isValid = false;
    }

    if (contactNumber.trim() === '' || !/^\d{10}$/.test(contactNumber)) {
      setisValidContactNumber(false);
      isContactValid = false;
      isValid = false;
    }

    if (
      email.trim() === '' ||
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
    ) {
      setisValidEmail(false);
      isEmailValid = false;
      isValid = false;
    }

    if (password.trim() === '') {
      setisValidPassword(false);
      isValid = false;
    }

    if (confirmPassword.trim() === '') {
      setisValidConfirmPassword(false);
      isValid = false;
    }

    // Check if Password and Confirm Password match
    if (password !== confirmPassword) {
      passwordMatch = false;
      isValid = false;
    }

    if (isValid) {
      // The form is valid, so call handleSignup and navigate to the login screen
      handleSignup();
    } else {
      // The form is not valid, display appropriate error messages
      if (!passwordMatch) {
        Alert.alert('Password and Confirm Password do not match.');
      } else if (!isContactValid) {
        Alert.alert('Please enter a valid 10-digit Contact Number.');
      } else if (!isEmailValid) {
        Alert.alert('Please enter a valid Email Address.');
      } else {
        Alert.alert('Please fill in all the required details.');
      }
    }
  };

  const calculatePasswordStrength = password => {
    setIsTypingPassword(true);
    const result = zxcvbn(password);
    setPasswordStrength(result.score);
  };

  const getProgressBarInfo = strength => {
    switch (strength) {
      case 0:
        return {color: 'red', strengthName: 'Weak'};
      case 1:
        return {color: 'orange', strengthName: 'Fair'};
      case 2:
        return {color: '#F8E473', strengthName: 'Moderate'};
      case 3:
        return {color: 'green', strengthName: 'Strong'};
      case 4:
        return {color: 'darkgreen', strengthName: 'Very Strong'};
      default:
        return {color: 'grey', strengthName: 'Unknown'};
    }
  };

  const progressBarInfo = getProgressBarInfo(passwordStrength);

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>Register</Text>
          <View style={styles.mainContent}>
            <Text style={styles.signuptitle}>Create a new account</Text>
            {/* <ScrollView style={styles.scrollView}> */}
            <KeyboardAwareScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              enableOnAndroid={true}
              extraScrollHeight={Platform.select({ios: 0, android: 0})}
              keyboardShouldPersistTaps="handled">
              <Text style={styles.inputheader}>Employee ID :</Text>
              <Field
                placeholder="Employee ID"
                onChangeText={text => {
                  const alphaValue = text.replace(/[^A0-9]/g, '');
                  setuserId(alphaValue);
                  setisValidUserID(true);
                }}
                value={userId}
                maxLength={4}
                autoCapitalize="characters"
              />
              {!isValidUserID && (
                <Text style={styles.validation}>
                  Please enter your Employee ID.
                </Text>
              )}

              <Text style={styles.inputheader}>First name :</Text>
              <Field
                placeholder="First Name"
                onChangeText={text => {
                  const alphaValue = text.replace(/[^a-z-A-Z]/g, '');
                  setFirstName(alphaValue);
                  setisValidFirstName(true);
                }}
                value={firstName}
                maxLength={20}
              />
              {!isValidFirstName && (
                <Text style={styles.validation}>
                  Please enter your First Name.
                </Text>
              )}

              <Text style={styles.inputheader}>Last name :</Text>
              <Field
                placeholder="Last Name"
                onChangeText={text => {
                  const alphaValue = text.replace(/[^a-z-A-Z]/g, '');
                  setLastName(alphaValue);
                  setisValidLastName(true);
                }}
                value={lastName}
                maxLength={20}
              />
              {!isValidLastName && (
                <Text style={styles.validation}>
                  Please enter your Last Name.
                </Text>
              )}

              <Text style={styles.inputheader}>Email ID :</Text>
              <Field
                placeholder="Email ID"
                onChangeText={text => {
                  const alphaValue = text.replace(/[^a-z-A-Z0-9-@.]/g, '');
                  setEmail(alphaValue);
                  setisValidEmail(true);
                }}
                keyboardType={'email-address'}
                value={email}
                maxLength={35}
              />
              {!isValidEmail && (
                <Text style={styles.validation}>
                  Please enter your Email Address.
                </Text>
              )}

              <Text style={styles.inputheader}>Contact Number :</Text>
              <Field
                placeholder="Contact Number"
                onChangeText={text => {
                  const numValue = text.replace(/[^[6-9]\d{9}$]/g, '');
                  setContactNumber(numValue);
                  setisValidContactNumber(true);
                }}
                value={contactNumber}
                keyboardType="numeric"
                maxLength={10}
              />
              {!isValidContactNumber && (
                <Text style={styles.validation}>
                  Please enter your Contact Number.
                </Text>
              )}
              <Text style={styles.inputheader}>Password :</Text>
              <Field
                placeholder="Password"
                onChangeText={text => {
                  const numValue = text.replace(/[^a-z-A-Z0-9-@.]/g, '');
                  setPassword(numValue);
                  setisValidPassword(true);
                  calculatePasswordStrength(numValue);
                }}
                secureTextEntry={true}
                value={password}
                maxLength={15}
              />

              {password.trim() !== '' && (
                <View>
                  <ProgressBar
                    progress={isTypingPassword ? passwordStrength / 4 : 0}
                    color={progressBarInfo.color}
                    style={{marginTop: height * 0.01, height: 10, width: '80%'}}
                  />
                  <Text
                    style={{
                      marginBottom: height * 0.01,
                      color: progressBarInfo.color,
                    }}>
                    Password Strength: {progressBarInfo.strengthName}
                  </Text>
                </View>
              )}

              {!isValidPassword && (
                <Text style={styles.validation}>
                  Please enter the Password.
                </Text>
              )}

              <Text style={styles.inputheader}>Confirm Password :</Text>
              <Field
                placeholder="Confirm Password"
                onChangeText={text => {
                  const numValue = text.replace(/[^a-z-A-Z0-9-@.]/g, '');
                  setConfirmPassword(numValue);
                  setisValidConfirmPassword(true);
                }}
                secureTextEntry={true}
                value={confirmPassword}
                maxLength={15}
              />
              {!isValidConfirmPassword && (
                <Text style={styles.validation}>Re-enter the Password.</Text>
              )}
              <View style={styles.fields}>
                {/* <Text style={{color: 'grey', fontSize: TEXT_HEADER_FONT_SIZE}}>
              You are agreeing to our{' '}
            </Text>
            <Text style={{color: darkRed, fontWeight: 'bold', fontSize: TEXT_HEADER_FONT_SIZE, }}>
              Terms & Conditions {''}
            </Text>
            <Text style={{color: 'grey', fontSize: TEXT_HEADER_FONT_SIZE}}>
              and {" "}
            </Text>
            <Text style={{color: darkRed, fontWeight: 'bold', fontSize: TEXT_HEADER_FONT_SIZE}}>
              Privacy Policy
            </Text> */}
              </View>
            </KeyboardAwareScrollView>
            {/* </ScrollView> */}
            <Btn
              textColor={theme.colors.secondary}
              bgColor={theme.colors.primary}
              btnLabel="Signup"
              Press={() => {
                handleValidate();
              }}
            />
            {isLoading && (
              <View style={styles.overlay}>
                <Image
                  source={require('../components/images/loader.gif')}
                  style={styles.loader}
                />
              </View>
            )}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: 'grey',
                  fontSize: TEXT_HEADER_FONT_SIZE,
                  fontWeight: 'bold',
                  marginTop: height * 0.01,
                }}>
                Already have an account ?{' '}
              </Text>
              <TouchableOpacity onPress={() => handleLogin()}>
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: 'bold',
                    fontSize: TEXT_HEADER_FONT_SIZE,
                    marginTop: height * 0.01,
                  }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Background>
    </View>
  );
};

export default Signup;
