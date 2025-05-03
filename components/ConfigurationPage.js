import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import Background from './Background';
import axios from 'axios';
import { QC_API } from '../public/config';
import { useTheme } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faComputer,
    faComputerMouse,
    faListDots,
    faPlus,
    faPenToSquare,
    faTrash,
    faTimes,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';
import Field from './Field';

const { width, height } = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const SECTION_TITLE_FONT_SIZE = Math.round(width * 0.035);

const ConfigurationPage = props => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('deviceList');

    // Device List States
    const [deviceList, setDeviceList] = useState([]);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [deviceModel, setDeviceModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [status, setStatus] = useState('');
    const [editingDeviceId, setEditingDeviceId] = useState(null);

    // Device Models States
    const [deviceModels, setDeviceModels] = useState([]);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [modelName, setModelName] = useState('');
    const [modelType, setModelType] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [editingModelId, setEditingModelId] = useState(null);

    // Checkpoints States
    const [checkpoints, setCheckpoints] = useState([]);
    const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
    const [checkpointName, setCheckpointName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [editingCheckpointId, setEditingCheckpointId] = useState(null);
    const [drop, setDrop] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const styles = StyleSheet.create({
        modalLabel: {
            fontSize: 16,
            color: theme.colors.onBackground,
            marginTop: 12,
            marginBottom: 4,
        },
        dropdownToggle: {
            borderWidth: 1,
            borderColor: theme.colors.disabled,
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 4,
        },
        dropdownToggleText: {
            fontSize: 14,
        },
        dropdownList: {
            maxHeight: 150,
            borderWidth: 1,
            borderColor: theme.colors.disabled,
            borderRadius: 6,
            backgroundColor: theme.colors.surface,
            marginBottom: 12,
        },
        dropdownItem: {
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.disabled,
        },
        dropdownItemText: {
            fontSize: 14,
            color: theme.colors.onBackground,
        },
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
            marginBottom: height * 0.01,
            marginTop: height * 0.01,
        },
        mainContent: {
            backgroundColor: theme.colors.background,
            height: height * 0.96,
            width: width * 1,
            borderTopLeftRadius: width * 0.05,
            borderTopRightRadius: width * 0.05,
            padding: width * 0.05,
        },
        backButton: {
            position: 'absolute',
            top: height * 0.015,
            left: width * 0.05,
        },
        backIcon: {
            color: 'white',
            fontSize: HEADER_FONT_SIZE + 10,
        },
        sectionContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: height * 0.02,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.primary,
            paddingBottom: height * 0.02,
        },
        sectionButton: {
            paddingHorizontal: width * 0.03,
            paddingVertical: height * 0.01,
            borderRadius: width * 0.01,
            alignItems: 'center',
        },
        activeSection: {
            backgroundColor: theme.colors.primary,
        },
        sectionText: {
            color: theme.colors.primary,
            fontSize: SECTION_TITLE_FONT_SIZE,
            fontWeight: 'bold',
        },
        activeSectionText: {
            color: 'white',
        },
        contentTitle: {
            color: theme.colors.primary,
            fontSize: SUBTITLE_FONT_SIZE,
            fontWeight: 'bold',
            marginBottom: height * 0.02,
            marginTop: height * 0.02,
        },
        contentContainer: {
            flex: 1,
        },
        card: {
            backgroundColor: '#f9f9f9',
            borderRadius: width * 0.02,
            padding: width * 0.03,
            marginBottom: height * 0.02,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        cardTitle: {
            fontSize: SECTION_TITLE_FONT_SIZE,
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: height * 0.01,
        },
        cardDescription: {
            fontSize: Math.round(width * 0.03),
            color: '#555',
            marginBottom: 4,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        sectionIcon: {
            color: theme.colors.primary,
            marginBottom: height * 0.01,
        },
        activeSectionIcon: {
            color: 'white',
        },
        addButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: width * 0.02,
            padding: width * 0.03,
            alignItems: 'center',
            marginBottom: height * 0.02,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        addButtonText: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: Math.round(width * 0.035),
            marginLeft: width * 0.02,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: width * 0.02,
            padding: width * 0.05,
            width: width * 0.9,
            maxHeight: height * 0.7,
        },
        modalTitle: {
            fontSize: SUBTITLE_FONT_SIZE,
            fontWeight: 'bold',
            marginBottom: height * 0.02,
            color: theme.colors.primary,
            textAlign: 'center',
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: height * 0.03,
        },
        modalButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: width * 0.02,
            padding: width * 0.03,
            alignItems: 'center',
            width: '45%',
        },
        cancelButton: {
            backgroundColor: '#ccc',
        },
        modalButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
        actionButtons: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 8,
        },
        actionButton: {
            marginLeft: 10,
            padding: 5,
        },
        editButton: {
            color: theme.colors.primary,
        },
        deleteButton: {
            color: 'red',
        },
    });

    useEffect(() => {
        fetchData();
    }, [activeSection]);

    const fetchData = async () => {
        setLoading(true);
        try {
            switch (activeSection) {
                case 'deviceList':
                    // Fetch device list
                    console.log(`${QC_API}GetConfigData`);
                    const deviceResponse = await axios.post(`${QC_API}GetConfigData`);
                    console.log(deviceResponse.data.deviceMasterLists);
                    setDeviceList(deviceResponse.data.deviceMasterLists || []);
                    break;
                case 'deviceModels':
                    // Fetch device models
                    const modelResponse = await axios.post(`${QC_API}GetConfigData`);
                    const dropDown = modelResponse.data.deviceMasterLists.length > 0 ?
                        modelResponse.data.deviceMasterLists.filter((device, index, self) =>
                            index === self.findIndex(t => t.deviceName === device.deviceName)
                        )
                        : [];
                    setDrop(dropDown);
                    setDeviceModels(modelResponse.data.deviceMasterLists || []);
                    break;
                case 'checkpoints':
                    // Fetch checkpoints
                    const checkpointResponse = await axios.post(`${QC_API}GetConfigData`);
                    console.log(checkpointResponse.data.checkPointMasters);
                    setCheckpoints(checkpointResponse.data.checkPointMasters || []);
                    break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Device List Functions
    const handleOpenDeviceModal = (device = null) => {
        if (device) {
            setDeviceName(device.deviceName || '');
            setDeviceModel(device.deviceModel || '');
            setSerialNumber(device.serialNumber || '');
            setStatus(device.status || '');
            setEditingDeviceId(device.id);
        } else {
            resetDeviceForm();
            setEditingDeviceId(null);
        }
        setIsDeviceModalOpen(true);
    };

    const resetDeviceForm = () => {
        setDeviceName('');
        setDeviceModel('');
        setSerialNumber('');
        setStatus('');
    };

    const handleCloseDeviceModal = () => {
        setIsDeviceModalOpen(false);
        resetDeviceForm();
    };

    const handleSaveDevice = async () => {
        if (!deviceName || !deviceModel || !serialNumber || !status) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        try {
            const deviceData = {
                deviceName,
                deviceModel,
                serialNumber,
                status,
            };

            let result;
            if (editingDeviceId) {
                // Update existing device
                result = await axios.put(`${QC_API}/UpdateDevice/${editingDeviceId}`, deviceData);
                if (result.status === 200) {
                    Alert.alert('Success', 'Device updated successfully');
                    setDeviceList(prevList =>
                        prevList.map(device =>
                            device.id === editingDeviceId ? { ...device, ...deviceData } : device
                        )
                    );
                }
            } else {
                // Add new device
                result = await axios.post(`${QC_API}/AddDevice`, deviceData);
                if (result.status === 200) {
                    Alert.alert('Success', 'Device added successfully');
                    setDeviceList(prevList => [...prevList, { id: result.data.id, ...deviceData }]);
                }
            }

            handleCloseDeviceModal();
        } catch (error) {
            console.error('Error saving device:', error);
            Alert.alert('Error', error.message || 'Failed to save device');
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this device?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const result = await axios.delete(`${QC_API}/DeleteDevice/${deviceId}`);
                            if (result.status === 200) {
                                Alert.alert('Success', 'Device deleted successfully');
                                setDeviceList(prevList => prevList.filter(device => device.id !== deviceId));
                            }
                        } catch (error) {
                            console.error('Error deleting device:', error);
                            Alert.alert('Error', error.message || 'Failed to delete device');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    // Device Model Functions
    const handleOpenModelModal = (model = null) => {
        if (model) {
            setModelName(model.modelName || '');
            setModelType(model.modelType || '');
            setManufacturer(model.manufacturer || '');
            setEditingModelId(model.id);
        } else {
            resetModelForm();
            setEditingModelId(null);
        }
        setIsModelModalOpen(true);
    };

    const resetModelForm = () => {
        setModelName('');
        setModelType('');
        setManufacturer('');
    };

    const handleCloseModelModal = () => {
        setIsModelModalOpen(false);
        resetModelForm();
    };

    const handleSaveModel = async () => {
        if (!modelName || !modelType || !manufacturer) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        try {
            const modelData = {
                modelName,
                modelType,
                manufacturer,
            };

            let result;
            if (editingModelId) {
                // Update existing model
                result = await axios.put(`${QC_API}/UpdateModelType/${editingModelId}`, modelData);
                if (result.status === 200) {
                    Alert.alert('Success', 'Model updated successfully');
                    setDeviceModels(prevList =>
                        prevList.map(model =>
                            model.id === editingModelId ? { ...model, ...modelData } : model
                        )
                    );
                }
            } else {
                // Add new model
                result = await axios.post(`${QC_API}/AddModelType`, modelData);
                if (result.status === 200) {
                    Alert.alert('Success', 'Model added successfully');
                    setDeviceModels(prevList => [...prevList, { id: result.data.id, ...modelData }]);
                }
            }

            handleCloseModelModal();
        } catch (error) {
            console.error('Error saving model:', error);
            Alert.alert('Error', error.message || 'Failed to save model');
        }
    };

    const handleDeleteModel = async (modelId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this model?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const result = await axios.delete(`${QC_API}/DeleteModelType/${modelId}`);
                            if (result.status === 200) {
                                Alert.alert('Success', 'Model deleted successfully');
                                setDeviceModels(prevList => prevList.filter(model => model.id !== modelId));
                            }
                        } catch (error) {
                            console.error('Error deleting model:', error);
                            Alert.alert('Error', error.message || 'Failed to delete model');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    // Checkpoint Functions
    const handleOpenCheckpointModal = (checkpoint = null) => {
        console.log(checkpoint);
        if (checkpoint) {
            setCategory(checkpoint.categoryName || '');
            setCategory(checkpoint.category || '');
            setDescription(checkpoint.description || '');
            setEditingCheckpointId(checkpoint.id);
        } else {
            resetCheckpointForm();
            setEditingCheckpointId(null);
        }
        setIsCheckpointModalOpen(true);
    };

    const resetCheckpointForm = () => {
        setCheckpointName('');
        setCategory('');
        setDescription('');
    };

    const handleCloseCheckpointModal = () => {
        setIsCheckpointModalOpen(false);
        resetCheckpointForm();
    };

    const handleSaveCheckpoint = async () => {

        // Add new checkpoint
        console.log(checkpointName);

        result = await axios.post(`${QC_API}CRUD_CheckPoints`, { operationFlag: 0, checkPointDetails: checkpointName });
        console.log(result.status, "", result.data);
        if (result.status === 200) {
            Alert.alert('Success', 'Checkpoint added successfully');
            fetchData();
        }


        handleCloseCheckpointModal();

    };


    const handleEditCheckpoint = async (checkpointId, updatedName) => {
        try {
            console.log('Editing checkpoint', checkpointId, updatedName);
            const result = await axios.post(`${QC_API}CRUD_CheckPoints`, {
                operationFlag: 1,            // 1 = update
                checkPointId: checkpointId,  // which checkpoint to edit
                checkPointDetails: updatedName
            });

            console.log(result.status, result.data);
            if (result.status === 200) {
                Alert.alert('Success', 'Checkpoint updated successfully');
                fetchData();                // re-fetch your list
            } else {
                Alert.alert('Error', 'Unexpected response status: ' + result.status);
            }
        } catch (error) {
            console.error('Failed to edit checkpoint:', error);
            Alert.alert('Error', 'Could not update checkpoint. Please try again.');
        } finally {
            handleCloseCheckpointModal(); // close your edit modal
        }
    };


    const handleDeleteCheckpoint = async (checkpointId) => {
        console.log('Deleting checkpoint', checkpointId);
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this checkpoint?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const result = await axios.post(`${QC_API}CRUD_CheckPoints`, {operationFlag:2 , checkPointId : checkpointId});
                            if (result.status === 200) {
                                Alert.alert('Success', 'Checkpoint deleted successfully');
                                fetchData(); // re-fetch your list
                            }
                        } catch (error) {
                            console.error('Error deleting checkpoint:', error);
                            Alert.alert('Error', error.message || 'Failed to delete checkpoint');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const fetchCheckPoints = async () => {
        try {
            const result = await axios.post(`${QC_API}CRUD_CheckPoints`, {operationFlag: 3});
            if (result.status === 200) {
                console.log('Checkpoints fetched successfully:', result.data);
            }
        } catch (error) {
            console.error('Error fetching checkpoints:', error);
            Alert.alert('Error', error.message || 'Failed to fetch checkpoints');
        }
    }
    fetchCheckPoints();

    // Render Functions
    const renderDeviceList = () => {
        const uniqueDeviceList = deviceList.length > 0 ?
            deviceList.filter((device, index, self) =>
                index === self.findIndex(t => t.deviceName === device.deviceName)
            )
            : [];
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                <Text style={styles.contentTitle}>Device List</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => handleOpenDeviceModal()}>
                    <FontAwesomeIcon icon={faPlus} color="white" size={16} />
                    <Text style={styles.addButtonText}>Add New Device</Text>
                </TouchableOpacity>
                <ScrollView>
                    {uniqueDeviceList.length > 0 ? (
                        uniqueDeviceList.map((device, index) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>{device.deviceName || 'Unknown Device'}</Text>
                                <Text style={styles.cardDescription}>Model: {device.deviceTypeName || 'N/A'}</Text>
                                <Text style={styles.cardDescription}>Serial: {device.deviceTypeId || 'N/A'}</Text>
                                <Text style={styles.cardDescription}>Status: {device.status || 'Unknown'}</Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleOpenDeviceModal(device)}
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} style={styles.editButton} size={20} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleDeleteDevice(device.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} style={styles.deleteButton} size={20} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text>No devices found</Text>
                    )}
                </ScrollView>

                {/* Device Modal */}
                <Modal
                    visible={isDeviceModalOpen}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={handleCloseDeviceModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingDeviceId ? 'Edit Device' : 'Add New Device'}
                            </Text>
                            <Field
                                placeholder="Device Name"
                                onChangeText={text => {
                                    const alphanumericValue = text.replace(/[^a-zA-Z0-9-@.]/g, '');
                                    setDeviceName(alphanumericValue);
                                }}
                                value={deviceName}
                            />
                            <Field
                                placeholder="Device Model"
                                onChangeText={text => {
                                    const alphanumericValue = text.replace(/[^a-zA-Z0-9-@.]/g, '');
                                    setDeviceModel(alphanumericValue);
                                }}
                                value={deviceModel}
                            />
                            <Field
                                placeholder="Serial Number"
                                onChangeText={text => {
                                    const alphanumericValue = text.replace(/[^a-zA-Z0-9-@.]/g, '');
                                    setSerialNumber(alphanumericValue);
                                }}
                                value={serialNumber}
                            />
                            <Field
                                placeholder="Status"
                                onChangeText={text => {
                                    const alphanumericValue = text.replace(/[^a-zA-Z0-9-@.]/g, '');
                                    setStatus(alphanumericValue);
                                }}
                                value={status}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={handleCloseDeviceModal}
                                >
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={handleSaveDevice}
                                >
                                    <Text style={styles.modalButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    const renderDeviceModels = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }

        // Filter models based on selectedDevice
        const filteredModels = selectedDevice
            ? deviceModels.filter(m => m.deviceName === selectedDevice.deviceName)
            : deviceModels;

        return (
            <View style={styles.contentContainer}>
                <Text style={styles.contentTitle}>Device Models</Text>

                {/* Dropdown for filtering */}
                <Text style={styles.modalLabel}>Filter by Device Type:</Text>
                <TouchableOpacity
                    style={styles.dropdownToggle}
                    onPress={() => setIsDropdownOpen(prev => !prev)}
                >
                    <Text style={[
                        styles.dropdownToggleText,
                        !selectedDevice && { color: theme.colors.disabled }
                    ]}>
                        {selectedDevice ? selectedDevice.deviceName : 'All Devices'}
                    </Text>
                </TouchableOpacity>

                {isDropdownOpen && (
                    <ScrollView style={styles.dropdownList}>
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                                setSelectedDevice(null);
                                setIsDropdownOpen(false);
                            }}
                        >
                            <Text style={styles.dropdownItemText}>All Devices</Text>
                        </TouchableOpacity>
                        {drop.map(d => (
                            <TouchableOpacity
                                key={d.deviceId}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setSelectedDevice(d);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <Text style={styles.dropdownItemText}>{d.deviceName}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleOpenModelModal}
                >
                    <FontAwesomeIcon icon={faPlus} color="white" size={16} />
                    <Text style={styles.addButtonText}>Add New Model</Text>
                </TouchableOpacity>

                <ScrollView>
                    {filteredModels.length > 0 ? (
                        filteredModels.map((model, idx) => (
                            <View key={idx} style={styles.card}>
                                <Text style={styles.cardTitle}>
                                    {model.deviceTypeName || 'Unknown Model'}
                                </Text>
                                <Text style={styles.cardDescription}>
                                    Type: {model.deviceTypeId || 'N/A'}
                                </Text>
                                <Text style={styles.cardDescription}>
                                    Manufacturer: {model.manufacturer || 'N/A'}
                                </Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleOpenModelModal(model)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faPenToSquare}
                                            style={styles.editButton}
                                            size={20}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleDeleteModel(model.id)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            style={styles.deleteButton}
                                            size={20}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text>No device models found</Text>
                    )}
                </ScrollView>

                {/* Model Modal */}
                <Modal
                    visible={isModelModalOpen}
                    transparent
                    animationType="fade"
                    onRequestClose={handleCloseModelModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingModelId ? 'Edit Model' : 'Add New Model'}
                            </Text>

                            <Field
                                placeholder="Model Name"
                                value={modelName}
                                onChangeText={text => {
                                    setModelName(text.replace(/[^a-zA-Z0-9-@.]/g, ''));
                                }}
                            />

                            <Field
                                placeholder="Model Type"
                                value={modelType}
                                onChangeText={text => {
                                    setModelType(text.replace(/[^a-zA-Z0-9-@.]/g, ''));
                                }}
                            />

                            <Field
                                placeholder="Manufacturer"
                                value={manufacturer}
                                onChangeText={text => {
                                    setManufacturer(text.replace(/[^a-zA-Z0-9-@.]/g, ''));
                                }}
                            />

                            {/* Device Selection Dropdown */}
                            <Text style={styles.modalLabel}>Choose Base Device:</Text>
                            <TouchableOpacity
                                style={styles.dropdownToggle}
                                onPress={() => setIsDropdownOpen(prev => !prev)}
                            >
                                <Text style={[
                                    styles.dropdownToggleText,
                                    !selectedDevice && { color: theme.colors.disabled }
                                ]}>
                                    {selectedDevice ? selectedDevice.deviceName : '-- Select Device --'}
                                </Text>
                            </TouchableOpacity>

                            {isDropdownOpen && (
                                <View style={styles.dropdownList}>
                                    {drop.map(d => (
                                        <TouchableOpacity
                                            key={d.deviceId}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setSelectedDevice(d);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>
                                                {d.deviceName}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={handleCloseModelModal}
                                >
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        handleSaveModel({
                                            baseDeviceId: selectedDevice?.deviceId // Send device ID instead of object
                                        });
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };
    const renderCheckpoints = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                <Text style={styles.contentTitle}>Checkpoint Configurations</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => handleOpenCheckpointModal()}>
                    <FontAwesomeIcon icon={faPlus} color="white" size={16} />
                    <Text style={styles.addButtonText}>Add New Checkpoint</Text>
                </TouchableOpacity>
                <ScrollView>
                    {checkpoints.length > 0 ? (
                        checkpoints.map((checkpoint, index) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>{checkpoint.checkPointDetails || 'Unknown Checkpoint'}</Text>
                                <Text style={styles.cardDescription}>Category: {checkpoint.category || 'N/A'}</Text>
                                <Text style={styles.cardDescription}>Description: {checkpoint.description || 'N/A'}</Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleOpenCheckpointModal(checkpoint)}
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} style={styles.editButton} size={20} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleDeleteCheckpoint(checkpoint.checkPointId)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} style={styles.deleteButton} size={20} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text>No checkpoints found</Text>
                    )}
                </ScrollView>

                {/* Checkpoint Modal */}
                <Modal
                    visible={isCheckpointModalOpen}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={handleCloseCheckpointModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingCheckpointId ? 'Edit Checkpoint' : 'Add New Checkpoint'}
                            </Text>
                            <Field
                                placeholder="Checkpoint Name"
                                onChangeText={text => {
                                    const alphanumericValue = text.replace(/[^a-zA-Z0-9-@.]/g, '');
                                    setCheckpointName(alphanumericValue);
                                }}
                                value={checkpointName}
                            />
                            <Field
                                placeholder="Category"
                                onChangeText={text => {
                                    const alphanumericValue = text.replace(/[^a-zA-Z0-9-@.]/g, '');
                                    setCategory(alphanumericValue);
                                }}
                                value={category}
                            />
                            <Field
                                placeholder="Description"
                                onChangeText={text => {
                                    const alphanumericValue = text.replace(/[^a-zA-Z0-9-@.]/g, '');
                                    setDescription(alphanumericValue);
                                }}
                                value={description}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={handleCloseCheckpointModal}
                                >
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={handleSaveCheckpoint}
                                >
                                    <Text style={styles.modalButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'deviceList':
                return renderDeviceList();
            case 'deviceModels':
                return renderDeviceModels();
            case 'checkpoints':
                return renderCheckpoints();
            default:
                return renderDeviceList();
        }
    };

    return (
        <View style={styles.container}>
            <Background>
                <View style={styles.background}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => props.navigation.goBack()}>
                        <FontAwesomeIcon icon={faArrowLeft} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.header}>Configuration</Text>
                    <View style={styles.mainContent}>
                        <View style={styles.sectionContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.sectionButton,
                                    activeSection === 'deviceList' && styles.activeSection,
                                ]}
                                onPress={() => setActiveSection('deviceList')}>
                                <FontAwesomeIcon
                                    icon={faComputer}
                                    style={[
                                        styles.sectionIcon,
                                        activeSection === 'deviceList' && styles.activeSectionIcon
                                    ]}
                                    size={24}
                                />
                                <Text
                                    style={[
                                        styles.sectionText,
                                        activeSection === 'deviceList' && styles.activeSectionText,
                                    ]}>
                                    Device List
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.sectionButton,
                                    activeSection === 'deviceModels' && styles.activeSection,
                                ]}
                                onPress={() => setActiveSection('deviceModels')}>
                                <FontAwesomeIcon
                                    icon={faComputerMouse}
                                    style={[
                                        styles.sectionIcon,
                                        activeSection === 'deviceModels' && styles.activeSectionIcon
                                    ]}
                                    size={24}
                                />
                                <Text
                                    style={[
                                        styles.sectionText,
                                        activeSection === 'deviceModels' && styles.activeSectionText,
                                    ]}>
                                    Device Models
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.sectionButton,
                                    activeSection === 'checkpoints' && styles.activeSection,
                                ]}
                                onPress={() => setActiveSection('checkpoints')}>
                                <FontAwesomeIcon
                                    icon={faListDots}
                                    style={[
                                        styles.sectionIcon,
                                        activeSection === 'checkpoints' && styles.activeSectionIcon
                                    ]}
                                    size={24}
                                />
                                <Text
                                    style={[
                                        styles.sectionText,
                                        activeSection === 'checkpoints' && styles.activeSectionText,
                                    ]}>
                                    Checkpoints
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {renderContent()}
                    </View>
                </View>
            </Background>
        </View>
    );
};

export default ConfigurationPage;