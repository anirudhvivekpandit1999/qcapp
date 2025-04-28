import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Text, useTheme } from "react-native-paper";
import { QC_API } from "../public/config";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faProjectDiagram,
  faPlus,
  faCalendarAlt,
  faInfoCircle,
  faTimes,
  faServer
} from '@fortawesome/free-solid-svg-icons';
import Background from './Background';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get('window');

const ProjectsPage = ({ navigation }) => {
  const theme = useTheme();
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [kioskType, setKioskType] = useState('');
  const [device, setDevice] = useState('');
  const [deviceList, setDeviceList] = useState([]);
  const [formData, setFormData] = useState({
    jobId: '',
    designRefNo: '',
    kioskSrNo: '',
    cpuSrNo: '',
    cpuMacId: '',
    osType: '',
    osActivation: '',
    osVersion: '',
    activationKey: '',
    appVersion: '',
    cmms: '',
    cmmsVersion: ''
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginVertical: height * 0.02,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      elevation: 2,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
      marginVertical: 8,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 8,
      width: '90%',
      maxHeight: '80%',
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.placeholder,
      borderRadius: 4,
      padding: 10,
      marginVertical: 8,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: theme.colors.placeholder,
      borderRadius: 4,
      marginVertical: 8,
      overflow: 'hidden',
    },
    picker: {
      height: 50,
      width: '100%',
      backgroundColor: theme.colors.surface,
    },
    stepIndicator: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 16,
    },
    statusIndicator: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    kioskBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 8,
      borderRadius: 4,
      marginTop: 8,
    },
  });

  useEffect(() => {
    getProjectList();
  }, []);

  const getProjectList = async () => {
    try {
      const response = await axios.get(`${QC_API}/projects`);
      const projectsWithStatus = response.data.map(project => ({
        ...project,
        status: project.kiosks?.length > 0 ? 'Active' : 'Draft'
      }));
      setProjectList(projectsWithStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'completed':
        return { backgroundColor: '#d1ecf1', color: '#0c5460' };
      case 'draft':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      default:
        return { backgroundColor: '#f8d7da', color: '#721c24' };
    }
  };

  const handleProjectPress = (project) => {
    navigation.navigate('ProjectDetails', {
      projectId: project.id,
      kiosks: project.kiosks || []
    });
  };

  const handleAddProject = () => {
    setModalVisible(true);
    setCurrentStep(1);
  };

  const handleKioskSelect = async (type) => {
    setKioskType(type);
    try {
      const response = await axios.get(`${QC_API}/devices?type=${type}`);
      setDeviceList(response.data);
      setCurrentStep(2);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch devices');
    }
  };

  const handleDeviceSelect = (deviceId) => {
    setDevice(deviceId);
    setCurrentStep(3);
  };

  const handleFormSubmit = async () => {
    try {
      await axios.post(`${QC_API}/projects`, {
        kioskType,
        device,
        ...formData
      });
      setModalVisible(false);
      getProjectList();
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const renderModalContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={styles.stepIndicator}>Step 1/3: Select Kiosk Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={kioskType}
                onValueChange={handleKioskSelect}
                style={styles.picker}>
                <Picker.Item label="Select Kiosk Type" value="" />
                <Picker.Item label="PBK" value="PBK" />
                <Picker.Item label="PFK" value="PFK" />
              </Picker>
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepIndicator}>Step 2/3: Select Device</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={device}
                onValueChange={handleDeviceSelect}
                style={styles.picker}>
                <Picker.Item label="Select Device" value="" />
                {deviceList.map(device => (
                  <Picker.Item 
                    key={device.id} 
                    label={device.name} 
                    value={device.id} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        );

      case 3:
        return (
          <KeyboardAwareScrollView>
            <Text style={styles.stepIndicator}>Step 3/3: QC Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Job ID"
              value={formData.jobId}
              onChangeText={text => setFormData({...formData, jobId: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Design Reference Number"
              value={formData.designRefNo}
              onChangeText={text => setFormData({...formData, designRefNo: text})}
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.osType}
                onValueChange={value => setFormData({...formData, osType: value})}
                style={styles.picker}>
                <Picker.Item label="Select OS Type" value="" />
                <Picker.Item label="Windows 10 LTSC" value="Windows 10 LTSC" />
                <Picker.Item label="Windows 10 Pro" value="Windows 10 Pro" />
              </Picker>
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={handleFormSubmit}>
              <Text style={{color: 'white'}}>Submit Project</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        );
    }
  };

  const renderProjectCard = (project) => (
    <TouchableOpacity 
      key={project.id}
      style={styles.card}
      onPress={() => handleProjectPress(project)}>
      <Text style={{fontSize: 16, fontWeight: 'bold'}}>
        {project.name}
      </Text>
      
      <View style={[styles.statusIndicator, getStatusStyle(project.status)]}>
        <Text style={[styles.statusText, { color: getStatusStyle(project.status).color }]}>
          {project.status}
        </Text>
      </View>

      <View style={{flexDirection: 'row', marginTop: 8}}>
        <FontAwesomeIcon icon={faCalendarAlt} color={theme.colors.primary} />
        <Text style={{marginLeft: 8}}>
          {new Date(project.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {project.kiosks?.length > 0 && (
        <View style={styles.kioskBadge}>
          <FontAwesomeIcon 
            icon={faServer} 
            size={14} 
            color={theme.colors.primary} 
            style={{marginRight: 8}}
          />
          <Text>
            {project.kiosks.length} Kiosk{project.kiosks.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Background>
      <View style={styles.container}>
        <View style={{padding: 16}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.header}>My Projects</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddProject}>
              <FontAwesomeIcon icon={faPlus} color="white" />
              <Text style={{color: 'white', marginLeft: 8}}>New Project</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : projectList.length === 0 ? (
            <View style={{alignItems: 'center', marginTop: 40}}>
              <FontAwesomeIcon 
                icon={faProjectDiagram} 
                size={60} 
                color={theme.colors.placeholder} 
              />
              <Text style={{marginTop: 16}}>No projects found</Text>
            </View>
          ) : (
            <ScrollView>
              {projectList.map(renderProjectCard)}
            </ScrollView>
          )}
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={{alignSelf: 'flex-end'}}
                onPress={() => setModalVisible(false)}>
                <FontAwesomeIcon icon={faTimes} size={24} />
              </TouchableOpacity>
              
              {renderModalContent()}
            </View>
          </View>
        </Modal>
      </View>
    </Background>
  );
};

export default ProjectsPage;