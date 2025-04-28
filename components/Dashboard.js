import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Alert,
  Dimensions,
  DrawerLayoutAndroid,
  Switch,
  useColorScheme,
} from 'react-native';
import Background from './Background';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faBars,
  faGear,
  faFilePen,
  faUser,
  faLaptopFile,
  faListDots,
  faComputer,
  faFileText,
  faFileExcel,
  faComputerMouse,
  faFileWaveform,
  faSignOut,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { QC_API } from '../public/config';
import { useTheme } from 'react-native-paper';

library.add(faBars, faCog);

const { width, height } = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const MAIN_CONTENT_HEIGHT = height * 0.96;

const Dashboard = props => {
  const theme = useTheme();
  let drawerRef = null;

  const [projdrop, setprojdrop] = useState([]);
  const [projdropapi, setprojdropapi] = useState([]);
  const [loginData, setLoginData] = useState('');

  const [showSubMenu, setShowSubMenu] = useState(false);

  const [colorScheme, setColorScheme] = useState('light');

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
    subtitle: {
      color: theme.colors.primary,
      fontSize: SUBTITLE_FONT_SIZE,
      fontWeight: 'bold',
      marginBottom: height * 0.02,
    },
    mainContent: {
      backgroundColor: theme.colors.background,
      height: MAIN_CONTENT_HEIGHT,
      width: width * 1,
      borderTopLeftRadius: width * 0.05,
      borderTopRightRadius: width * 0.05,
      padding: width * 0.05,
      alignItems: 'center',
    },
    logoutButton: {
      position: 'absolute',
      top: height * 0.015,
      left: width * 0.05,
    },
    drawerContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: height * 0.03,
    },
    drawerItem: {
      fontSize: SUBTITLE_FONT_SIZE,
      fontWeight: 'bold',
      color: theme.colors.primary,
      padding: height * 0.015,
    },
    drawersubItem: {
      fontSize: SUBTITLE_FONT_SIZE - 3,
      fontWeight: 'bold',
      color: theme.colors.primary,
      padding: height * 0.01,
      paddingLeft: width * 0.04,
    },
    gridContainer: {
      display: 'flex',
      justifyContent: 'center',
      margin: height * 0.05,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      width: width * 0.2,
      height: width * 0.2,
      marginVertical: height * 0.05,
      marginHorizontal: width * 0.05,
      // backgroundColor: 'cyan',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      paddingTop: height * 0.01,
      color: theme.colors.primary,
      fontSize: Math.round(width * 0.03),
      fontWeight: 'bold',
    },
    DashIcon: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      // paddingBottom: height * 0.04,
      padding: height * 0.03,
    },
    drawerIcon: {
      color: 'white',
      fontWeight: 'bold',
      paddingBottom: height * 0.04,
      fontSize: HEADER_FONT_SIZE + 10,
    },
    darkModeSwitchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: width * 0.025,
      marginBottom: height * 0.015,
    },

    darkModeText: {
      fontSize: SUBTITLE_FONT_SIZE,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    userIcon: {
      color: theme.colors.primary,
      fontSize: 50,
      padding: height * 0.025,
    },
    logoutIcon: {
      color: theme.colors.primary,
      fontSize: 50,
      padding: height * 0.015,
    },
    logoutContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginRight: width * 0.1,
    },
  });

  const toggleColorScheme = () => {
    const newColorScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newColorScheme);
  };

  useEffect(() => {
    projData();
    fetchLoginData();
  }, []);

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
              routes: [{ name: 'Home' }],
            });
          },
        },
      ],
      { cancelable: true },
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

  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

  const renderNavigationView = () => {
    return (
      <View style={styles.drawerContainer}>
        {/* <View style={styles.darkModeSwitchContainer}>
          <Text style={styles.darkModeText}>Mode</Text>
          <Switch value={colorScheme === 'dark'} onValueChange={toggleColorScheme} />
        </View> */}
        {/* <TouchableOpacity onPress={toggleSubMenu}>
          <Text style={styles.drawerItem}>Reports</Text>
        </TouchableOpacity>
        {showSubMenu && (
          <View>
            <TouchableOpacity onPress={closeDrawer}>
              <Text style={styles.drawersubItem}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeDrawer}>
              <Text style={styles.drawersubItem}>QR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeDrawer}>
              <Text style={styles.drawersubItem}>Excel</Text>
            </TouchableOpacity>
          </View>
        )} */}
        {/* <TouchableOpacity onPress={Alert.alert('Feature available soon !')}>
          <Text style={styles.drawerItem}>Settings</Text>
        </TouchableOpacity> */}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <FontAwesomeIcon icon={faUser} style={styles.userIcon} />
          <Text style={styles.drawerItem}>{loginData}</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleBackPress()}
          style={styles.logoutContainer}>
          <Text style={styles.drawerItem}>Logout</Text>
          <FontAwesomeIcon icon={faSignOut} style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const fetchLoginData = async () => {
    try {
      const data = await AsyncStorage.getItem('logindata');
      if (data !== null) {
        setLoginData(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openDrawer = () => {
    drawerRef.openDrawer();
  };

  const closeDrawer = () => {
    drawerRef.closeDrawer();
  };

  return (
    <DrawerLayoutAndroid
      ref={ref => (drawerRef = ref)}
      drawerWidth={width * 0.35}
      drawerPosition="left"
      renderNavigationView={renderNavigationView}
      drawerBackgroundColor="rgba(0,0,0,0.5)">
      <View style={styles.container}>
        <Background>
          <View style={styles.background}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => openDrawer()}>
              <FontAwesomeIcon icon={faBars} style={[styles.drawerIcon]} />
            </TouchableOpacity>
            <Text style={styles.header}>Dashboard</Text>
            <View style={styles.mainContent}>
              <Text style={styles.subtitle}></Text>
              {/* <Text style={styles.subtitle}>Welcome, {loginData}</Text> */}
              <View style={styles.gridContainer}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('Form')}>
                    <FontAwesomeIcon icon={faFilePen} style={styles.DashIcon} />
                    <Text style={styles.buttonText}>Form</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('SavedForm')}>
                    <FontAwesomeIcon
                      icon={faFileWaveform}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>Saved Forms</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('ProjectsPage')}>
                    <FontAwesomeIcon
                      icon={faFileText}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>Projects</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('ConfigurationPage')}>
                    <FontAwesomeIcon
                      icon={faCog}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>Configuration</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('ModelType')}>
                    <FontAwesomeIcon
                      icon={faComputerMouse}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>Device Type</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('CheckPoints')}>
                    <FontAwesomeIcon
                      icon={faListDots}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>Check Points</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('Excel')}>
                    <FontAwesomeIcon
                      icon={faFileExcel}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>Excel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('Reports')}>
                    <FontAwesomeIcon
                      icon={faLaptopFile}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>Reports</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('User')}>
                    <FontAwesomeIcon
                      icon={faUser}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>User</Text>
                  </TouchableOpacity>
                </View>

                {/* New Button Row for Role Management */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('RoleManagement')}>
                    <FontAwesomeIcon
                      icon={faGear}
                      style={styles.DashIcon}
                    />
                    <Text style={styles.buttonText}>Role Mgmt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Background>
      </View>
    </DrawerLayoutAndroid>
  );
};

export default Dashboard;