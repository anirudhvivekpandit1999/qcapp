import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import {Table, Row} from 'react-native-table-component';
import {request, PERMISSIONS} from 'react-native-permissions';
// import { getCreationTime } from 'react-native-file-access';
import Background from './Background';
import Switch from 'react-native-switch-pro';
import {darkRed} from './Constants';
import {useTheme} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const MAIN_CONTENT_HEIGHT = height * 0.94;

const Reports = props => {
  const theme = useTheme();

  const [pdfs, setPdfs] = useState([]);
  const [qrcode, setqrcode] = useState([]);
  const [excel, setexcel] = useState([]);

  const [selectedFileType, setSelectedFileType] = useState('pdf');

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
      marginBottom: height * 0.01,
      marginTop: height * 0.01,
    },
    mainContent: {
      backgroundColor: theme.colors.background,
      height: MAIN_CONTENT_HEIGHT,
      width: width * 1,
      borderTopLeftRadius: width * 0.05,
      borderTopRightRadius: width * 0.05,
      padding: width * 0.05,
    },
    logoutButton: {
      position: 'absolute',
      top: height * 0.015,
      left: width * 0.05,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      // width: width * 0.8,
      // height: width * 0.2,
      marginVertical: height * 0.01,
      marginHorizontal: width * 0.05,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      paddingTop: height * 0.01,
      color: darkRed,
      fontSize: Math.round(width * 0.03),
      fontWeight: 'bold',
    },
    previousButton: {
      position: 'absolute',
      bottom: height * 0.03,
      left: width * 0.03,
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.01,
    },
    previousButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
    },
    head: {
      height: 40,
      backgroundColor: theme.colors.background,
    },
    text: {
      margin: 6,
      textAlign: 'center',
      color: theme.colors.primary,
    },
    openButton: {
      backgroundColor: theme.colors.nullary, // Customize the button's background color
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
    },
    openButtonText: {
      color: theme.colors.nullarycontainer, // Customize the button's text color
      fontWeight: 'bold',
      textAlign: 'center',
    },
    fileNameText: {
      // flex: 1,
      // overflow: 'hidden',
      // textOverflow: 'ellipsis',
      // whiteSpace: 'nowrap',
      color: theme.colors.primary,
    },
    tabButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
      marginBottom: 35,
    },
    selectedTab: {
      backgroundColor: theme.colors.tertiary,
    },
    tabText: {
      color: darkRed,
    },
    selectedTabText: {
      fontWeight: 'bold',
    },
  });

  useEffect(() => {
    loadPdfFiles();
    loadQRCode();
    loadExcel();
    requestStoragePermission();
  }, []);

  const requestStoragePermission = async () => {
    try {
      const permissionStatus = await request(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );
      if (permissionStatus === 'granted') {
        loadPdfFiles();
        loadQRCode();
      } else {
        console.log('Storage permission denied');
      }
    } catch (error) {
      console.log('Error requesting storage permission:', error);
    }
  };

  const loadPdfFiles = async () => {
    try {
      const directory = RNFS.DownloadDirectoryPath;
      const directoryExists = await RNFS.exists(directory);
      if (directoryExists) {
        const allowedExtensions = ['.pdf'];
        // const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];

        const files = await RNFS.readDir(directory);

        const filteredPDF = files.filter(file => {
          const fileExtension =
            Platform.OS === 'android'
              ? file.name.split('.').pop().toLowerCase()
              : file.name.split('.').pop().toLowerCase();
          return allowedExtensions.includes(`.${fileExtension}`);
        });

        setPdfs(filteredPDF);
      } else {
        console.log('Directory does not exist:', directory);
      }
    } catch (error) {
      console.log('Error loading PDF files:', error);
    }
  };

  const loadQRCode = async () => {
    try {
      const directory = RNFS.DownloadDirectoryPath;
      const directoryExists = await RNFS.exists(directory);
      if (directoryExists) {
        const allowedExtensions = ['.jpeg'];
        // const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];

        const files = await RNFS.readDir(directory);

        const filteredQR = files.filter(file => {
          const fileExtension =
            Platform.OS === 'android'
              ? file.name.split('.').pop().toLowerCase()
              : file.name.split('.').pop().toLowerCase();
          return allowedExtensions.includes(`.${fileExtension}`);
        });

        setqrcode(filteredQR);
      } else {
        console.log('Directory does not exist:', directory);
      }
    } catch (error) {
      console.log('Error loading QR Code:', error);
    }
  };

  const loadExcel = async () => {
    try {
      const directory = RNFS.DownloadDirectoryPath;
      const directoryExists = await RNFS.exists(directory);
      if (directoryExists) {
        const allowedExtensions = ['.xlsx'];
        // const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];

        const files = await RNFS.readDir(directory);

        const filteredExcel = files.filter(file => {
          const fileExtension =
            Platform.OS === 'android'
              ? file.name.split('.').pop().toLowerCase()
              : file.name.split('.').pop().toLowerCase();
          return allowedExtensions.includes(`.${fileExtension}`);
        });

        setexcel(filteredExcel);
      } else {
        console.log('Directory does not exist:', directory);
      }
    } catch (error) {
      console.log('Error loading Excel:', error);
    }
  };

  const renderFileItem = ({item}) => {
    return (
      <Table
        borderStyle={{borderWidth: 1, borderColor: '#c8e1ff', width: width}}>
        <Row
          style={styles.head}
          textStyle={styles.text}
          data={[
            <Text style={styles.fileNameText}>{item.name}</Text>,
            <TouchableOpacity
              style={styles.openButton}
              onPress={() => openFile(item.path)}>
              <Text style={styles.openButtonText}>Open</Text>
            </TouchableOpacity>,
          ]}
        />
      </Table>
    );
  };

  const openFile = async filePath => {
    let mimeType = '';
    try {
      const fileExtension = filePath.split('.').pop().toLowerCase();

      switch (fileExtension) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'jpeg':
        case 'jpg':
          mimeType = 'image/jpeg';
          break;
        case 'xlsx':
          mimeType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          mimeType = 'application/octet-stream';
      }

      console.log('Opening file with MIME type:', mimeType);
      console.log('Opening file with Path:', filePath);

      await FileViewer.open(filePath, {showOpenWithDialog: true, mimeType});
    } catch (error) {
      console.log('Error opening file:', error);
    }
  };

  // const openFile = async (filePath) => {
  //   try {
  //     const accessiblePath = `${RNFS.DownloadDirectoryPath}/${Platform.OS === 'android' ? '' : 'Documents/'}${filePath.split('/').pop()}`;
  //     await RNFS.moveFile(filePath, accessiblePath);
  //     await Linking.openURL(`file://${accessiblePath}`);
  //   } catch (error) {
  //     console.log('Error opening file:', error);
  //   }
  // };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>Reports</Text>
          <View style={styles.mainContent}>
            <View style={{flex: 1}}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => setSelectedFileType('pdf')}
                  style={[
                    styles.tabButton,
                    selectedFileType === 'pdf' && styles.selectedTab,
                  ]}>
                  <Text
                    style={[
                      styles.tabText,
                      selectedFileType === 'pdf' && styles.selectedTabText,
                    ]}>
                    PDF
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedFileType('jpeg')}
                  style={[
                    styles.tabButton,
                    selectedFileType === 'jpeg' && styles.selectedTab,
                  ]}>
                  <Text
                    style={[
                      styles.tabText,
                      selectedFileType === 'jpeg' && styles.selectedTabText,
                    ]}>
                    QR
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedFileType('xlsx')}
                  style={[
                    styles.tabButton,
                    selectedFileType === 'xlsx' && styles.selectedTab,
                  ]}>
                  <Text
                    style={[
                      styles.tabText,
                      selectedFileType === 'xlsx' && styles.selectedTabText,
                    ]}>
                    Excel
                  </Text>
                </TouchableOpacity>
              </View>
              <Table borderStyle={{borderWidth: 1, borderColor: '#c8e1ff'}}>
                <Row
                  data={['Name', 'Actions']}
                  style={styles.head}
                  textStyle={styles.text}
                />
              </Table>

              <FlatList
                data={
                  selectedFileType === 'excel'
                    ? excel
                    : selectedFileType === 'xlsx'
                      ? excel
                      : selectedFileType === 'jpeg'
                        ? qrcode
                        : pdfs
                }
                renderItem={renderFileItem}
                keyExtractor={item => item.name}
                contentContainerStyle={{paddingBottom: height * 0.1}}
              />

              <View style={styles.previousButton}>
                <TouchableOpacity
                  onPress={() => props.navigation.navigate('Dashboard')}>
                  <Text style={styles.previousButtonText}>{'<'} Dashboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Background>
    </View>
  );
};

export default Reports;
