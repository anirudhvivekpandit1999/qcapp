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
  Modal,
  StatusBar,
  Image,
  Button,
} from 'react-native';
import Background from './Background';
import {darkRed, red} from './Constants';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faBars,
  faAdd,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
import {QC_API} from '../public/config';
import {useTheme} from 'react-native-paper';

library.add(faBars);

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const MAIN_CONTENT_HEIGHT = height * 0.94;
const BUTTON_FONT_SIZE = Math.round(width * 0.04);

const ProjectName = props => {
  const theme = useTheme();

  const [projdrop, setprojdrop] = useState([]);

  const [selectedProject, setselectedProject] = useState(null);

  const [insprojname, setinsprojname] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isEditModalVisible, setEditModalVisible] = useState(false);

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
    },
    DashIcon: {
      position: 'absolute',
      color: theme.colors.primary,
      fontWeight: 'bold',
      paddingBottom: height * 0.04,
      textAlign: 'center',
      padding: height * 0.02,
      // left: width * 0.83
    },
    tableContainer: {
      marginTop: height * 0.02,
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
      marginRight: width * 0.55, // Adjust the margin for the previous button
      // marginTop: 0.01
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
    projData();
  }, []);

  const insProject = async () => {
    try {
      const response = await axios.post(QC_API + 'InsertProjectName', {
        insProject: insprojname,
      });

      if (response.data.statusCode == '00') {
        setinsprojname('');
        projData();
        setIsModalVisible(false);
        Alert.alert(response.data.statusMessage);
      } else {
        setinsprojname('');
        Alert.alert(response.data.statusMessage);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const projData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(QC_API + 'GetProjectData');
      setprojdrop(
        response.data.map(item => ({
          label: item.projectName,
          value: item.projectName,
          projectId: item.projectId,
        })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async projectId => {
    Alert.alert(
      'Delete Project',
      'Are you sure? This Action will delete all the data related to the project !',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await axios.delete(
                QC_API + 'DeleteProjectName',
                {
                  data: {projectId: projectId},
                },
              );

              if (response.data.statusCode === '00') {
                projData();
                Alert.alert(response.data.statusMessage);
              } else {
                Alert.alert(response.data.statusMessage);
              }
            } catch (error) {
              console.error(error);
              Alert.alert('An error occurred while deleting the project.');
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handleEdit = projectId => {
    const projectToEdit = projdrop.find(item => item.projectId === projectId);
    setselectedProject(projectToEdit);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedProject.label.trim()) {
      Alert.alert('Please enter a Project to update !');
      return;
    }
    try {
      const response = await axios.put(QC_API + 'UpdateProjectName', {
        projectId: selectedProject.projectId,
        insProject: selectedProject.label,
      });

      if (response.data.statusCode === '00') {
        const updatedTableData = projdrop.map(item => {
          if (item.projectId === selectedProject.projectId) {
            return {...item, label: selectedProject.label};
          }
          return item;
        });
        setprojdrop(updatedTableData);

        setEditModalVisible(false);
        setselectedProject(null);
        Alert.alert(response.data.statusMessage);
      } else {
        Alert.alert(response.data.statusMessage);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('An error occurred while saving the project.');
    }
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>Manage Projects</Text>
          <View style={styles.mainContent}>
            <View style={styles.button}>
              <Button
                title="ADD"
                color={darkRed}
                onPress={() => setIsModalVisible(true)}>
                {/* <FontAwesomeIcon icon={faAdd} style={styles.DashIcon} /> */}
              </Button>
            </View>

            <Modal
              animationType="fade"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={() => setIsModalVisible(false)}>
              <StatusBar hidden />
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>ADD NEW PROJECT</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter project name"
                    value={insprojname}
                    maxLength={20}
                    onChangeText={text => {
                      const alphaValue = text.replace(/[^a-zA-Z-. ]/g, '');
                      setinsprojname(alphaValue);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      insProject();
                    }}>
                    <Text style={styles.modalButtonText}>Add Project</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Text style={styles.inputheader}>Projects:</Text>
            <ScrollView style={styles.tableContainer}>
              {projdrop.map(item => (
                <View key={item.projectId} style={styles.tableRow}>
                  <Text style={styles.projectName}>{item.label}</Text>
                  <View style={styles.editDeleteButtons}>
                    <TouchableOpacity
                      onPress={() => handleEdit(item.projectId)}>
                      <FontAwesomeIcon
                        icon={faEdit}
                        size={width * 0.04}
                        style={styles.deleteButton}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.projectId)}>
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

            <Modal
              visible={isEditModalVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setEditModalVisible(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>EDIT PROJECT NAME</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={selectedProject ? selectedProject.label : ''}
                    maxLength={20}
                    onChangeText={text => {
                      setselectedProject(prev => ({...prev, label: text}));
                    }}
                  />
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

export default ProjectName;
