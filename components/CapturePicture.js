import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import Background from './Background';
import {darkRed} from './Constants';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import Btn from './Btn';
import axios from 'axios';
import moment from 'moment';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAustralSign, faCircleDot} from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import ImageResizer from 'react-native-image-resizer';
import {QC_API} from '../public/config';
import {useTheme} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const MAIN_CONTENT_HEIGHT = height * 0.945;
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const buttonWidth = width * 0.5;

const CaptureImage = props => {
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
      color: 'white',
      fontSize: HEADER_FONT_SIZE,
      fontWeight: 'bold',
      // marginTop: height * 0.01,
      marginBottom: height * 0.01,
    },
    mainContent: {
      backgroundColor: theme.colors.background,
      height: MAIN_CONTENT_HEIGHT,
      width: width * 1,
      // borderRadius: width * 0.05,
      padding: width * 0.05,
      alignItems: 'center',
      justifyContent: 'center',
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
      color: darkRed,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
      paddingBottom: height * 0.02,
    },
    previousButton: {
      marginRight: width * 0.5, // Adjust the margin for the previous button
    },
    previousButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
      paddingBottom: height * 0.03,
    },
    pageText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE - 10,
      paddingTop: height * 0.025,
      paddingBottom: height * 0.015,
      right: width * 0.36,
    },
    logoutButton: {
      position: 'absolute',
      top: height * 0.015,
      left: width * 0.78,
    },
    captureButton: {
      width: width * 0.15,
      height: width * 0.15,
      backgroundColor: darkRed,
      borderRadius: width * 0.15,
      marginTop: height * 0.7,
      justifyContent: 'center',
      alignItems: 'center',
    },
    capture: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
    retakeButton: {
      marginTop: 10,
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    retakeButtonText: {
      color: theme.colors.secondary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    gridItem: {
      width: '50%',
      aspectRatio: 1, // Maintain a square aspect ratio for each image
      // marginBottom: 10,
      borderRadius: 5,
      alignItems: 'center', // Center the image horizontally
      justifyContent: 'center', // Center the image vertically
    },
    torchButton: {
      backgroundColor: darkRed,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    torchButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  let DeviceListData;
  let DeviceListDataArr;
  let CheckPointDataArr;

  const devices = useCameraDevices();
  const device = devices[0] || devices[1];
  const camera = useRef(null);

  const [captureButton, setCaptureButton] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);

  const [showRetakeButton, setShowRetakeButton] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const [DeviceArr, setDeviceArr] = useState([]);
  const [CheckPointArr, setCheckPointArr] = useState([]);

  const [frontBase64, setFrontBase64] = useState(null);
  const [backBase64, setBackBase64] = useState(null);
  const [rightBase64, setRightBase64] = useState(null);
  const [leftBase64, setLeftBase64] = useState(null);

  const [imageCount, setImageCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [focusPoint, setFocusPoint] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(0);

  const [asyncfetch, setasyncfetch] = useState({
    today: moment().format('Do MMMM YYYY'),
    logindata: '',
    jobid: '',
    arrayOfArray2: '',
    selectedprojdrop: '',
    selectedProject: '',
    kiosksrno: '',
    prodkeystick: '',
    ostype: '',
    osact: '',
    actkey: '',
    // productkey: '',
    appversion: '',
    cmmsversion: '',
    cpusrNo: '',
    cpumacid: '',
  });

  const labels = ['1', '2', '3', '4'];

  useEffect(() => {
    CheckPermissions();
    retrieveData();
    loadData();
  }, []);

  const CheckPermissions = async () => {
    await Camera.requestCameraPermission();
    await Camera.requestMicrophonePermission();
  };

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

  const retrieveData = async () => {
    try {
      const jobid = await AsyncStorage.getItem('jobid');
      const designrefno = await AsyncStorage.getItem('designrefno');
      const selectedprojdrop = await AsyncStorage.getItem('selectedprojdrop');
      const selectedProject = await AsyncStorage.getItem('projectid');
      const kiosksrno = await AsyncStorage.getItem('kiosksrno');
      const prodkeystick = await AsyncStorage.getItem('prodkeystick');
      const ostype = await AsyncStorage.getItem('ostype');
      const osact = await AsyncStorage.getItem('osact');
      const osversion = await AsyncStorage.getItem('osversion');
      const actkey = await AsyncStorage.getItem('actkey');
      // const productkey = await AsyncStorage.getItem('productkey');
      const appversion = await AsyncStorage.getItem('appversion');
      const cmmsversion = await AsyncStorage.getItem('cmmsversion');
      const cmms = await AsyncStorage.getItem('cmms');
      const cpusrNo = await AsyncStorage.getItem('cpusrNo');
      const cpumacid = await AsyncStorage.getItem('cpumacid');
      const logindata = await AsyncStorage.getItem('logindata');

      const actkeyNull = actkey ? actkey : 'N/A';
      const cmmsNull = cmmsversion ? cmmsversion : 'N/A';

      const filepath = await AsyncStorage.getItem('filepath');
      const filename = await AsyncStorage.getItem('filename');

      setasyncfetch({
        today: moment().format('DD-MM-YYYY'),
        jobid,
        designrefno,
        selectedprojdrop,
        kiosksrno,
        selectedProject,
        prodkeystick,
        ostype,
        osact,
        osversion,
        actkey: actkeyNull,
        appversion,
        cmmsversion: cmmsNull,
        cmms,
        cpusrNo,
        cpumacid,
        logindata,
        filepath,
        filename,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  async function loadData() {
    try {
      DeviceListData = await AsyncStorage.getItem('DeviceListData');
      DeviceListDataArr = await AsyncStorage.getItem('arrayDeviceList');
      CheckPointDataArr = await AsyncStorage.getItem('arrayChkList');

      if (DeviceListData !== null) {
        setDeviceArr(JSON.parse(DeviceListDataArr));
        setCheckPointArr(JSON.parse(CheckPointDataArr));
      } else {
        console.log('No data found');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateApi = async () => {
    try {
      setIsLoading(true);
      const jsonData = {
        projectId: Number(asyncfetch.selectedProject),
        kioskSrNo: asyncfetch.kiosksrno,
        productKeySticker: asyncfetch.prodkeystick === 'Yes' ? true : false,
        osType: asyncfetch.ostype,
        windowsActivation: asyncfetch.osact === 'Yes' ? true : false,
        productKey: asyncfetch.actkey,
        osVersion: asyncfetch.osversion,
        appVersion: asyncfetch.appversion.toString(),
        cmmsVersion: asyncfetch.cmmsversion.toString(),
        qcDoneBy: asyncfetch.logindata,
        jobID: asyncfetch.jobid,
        insQCDetailsRequest: DeviceArr,
        insCheckPointDetailsRequest: CheckPointArr,
        designRefNo: asyncfetch.designrefno,
        CPUSrNo: asyncfetch.cpusrNo,
        CPUMacID: asyncfetch.cpumacid,
        chkId: 0,
        remarks: 'NA',
        KioskFrontImg: frontBase64,
        KioskBackImg: backBase64,
        KioskRightImg: rightBase64,
        KioskLeftImg: leftBase64,
      };

      var formData = new FormData();
      formData.append('pdfFile', {
        uri:
          Platform.OS === 'android'
            ? `file:///${asyncfetch.filepath}`
            : asyncfetch.filepath,
        name: asyncfetch.filename,
        type: 'application/pdf',
      });
      formData.append('insQCMasterDataRequest', JSON.stringify(jsonData));

      var config = {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post(
        QC_API + 'InsertQCMasterData',
        formData,
        config,
      );

      if (response.data.statusCode === '00') {
        let qrurl = response.data.statusMessage;
        AsyncStorage.setItem('qrurl', qrurl);
        props.navigation.navigate('QRCode');
      } else {
        Alert.alert(
          response.data
            ? response.data.statusMessage
            : 'Unknown error occurred',
        );
      }
    } catch (error) {
      Alert.alert(error.message);
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };

  const TakePicture = async () => {
    if (camera != null) {
      const photo = await camera.current.takePhoto({
        flash: 'auto',
      });

      const imagePath = photo.path;

      const currentImageCount = imageCount;

      setImageCount(currentImageCount + 1);

      const desiredWidth = 800; // Adjust to your desired width
      const desiredHeight = 600; // Adjust to your desired height
      const quality = 100; // Adjust image quality (0-100)

      const resizedImagePath = await ImageResizer.createResizedImage(
        imagePath,
        desiredWidth, // Specify the desired width
        desiredHeight, // Specify the desired height
        'JPEG', // Format (you can choose JPEG or PNG)
        quality, // Image quality (e.g., 80 for 80% quality)
      );

      RNFetchBlob.fs
        .readFile(resizedImagePath.uri, 'base64')
        .then(base64String => {
          switch (currentImageCount) {
            case 0:
              setFrontBase64(base64String);
              break;
            case 1:
              setRightBase64(base64String);
              break;
            case 2:
              setBackBase64(base64String);
              break;
            case 3:
              setLeftBase64(base64String);
              break;
            default:
              break;
          }
        })
        .catch(error => {
          console.error('Error converting image to base64:', error);
        });

      setCapturedImages([...capturedImages, resizedImagePath.uri]);
      setCaptureButton(false);
      setTorchOn(false);
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setShowRetakeButton(false);
    setCapturedImages(prevImages => {
      const updatedImages = [...prevImages];
      const index = updatedImages.indexOf(selectedImage);
      if (index !== -1) {
        updatedImages.splice(index, 1);
      }
      return updatedImages;
    });
  };

  const handleTorchToggle = () => {
    setTorchOn(prevTorchOn => !prevTorchOn);
  };

  const handleFocus = event => {
    console.log(
      'Tapped on screen:',
      event.nativeEvent.locationX,
      event.nativeEvent.locationY,
    );

    const x = event.nativeEvent.locationX / width;
    const y = event.nativeEvent.locationY / height;

    camera.current.setFocusPoint(x, y);
  };

  const handlePinchZoom = event => {
    const newZoomLevel = event.scale * 0.5;
    setZoomLevel(Math.max(0, Math.min(newZoomLevel, 1.0)));
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>Image Capture</Text>
          <View style={styles.mainContent}>
            <View style={styles.logoutButton}>
              {/* <TouchableOpacity onPress={() => handleBackPress()}>
            <Text style={styles.nextButtonText}>Logout</Text>
          </TouchableOpacity> */}
            </View>
            {captureButton ? (
              <View style={styles.mainContent}>
                <Camera
                  ref={camera}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={true}
                  photo
                  torch={torchOn ? 'on' : 'off'}
                  onTap={event => handleFocus(event)}
                  zoom={zoomLevel}
                  onPinchEnd={event => handlePinchZoom(event)}
                  onTouchStart={event => {
                    if (event.nativeEvent.touches.length === 2) {
                      event.preventDefault();
                    }
                  }}
                />

                <TouchableOpacity
                  onPress={handleTorchToggle}
                  style={styles.torchButton}>
                  <Text style={styles.torchButtonText}>
                    {torchOn ? 'Torch Off' : 'Torch On'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={() => {
                    TakePicture();
                  }}>
                  <FontAwesomeIcon icon={faCircleDot} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.capture}>
                <View style={styles.gridContainer}>
                  {capturedImages.map((imagePath, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedImage(imagePath);
                        setShowRetakeButton(true);
                      }}
                      style={styles.gridItem}>
                      <Image
                        source={{uri: 'file://' + imagePath}}
                        style={{
                          width: width * 0.3,
                          height: width * 0.3,
                          marginBottom: 10,
                          borderRadius: 5,
                          borderWidth: 0.5,
                          borderColor: theme.colors.primary,
                        }}
                      />
                      <Text
                        style={{
                          textAlign: 'center',
                          color: theme.colors.primary,
                          fontWeight: 'bold',
                          fontSize: BUTTON_FONT_SIZE - 10,
                        }}>
                        {labels[index]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {focusPoint && (
                    <View
                      style={{
                        position: 'absolute',
                        top: focusPoint.y * height - 10,
                        left: focusPoint.x * width - 10,
                        width: 20,
                        height: 20,
                        borderWidth: 2,
                        borderColor: 'white',
                        borderRadius: 10,
                      }}
                    />
                  )}
                </View>

                {capturedImages.length < 4 && (
                  <TouchableOpacity
                    onPress={() => {
                      setCaptureButton(true);
                    }}
                    style={[
                      styles.button,
                      {
                        backgroundColor: theme.colors.primary,
                        width: buttonWidth,
                      },
                    ]}>
                    <Text
                      style={{
                        color: theme.colors.secondary,
                        fontSize: 25,
                        fontWeight: 'bold',
                      }}>
                      Capture
                    </Text>
                  </TouchableOpacity>
                )}

                {capturedImages.length > 3 && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Submit Form',
                        'Are you sure you want to submit the form?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Submit',
                            onPress: async () => {
                              await updateApi();
                            },
                          },
                        ],
                        {cancelable: false},
                      );
                    }}
                    style={[
                      styles.button,
                      {
                        backgroundColor: theme.colors.primary,
                        width: buttonWidth,
                      },
                    ]}>
                    <Text
                      style={{
                        color: theme.colors.secondary,
                        fontSize: 25,
                        fontWeight: 'bold',
                      }}>
                      SUBMIT
                    </Text>
                  </TouchableOpacity>
                )}

                {isLoading && (
                  <View style={styles.overlay}>
                    <Image
                      source={require('../components/images/loader.gif')}
                      style={styles.loader}
                    />
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <View style={styles.previousButton}>
                    <TouchableOpacity
                      onPress={() => props.navigation.navigate('Review')}>
                      <Text style={styles.previousButtonText}>
                        {'<'} Previous
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.pageText}>Page 5/6</Text>
                </View>
              </View>
            )}
          </View>

          {selectedImage && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
              }}
              onPress={() => setSelectedImage(null)}>
              <Image
                source={{uri: 'file://' + selectedImage}}
                style={{
                  width: width * 0.8,
                  height: height * 0.8,
                  resizeMode: 'contain',
                }}
              />

              {/* Retake button inside the picture view */}
              {showRetakeButton && (
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetake}>
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Background>
    </View>
  );
};

export default CaptureImage;
