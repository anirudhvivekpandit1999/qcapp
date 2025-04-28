import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import Background from './Background';
import {darkRed, red} from './Constants';
import {Picker} from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QC_API} from '../public/config';
import {useRoute} from '@react-navigation/native';
import {useTheme} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.06);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const MAIN_CONTENT_HEIGHT = height * 0.91;
const buttonWidth = width * 0.5;

const Form = props => {
  const theme = useTheme();

  const [projdrop, setprojdrop] = useState([]);
  const [projdropapi, setprojdropapi] = useState([]);
  const [selectedprojdrop, setSelectedprojdrop] = useState('');

  const [jobid, setjobid] = useState('');
  const [kiosksrno, setkiosksrno] = useState('');
  const [designrefno, setdesignrefno] = useState('');
  const [prodkeystick, setprodkeystick] = useState('');
  const [ostype, setostype] = useState('');
  const [osact, setosact] = useState('');
  const [osversion, setosversion] = useState('');
  const [actkey, setactkey] = useState('');
  const [appversion, setappversion] = useState('');
  const [cmms, setcmms] = useState('');
  const [cmmsversion, setcmmsversion] = useState('');
  const [cpusrNo, setcpusrNo] = useState('');
  const [cpumacid, setcpumacid] = useState('');

  const [isValidJobID, setIsValidJobID] = useState(true);
  const [isValidDesignRefNo, setisValidDesignRefNo] = useState(true);
  const [isValidProjectName, setisValidProjectName] = useState(true);
  const [isValidKioskSRNo, setisValidKioskSRNo] = useState(true);
  const [isValidProdKeyStick, setisValidProdKeyStick] = useState(true);
  const [isValidOSType, setisValidOSType] = useState(true);
  const [isValidOSAct, setisValidOSAct] = useState(true);
  const [isValidOSVersion, setisValidOSVersion] = useState(true);
  const [isValidOSActKey, setisValidOSActKey] = useState(true);
  const [isValidAppVer, setisValidAppVer] = useState(true);
  const [isValidCMMS, setisValidCMMS] = useState(true);
  const [isValidCMMSVer, setisValidCMMSVer] = useState(true);
  const [isValidCPUSrNo, setisValidCPUSrNo] = useState(true);
  const [isValidCPUMACId, setisValidCPUMACId] = useState(true);

  const [CheckKioskSrNo, setKCheckKioskSrNo] = useState([]);

  const kioskchecker = CheckKioskSrNo.filter(item =>
    item.kioskSrNo.includes(kiosksrno),
  );

  const route = useRoute();

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
      // marginTop: height * 0.02,
    },
    subtitle: {
      // color: theme.colors.secondary,
      color: 'white',
      fontSize: SUBTITLE_FONT_SIZE,
      fontWeight: 'bold',
      marginBottom: height * 0.01,
    },
    mainContent: {
      backgroundColor: theme.colors.background,
      height: MAIN_CONTENT_HEIGHT,
      width: width * 1,
      borderTopLeftRadius: width * 0.05,
      borderTopRightRadius: width * 0.05,
      // borderColor:theme.colors.secondary,
      borderWidth: width * 0.001,
      padding: width * 0.055,
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
      marginTop: height * 0.03,
    },
    inputHeader: {
      fontSize: INPUT_HEADER_FONT_SIZE,
      fontWeight: 'bold',
      marginBottom: height * 0.01,
    },
    input: {
      color: theme.colors.primary,
      paddingHorizontal: width * 0.03,
      width: '97%',
      backgroundColor: theme.colors.tertiary,
      marginVertical: height * 0.01,
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
    nextButton: {
      position: 'absolute',
      right: width * 0.03,
      // bottom: height * 0.01,
    },
    nextButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
      paddingBottom: height * 0.03,
      // paddingTop: height * 0.01,
    },
    previousButton: {
      marginRight: width * 0.5, // Adjust the margin for the previous button
    },
    previousButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
      paddingBottom: height * 0.03,
      // paddingTop: height * 0.01,
    },
    pageText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE - 10,
      paddingTop: height * 0.025,
      paddingBottom: height * 0.01,
      right: width * 0.365,
    },
    inputheader: {
      color: theme.colors.primary,
      fontSize: INPUT_HEADER_FONT_SIZE,
      fontWeight: 'bold',
    },
    select: {
      backgroundColor: theme.colors.tertiary,
      color: theme.colors.primary,
      width: '97%',
      marginVertical: height * 0.01,
    },
    validation: {
      color: 'red',
      marginBottom: height * 0.01,
      fontSize: INPUT_HEADER_FONT_SIZE,
    },
  });

  const fetchData = async () => {
    try {
      const response = await axios.get(QC_API + 'GetFormData', {});
      const FormData = response.data;
      setKCheckKioskSrNo(FormData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    projData();
    if (route.params && route.params.savedFormData) {
      const savedData = route.params.savedFormData;

      setjobid(savedData.jobid ?? '');
      setdesignrefno(savedData.designrefno ?? '');
      setSelectedprojdrop(savedData.selectedprojdrop ?? '');
      setkiosksrno(savedData.kiosksrno ?? '');
      setprodkeystick(savedData.prodkeystick ?? '');
      setostype(savedData.ostype ?? '');
      setosact(savedData.osact ?? '');
      setosversion(savedData.osversion ?? '');
      setactkey(savedData.actkey ?? '');
      setappversion(savedData.appversion ?? '');
      setcmms(savedData.cmms ?? '');
      setcmmsversion(savedData.cmmsversion ?? '');
      setcpusrNo(savedData.cpusrNo ?? '');
      setcpumacid(savedData.cpumacid ?? '');
    }
  }, [route.params]);

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

  const projData = () => {
    axios
      .get(QC_API + 'GetProjectData')
      .then(response => {
        setprojdrop(
          response.data.map(item => ({
            label: item.projectName,
            value: item.projectName,
          })),
        );
        setprojdropapi(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('jobid', jobid);
      await AsyncStorage.setItem('designrefno', designrefno);
      await AsyncStorage.setItem('selectedprojdrop', selectedprojdrop);
      await AsyncStorage.setItem('kiosksrno', kiosksrno);
      await AsyncStorage.setItem('cpumacid', cpumacid);
      await AsyncStorage.setItem('prodkeystick', prodkeystick);
      await AsyncStorage.setItem('ostype', ostype);
      await AsyncStorage.setItem('osact', osact);
      await AsyncStorage.setItem('osversion', osversion);
      await AsyncStorage.setItem('actkey', actkey);
      await AsyncStorage.setItem('appversion', appversion);
      await AsyncStorage.setItem('cmms', cmms);
      await AsyncStorage.setItem('cmmsversion', cmmsversion);
      await AsyncStorage.setItem('cpusrNo', cpusrNo);
    } catch (error) {
      Alert.alert('Failed to save data.');
    }
  };

  const handleProjectChange = itemValue => {
    setSelectedprojdrop(itemValue);
    setisValidProjectName(true);
    let selectedProject = projdropapi.filter(
      obj => obj.projectName === itemValue,
    );
    AsyncStorage.setItem(
      'projectid',
      JSON.stringify(selectedProject[0].projectId),
    );
  };

  const handleValidate = () => {
    let isValid = true;
    const isKioskExists = kioskchecker.some(
      item => item.kioskSrNo === kiosksrno.trim(),
    );

    if (jobid.trim() === '') {
      setIsValidJobID(false);
      isValid = false;
    }

    if (designrefno.trim() === '') {
      setisValidDesignRefNo(false);
      isValid = false;
    }

    if (selectedprojdrop === '') {
      setisValidProjectName(false);
      isValid = false;
    }

    if (kiosksrno.trim() === '' || isKioskExists) {
      setisValidKioskSRNo(false);
      isValid = false;
    }

    if (cpusrNo.trim() === '') {
      setisValidCPUSrNo(false);
      isValid = false;
    }

    if (cpumacid === '') {
      setisValidCPUMACId(false);
      isValid = false;
    }

    if (prodkeystick === '') {
      setisValidProdKeyStick(false);
      isValid = false;
    }

    if (ostype === '') {
      setisValidOSType(false);
      isValid = false;
    }

    if (
      ostype === 'Windows 10 LTSC' ||
      ostype === 'Windows 10 Pro' ||
      ostype === 'Linux' ||
      ostype === 'Android'
    ) {
      if (osact === '') {
        setisValidOSAct(false);
        isValid = false;
      } else {
        setisValidOSAct(true);

        if (osact === 'Yes') {
          if (actkey.trim() === '') {
            setisValidOSActKey(false);
            setisValidOSVersion(false);
            isValid = false;
          } else {
            setisValidOSActKey(true);
            if (osversion.trim() === '') {
              setisValidOSVersion(false);
              isValid = false;
            } else {
              setisValidOSVersion(true);
            }
          }
        } else if (osact === 'No') {
          if (osversion.trim() === '') {
            setisValidOSVersion(false);
            isValid = false;
          } else {
            setisValidOSVersion(true);
          }
        } else {
          setisValidOSActKey(true);
          setisValidOSVersion(true);
        }
      }
    } else {
      setisValidOSAct(true);
      setisValidOSVersion(true);
      setisValidOSActKey(true);
    }

    if (appversion.trim() === '') {
      setisValidAppVer(false);
      isValid = false;
    }

    if (cmms === '') {
      setisValidCMMS(false);
      isValid = false;
    }

    if (cmms === 'Yes' && cmmsversion.trim() === '') {
      setisValidCMMSVer(false);
      isValid = false;
    }

    if (isKioskExists) {
      Alert.alert('A form has already been submitted with this Kiosk Sr. No!');
    }

    if (isValid) {
      props.navigation.navigate('Page2');
    } else {
      Alert.alert('Please fill in all the required details.');
    }
  };

  const handleSaveForm = async () => {
    try {
      let isValid = true;
      const currentDate = new Date();
      const date = currentDate.toString().replace(/GMT.*$/, '');

      // Validate Kiosk Sr. No
      if (kiosksrno.trim() === '') {
        setisValidKioskSRNo(false);
        isValid = false;
      }

      if (isValid) {
        const formId = kiosksrno;

        const formData = {
          jobid,
          designrefno,
          selectedprojdrop,
          kiosksrno,
          cpusrNo,
          cpumacid,
          prodkeystick,
          ostype,
          osact,
          osversion,
          actkey,
          appversion,
          cmms,
          cmmsversion,
        };

        const savedFormsData = await AsyncStorage.getItem('savedForms');
        const savedForms = savedFormsData ? JSON.parse(savedFormsData) : {};

        savedForms[formId] = {formData, date};

        await AsyncStorage.setItem('savedForms', JSON.stringify(savedForms));

        props.navigation.navigate('Dashboard');

        Alert.alert('Form Data Saved Successfully');
      } else {
        Alert.alert('Kiosk SR No. is required to save the form!');
      }
    } catch (error) {
      Alert.alert('Failed to save form data.');
    }
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>QC Form</Text>
          <Text style={styles.subtitle}>Kindly fill in the details below!</Text>
          <View style={styles.mainContent}>
            <View style={styles.logoutButton}>
              <TouchableOpacity onPress={() => handleBackPress()}>
                <Text style={styles.nextButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
            <KeyboardAwareScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              enableOnAndroid={true}
              extraScrollHeight={Platform.select({ios: 0, android: 60})}
              keyboardShouldPersistTaps="handled">
              <Text style={styles.inputheader}>Job ID :</Text>
              <TextInput
                {...props}
                style={styles.input}
                placeholderTextColor={theme.colors.primary}
                onChangeText={text => {
                  const numericValue = text.replace(/[^A-Z0-9-]/g, '');
                  setjobid(numericValue);
                  setIsValidJobID(true);
                }}
                value={jobid}
                placeholder="Job ID"
                maxLength={16}
                autoCapitalize="characters"
              />

              {!isValidJobID && (
                <Text style={styles.validation}>Please enter the job ID.</Text>
              )}

              <Text style={styles.inputheader}>Design Ref. No. :</Text>
              <TextInput
                {...props}
                style={styles.input}
                placeholderTextColor={theme.colors.primary}
                onChangeText={text => {
                  const numericValue = text.replace(/[^A-Z0-9]/g, '');
                  setdesignrefno(numericValue);
                  setisValidDesignRefNo(true);
                }}
                value={designrefno}
                placeholder="Design Ref. No."
                maxLength={15}
                autoCapitalize="characters"
              />

              {!isValidDesignRefNo && (
                <Text style={styles.validation}>
                  Please enter the Design Ref. No.
                </Text>
              )}

              <Text style={styles.inputheader}>Project Name :</Text>
              <Picker
                selectedValue={selectedprojdrop}
                onValueChange={handleProjectChange}
                style={styles.select}>
                <Picker.Item
                  label="-- Select Project Name --"
                  value=""
                  enabled={false}
                />
                {projdrop.map(item => (
                  <Picker.Item
                    label={item.label}
                    value={item.value}
                    key={item.value}
                  />
                ))}
              </Picker>

              {!isValidProjectName && (
                <Text style={styles.validation}>
                  Please select a Project Name.
                </Text>
              )}

              <Text style={styles.inputheader}>Kiosk Sr. No. :</Text>
              <TextInput
                {...props}
                style={styles.input}
                placeholderTextColor={theme.colors.primary}
                onChangeText={text => {
                  const alphanumericValue = text.replace(/[^A-Z0-9]/g, '');

                  let formattedValue = '';
                  for (let i = 0; i < alphanumericValue.length; i++) {
                    if (i === 4 || i === 5 || i === 9) {
                      formattedValue += '-';
                    }
                    formattedValue += alphanumericValue[i];
                  }

                  setkiosksrno(formattedValue);
                  setisValidKioskSRNo(true);
                }}
                value={kiosksrno}
                placeholder="Kiosk Sr. No."
                autoCapitalize="characters"
                maxLength={16}
              />

              {!isValidKioskSRNo && (
                <Text style={styles.validation}>
                  Please enter a valid Kiosk Sr. No.
                </Text>
              )}

              <Text style={styles.inputheader}>CPU Sr. No. :</Text>
              <TextInput
                {...props}
                style={styles.input}
                placeholderTextColor={theme.colors.primary}
                onChangeText={text => {
                  const alphanumericValue = text.replace(/[^A-Z0-9.]/g, '');
                  setcpusrNo(alphanumericValue);
                  setisValidCPUSrNo(true);
                }}
                value={cpusrNo}
                placeholder="CPU Sr. No."
                maxLength={16}
                autoCapitalize="characters"
              />

              {!isValidCPUSrNo && (
                <Text style={styles.validation}>
                  Please enter the CPU Sr. No.
                </Text>
              )}

              <Text style={styles.inputheader}>CPU MAC ID :</Text>
              <TextInput
                {...props}
                style={styles.input}
                placeholderTextColor={theme.colors.primary}
                onChangeText={text => {
                  if (text) {
                    const alphanumericValue = text.replace(/[^0-9A-Fa-f]/g, '');

                    if (
                      alphanumericValue !== null &&
                      alphanumericValue !== undefined
                    ) {
                      const formattedValue = alphanumericValue
                        .match(/.{1,2}/g)
                        ?.join(':')
                        ?.substring(0, 17);

                      setcpumacid(formattedValue);
                      setisValidCPUMACId(true);
                    } else {
                      setcpumacid('');
                      setisValidCPUMACId(false);
                    }
                  } else {
                    setcpumacid('');
                    setisValidCPUMACId(false);
                  }
                }}
                value={cpumacid}
                placeholder="CPU MAC ID"
                maxLength={17}
                autoCapitalize="characters"
              />

              {!isValidCPUMACId && (
                <Text style={styles.validation}>
                  Please enter the CPU MAC ID.
                </Text>
              )}

              <Text style={styles.inputheader}>Product Key Sticker :</Text>
              <Picker
                selectedValue={prodkeystick}
                onValueChange={itemValue => {
                  setprodkeystick(itemValue);
                  setisValidProdKeyStick(true);
                }}
                style={styles.select}>
                <Picker.Item
                  label="-- Select Key Sticker --"
                  value=""
                  enabled={false}
                />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>

              {!isValidProdKeyStick && (
                <Text style={styles.validation}>
                  Please select the Product Key Sticker.
                </Text>
              )}

              <Text style={styles.inputheader}> OS Type : </Text>
              <Picker
                selectedValue={ostype}
                onValueChange={itemValue => {
                  setostype(itemValue);
                  setisValidOSType(true);
                  setosact(''); // Reset the OS activation value when the OS Type changes
                  setisValidOSAct(true); // Reset the OS activation validation
                  setactkey('');
                  setisValidOSActKey(true);
                }}
                style={styles.select}>
                <Picker.Item label="-- Select OS --" value="" enabled={false} />
                <Picker.Item label="Windows 10 LTSC" value="Windows 10 LTSC" />
                <Picker.Item label="Windows 10 Pro" value="Windows 10 Pro" />
                <Picker.Item label="Linux" value="Linux" />
                <Picker.Item label="Android" value="Android" />
              </Picker>

              {!isValidOSType && (
                <Text style={styles.validation}>
                  Please select an Operating System.
                </Text>
              )}

              {(ostype === 'Windows 10 LTSC' ||
                ostype === 'Windows 10 Pro' ||
                ostype === 'Linux' ||
                ostype === 'Android') && (
                <View>
                  <Text style={styles.inputheader}>OS activation :</Text>
                  <Picker
                    selectedValue={osact}
                    onValueChange={itemValue => {
                      setosact(itemValue);
                      setisValidOSAct(true);
                    }}
                    style={styles.select}>
                    <Picker.Item
                      label="-- Select OS activation --"
                      value=""
                      enabled={false}
                    />
                    <Picker.Item label="Yes" value="Yes" />
                    <Picker.Item label="No" value="No" />
                  </Picker>

                  {!isValidOSAct && (
                    <Text style={styles.validation}>
                      Please select OS Activation.
                    </Text>
                  )}

                  {osact === 'Yes' && (
                    <View>
                      <Text style={styles.inputheader}>OS Version :</Text>
                      <TextInput
                        {...props}
                        style={styles.input}
                        placeholderTextColor={theme.colors.primary}
                        onChangeText={text => {
                          const alphanumericValue = text.replace(
                            /[^A-Z0-9. -]/g,
                            '',
                          );
                          setosversion(alphanumericValue);
                          setisValidOSVersion(true);
                        }}
                        value={osversion}
                        placeholder="OS Version"
                        autoCapitalize="characters"
                        maxLength={20}
                      />

                      {!isValidOSVersion && (
                        <Text style={styles.validation}>
                          Please enter the OS Version.
                        </Text>
                      )}

                      <Text style={styles.inputheader}>
                        OS Activation Key :
                      </Text>
                      <TextInput
                        {...props}
                        style={styles.input}
                        placeholderTextColor={theme.colors.primary}
                        onChangeText={text => {
                          const alphanumericValue = text.replace(
                            /[^A-Z0-9]/g,
                            '',
                          );

                          let formattedValue = '';
                          for (let i = 0; i < alphanumericValue.length; i++) {
                            if (i === 5 || i === 10 || i === 15 || i === 20) {
                              formattedValue += '-';
                            }
                            formattedValue += alphanumericValue[i];
                          }

                          setactkey(formattedValue);
                          setisValidOSActKey(true);
                        }}
                        value={actkey}
                        placeholder="OS Activation Key"
                        autoCapitalize="characters"
                        maxLength={29}
                      />

                      {!isValidOSActKey && (
                        <Text style={styles.validation}>
                          Please enter the Activation Key.
                        </Text>
                      )}
                    </View>
                  )}

                  {osact === 'No' && (
                    <View>
                      <Text style={styles.inputheader}>OS Version :</Text>
                      <TextInput
                        {...props}
                        style={styles.input}
                        placeholderTextColor={theme.colors.primary}
                        onChangeText={text => {
                          const alphanumericValue = text.replace(
                            /[^A-Z0-9.]/g,
                            '',
                          );
                          setosversion(alphanumericValue);
                          setisValidOSVersion(true);
                        }}
                        value={osversion}
                        placeholder="OS Version"
                        autoCapitalize="characters"
                        maxLength={20}
                      />

                      {!isValidOSVersion && (
                        <Text style={styles.validation}>
                          Please enter the OS Version.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}

              <Text style={styles.inputheader}>Application Version :</Text>
              <TextInput
                {...props}
                style={styles.input}
                placeholderTextColor={theme.colors.primary}
                onChangeText={text => {
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  setappversion(numericValue);
                  setisValidAppVer(true);
                }}
                value={appversion}
                placeholder="Application Version"
                keyboardType="numeric"
                maxLength={7}
              />

              {!isValidAppVer && (
                <Text style={styles.validation}>
                  Please enter the Application Version.
                </Text>
              )}
              <Text style={styles.inputheader}>CMMS :</Text>
              <Picker
                selectedValue={cmms}
                onValueChange={itemValue => {
                  setcmms(itemValue);
                  setisValidCMMS(true);
                }}
                style={styles.select}>
                <Picker.Item
                  label="-- Select CMMS --"
                  value=""
                  enabled={false}
                />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>

              {!isValidCMMS && (
                <Text style={styles.validation}>Please select CMMS.</Text>
              )}

              {cmms === 'Yes' && (
                <View>
                  <Text style={styles.inputheader}>CMMS Version:</Text>
                  <TextInput
                    {...props}
                    style={styles.input}
                    placeholderTextColor={theme.colors.primary}
                    onChangeText={text => {
                      const numValue = text.replace(/[^0-9.]/g, '');
                      setcmmsversion(numValue);
                      setisValidCMMSVer(true);
                    }}
                    value={cmmsversion}
                    placeholder="CMMS Version"
                    keyboardType="numeric"
                    maxLength={7}
                  />

                  {!isValidCMMSVer && (
                    <Text style={styles.validation}>
                      Please enter the CMMS Version.
                    </Text>
                  )}
                  <Text></Text>
                </View>
              )}
            </KeyboardAwareScrollView>

            <View>
              <TouchableOpacity
                onPress={() => {
                  handleSaveForm();
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
                  SAVE
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <View style={styles.previousButton}>
                <TouchableOpacity
                  onPress={() => props.navigation.navigate('Dashboard')}>
                  <Text style={styles.previousButtonText}>
                    {' '}
                    {'<'} Dashboard
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.pageText}>Page 1/6</Text>
              <View style={styles.nextButton}>
                <TouchableOpacity
                  onPress={() => {
                    handleValidate();
                    handleSave();
                  }}>
                  <Text style={styles.nextButtonText}>Next {'>'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Background>
    </View>
  );
};

export default Form;
