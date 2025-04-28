import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  Image,
  Button,
} from 'react-native';
import Background from './Background';
import {darkRed, red} from './Constants';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  faBars,
  faAdd,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
import {Picker} from '@react-native-picker/picker';
import {QC_API} from '../public/config';
import {useTheme} from 'react-native-paper';

library.add(faBars);

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const MAIN_CONTENT_HEIGHT = height * 0.933;
const BUTTON_FONT_SIZE = Math.round(width * 0.04);

const DeviceType = props => {
  const theme = useTheme();

  const [projdrop, setprojdrop] = useState([]);
  const [devicetype, setdevicetype] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableData1, setTableData1] = useState([]);
  const [projdropapi, setprojdropapi] = useState([]);
  const [selectedprojdrop, setSelectedprojdrop] = useState('');
  const [selectedProjectDevices, setSelectedProjectDevices] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceTypes, setDeviceTypes] = useState([]);

  const [isProjectSelected, setIsProjectSelected] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    background: {
      flex: 1,
      alignItems: 'center',
    },
    projectName: {
      flex: 1,
      color: theme.colors.primary,
      fontSize: Math.round(width * 0.04),
    },
    header: {
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
      borderRadius: width * 0.05,
      padding: width * 0.05,
    },
    logoutButton: {
      position: 'absolute',
      top: height * 0.015,
      left: width * 0.05,
    },
    inputheader: {
      color: theme.colors.primary,
      fontSize: INPUT_HEADER_FONT_SIZE,
      fontWeight: 'bold',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      width: width * 0.08,
      height: width * 0.05,
      left: width * 0.8,
      marginTop: height * 0.01,
    },
    select: {
      backgroundColor: theme.colors.tertiary,
      color: theme.colors.primary,
      width: '97%',
      marginVertical: height * 0.01,
    },
    DashIcon: {
      position: 'absolute',
      color: theme.colors.primary,
      fontWeight: 'bold',
      // paddingBottom: height * 0.04,
      padding: height * 0.02,
      left: width * 0.83,
    },
    tableContainer: {
      marginTop: height * 0.02,
      marginBottom: height * 0.235,
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: height * 0.015,
      paddingVertical: height * 0.01,
      paddingHorizontal: width * 0.02,
      backgroundColor: theme.colors.tertiary,
      borderRadius: width * 0.02,
    },
    editDeleteButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editButton: {
      color: theme.colors.primary,
      marginRight: width * 0.02,
    },
    deleteButton: {
      color: theme.colors.primary,
      marginRight: width * 0.01,
    },
    previousButton: {
      position: 'absolute',
      bottom: height * 0.03, // Adjust as needed
      left: width * 0.03, // Adjust as needed
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.01,
    },
    previousButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
      paddingBottom: height * 0.02,
      paddingTop: height * 0.01,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      width: '80%',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
    modalHeader: {
      fontSize: SUBTITLE_FONT_SIZE,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: height * 0.02,
    },
    modalTextInput: {
      width: '80%',
      height: 40,
      borderColor: theme.colors.primary,
      color: theme.colors.primary,
      borderWidth: 1,
      borderRadius: 5,
      // padding: 8,
      marginBottom: height * 0.02,
    },
    modalButton: {
      backgroundColor: theme.colors.tertiary,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 5,
      marginBottom: 10,
    },
    modalButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  useEffect(() => {
    fetchData();
    projData();
    DeviceData();
    // fetchLoginData();
  }, []);

  useEffect(() => {
    // Fetch device types from the API and update the deviceTypes state
    fetch(QC_API + 'GetDeviceData')
      .then(response => response.json())
      .then(data => setDeviceTypes(data))
      .catch(error => console.error('Error fetching device types:', error));
  }, []);

  const handleProjectChange = async itemValue => {
    if (itemValue !== '--Select--') {
      const selectedProject = projdropapi.find(
        obj => obj.projectName === itemValue,
      );
      try {
        const response = await axios.post(QC_API + 'GetDeviceType', {
          projectid: selectedProject.projectId,
        });
        setSelectedProjectDevices(response.data);
        setIsProjectSelected(true);
        setSelectedprojdrop(itemValue); // Set the selected project name in the state
      } catch (error) {
        console.log(error);
      }
    } else {
      setSelectedProjectDevices([]);
      setIsProjectSelected(false);
      setSelectedprojdrop(itemValue); // Set the selected project name to "--Select--" in the state
    }
  };

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

  const fetchData = async () => {
    setIsLoading(true);
    projectid = await AsyncStorage.getItem('projectid');
    try {
      const response = await axios.post(QC_API + 'GetDeviceType', {
        projectid: projectid,
      });
      setTableData(response.data);
      const response1 = await axios.get(QC_API + 'GetDeviceData');
      setTableData1(response1.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const DeviceData = () => {
    setdevicetype([]);
    setdevicetype(
      tableData1.filter(obj => obj.deviceTypeId).map(obj => obj.deviceName),
    );
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleEdit = device => {
    setSelectedDevice(device);
    setEditModalVisible(true);
  };

  const handleDelete = projectId => {
    Alert.alert(
      'Delete Device',
      'Are you sure? This Action will delete all the data related to that device !',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // Perform API request to delete the project based on the projectId
              await axios.delete(`http://your-api-url/delete/${projectId}`);

              // Update the projdrop state to remove the deleted project
              setprojdrop(prevProjdrop =>
                prevProjdrop.filter(item => item.value !== projectId),
              );
            } catch (error) {
              console.error(error);
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handleSave = async () => {
    try {
      // Perform API request to update the device name based on the selected device
      // await axios.put(`http://your-api-url/update/${selectedDevice.deviceId}`, {
      //   deviceTypeName: selectedDevice.deviceTypeName,
      // });

      // Update the selectedProjectDevices state to reflect the changes
      // setSelectedProjectDevices((prevDevices) =>
      //   prevDevices.map((device) =>
      //     device.value === selectedDevice.value
      //       ? { ...device, deviceTypeName: selectedDevice.deviceTypeName }
      //       : device
      //   )
      // );

      // Close the edit modal
      setEditModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>Manage Devices</Text>
          <View style={styles.mainContent}>
            <View>
              <Text style={styles.inputheader}>Projects:</Text>
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
            </View>

            {isProjectSelected && (
              <View>
                <View style={styles.button}>
                  <Button
                    title="ADD"
                    color={darkRed}
                    onPress={() => setIsModalVisible(true)}
                  />
                </View>
                <Text style={styles.inputheader}>Devices:</Text>
                <ScrollView style={styles.tableContainer}>
                  {selectedProjectDevices.map(device => (
                    <View key={device.value} style={styles.tableRow}>
                      <Text style={styles.projectName}>
                        {device.deviceTypeName}
                      </Text>
                      <View style={styles.editDeleteButtons}>
                        <TouchableOpacity
                          onPress={() => handleEdit(device)}
                          style={styles.editButton}>
                          <FontAwesomeIcon
                            icon={faEdit}
                            size={width * 0.04}
                            style={styles.deleteButton}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(device.value)}>
                          <FontAwesomeIcon
                            icon={faTrash}
                            size={width * 0.04}
                            style={styles.editButton}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <Modal
              animationType="fade"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={toggleModal}>
              <StatusBar hidden />
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>ADD NEW DEVICE</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter device name"
                    maxLength={20}
                    // You can use onChangeText to update the new project name in state
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      // Add logic to save the new project name
                      // Close the modal
                      toggleModal();
                    }}>
                    <Text style={styles.modalButtonText}>Add Device</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={toggleModal}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              visible={isEditModalVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setEditModalVisible(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>EDIT DEVICE</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={selectedDevice?.deviceTypeName}
                    maxLength={20}
                    onChangeText={text =>
                      setSelectedDevice(prevDevice => ({
                        ...prevDevice,
                        deviceTypeName: text,
                      }))
                    }
                  />

                  {/* Render device type options from deviceTypes state */}
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleSave}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setEditModalVisible(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {isLoading && (
              <View style={styles.overlay}>
                {/* <ActivityIndicator size="large" color={darkRed} style={styles.loader} /> */}
                <Image
                  source={require('../components/images/loader.gif')}
                  style={styles.loader}
                />
              </View>
            )}

            <View style={styles.previousButton}>
              <TouchableOpacity
                onPress={() => props.navigation.navigate('Dashboard')}>
                <Text style={styles.previousButtonText}>Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Background>
    </View>
  );
};

export default DeviceType;
