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
      paddingHorizontal: 16,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 20,
    },
    header: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      elevation: 2,
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 24,
      borderRadius: 16,
      width: '90%',
      maxHeight: '80%',
    },
    modalCloseButton: {
      alignSelf: 'flex-end',
      padding: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.placeholder,
      borderRadius: 8,
      padding: 12,
      marginVertical: 10,
      backgroundColor: theme.colors.background,
      fontSize: 16,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: theme.colors.placeholder,
      borderRadius: 8,
      marginVertical: 10,
      overflow: 'hidden',
      backgroundColor: theme.colors.background,
    },
    picker: {
      height: 50,
      width: '100%',
    },
    stepIndicator: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: height * 0.15,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.placeholder,
      textAlign: 'center',
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
      elevation: 2,
    },
    submitButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
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
      case 'active': return { backgroundColor: '#d4edda', color: '#155724' };
      case 'completed': return { backgroundColor: '#d1ecf1', color: '#0c5460' };
      case 'draft': return { backgroundColor: '#fff3cd', color: '#856404' };
      default: return { backgroundColor: '#f8d7da', color: '#721c24' };
    }
  };

  const handleProjectPress = (project) => {
    navigation.navigate('ProjectDetails', { projectId: project.id, kiosks: project.kiosks || [] });
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
    } catch {
      Alert.alert('Error', 'Failed to fetch devices');
    }
  };

  const handleDeviceSelect = (deviceId) => { setDevice(deviceId); setCurrentStep(3); };

  const handleFormSubmit = async () => {
    try {
      await axios.post(`${QC_API}/projects`, { kioskType, device, ...formData });
      setModalVisible(false);
      getProjectList();
    } catch {
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
              <Picker selectedValue={kioskType} onValueChange={handleKioskSelect} style={styles.picker}>
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
              <Picker selectedValue={device} onValueChange={handleDeviceSelect} style={styles.picker}>
                <Picker.Item label="Select Device" value="" />
                {deviceList.map(dev => <Picker.Item key={dev.id} label={dev.name} value={dev.id} />)}
              </Picker>
            </View>
          </View>
        );
      case 3:
        return (
          <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.stepIndicator}>Step 3/3: QC Information</Text>
            <TextInput style={styles.input} placeholder="Job ID" value={formData.jobId} onChangeText={text => setFormData({...formData, jobId: text})} />
            <TextInput style={styles.input} placeholder="Design Reference Number" value={formData.designRefNo} onChangeText={text => setFormData({...formData, designRefNo: text})} />
            <View style={styles.pickerContainer}>
              <Picker selectedValue={formData.osType} onValueChange={value => setFormData({...formData, osType: value})} style={styles.picker}>
                <Picker.Item label="Select OS Type" value="" />
                <Picker.Item label="Windows 10 LTSC" value="Windows 10 LTSC" />
                <Picker.Item label="Windows 10 Pro" value="Windows 10 Pro" />
              </Picker>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
              <Text style={styles.submitButtonText}>Submit Project</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        );
      default:
        return null;
    }
  };

  const renderProjectCard = (project) => (
    <TouchableOpacity key={project.id} style={styles.card} onPress={() => handleProjectPress(project)}>
      <Text style={[styles.header, { fontSize: 18 }]}>{project.name}</Text>
      <View style={[styles.statusIndicator, getStatusStyle(project.status)]}>
        <Text style={[styles.statusText, { color: getStatusStyle(project.status).color }]}>{project.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Projects</Text>
        <TouchableOpacity style={styles.button} onPress={handleAddProject}>
          <Text style={styles.buttonText}>New Project</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: height * 0.2 }} />
      ) : projectList.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No projects found{"\n"}Create a new project to get started</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {projectList.map(renderProjectCard)}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text>Close</Text>
            </TouchableOpacity>
            {renderModalContent()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProjectsPage;
