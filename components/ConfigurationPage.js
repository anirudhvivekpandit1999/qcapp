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
    TextInput,
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

    // Search states
    const [searchQueryDevice, setSearchQueryDevice] = useState('');
    const [searchQueryModel, setSearchQueryModel] = useState('');
    const [searchQueryCheckpoint, setSearchQueryCheckpoint] = useState('');

    // Device List States
    const [deviceList, setDeviceList] = useState([]);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [status, setStatus] = useState('');
    const [editingDeviceId, setEditingDeviceId] = useState(0);
    const [deviceTypeId, setDeviceTypeId] = useState('');

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
        searchInput: {
            borderWidth: 1,
            borderColor: theme.colors.disabled,
            borderRadius: 6,
            padding: 10,
            marginBottom: 10,
            color: theme.colors.onBackground,
            backgroundColor: theme.colors.surface,
        },
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

    // Validation functions
    const validateDeviceInputs = () => {
        if (!deviceName.trim() || !deviceTypeId || !serialNumber.trim() || !status.trim()) {
            Alert.alert('Error', 'All fields are required');
            return false;
        }
        if (!/^\d+$/.test(deviceTypeId)) {
            Alert.alert('Error', 'Device Type ID must be a number');
            return false;
        }
        if (deviceName.length > 50) {
            Alert.alert('Error', 'Device name must be less than 50 characters');
            return false;
        }
        return true;
    };

    const validateModelInputs = () => {
        if (!modelName.trim() || !modelType.trim() || !manufacturer.trim()) {
            Alert.alert('Error', 'All fields are required');
            return false;
        }
        if (!/^[a-zA-Z0-9\s-]+$/.test(modelName)) {
            Alert.alert('Error', 'Model name contains invalid characters');
            return false;
        }
        if (manufacturer.length > 50) {
            Alert.alert('Error', 'Manufacturer name too long');
            return false;
        }
        return true;
    };

    const validateCheckpointInputs = () => {
        if (!checkpointName.trim()) {
            Alert.alert('Error', 'Checkpoint name is required');
            return false;
        }
        if (checkpointName.length > 100) {
            Alert.alert('Error', 'Checkpoint name too long (max 100 chars)');
            return false;
        }
        return true;
    };

    // Sanitization functions
    const sanitizeAlphanumeric = (text) => text.replace(/[^a-zA-Z0-9\s-]/g, '');
    const sanitizeNumbers = (text) => text.replace(/[^0-9]/g, '');

    const fetchData = async () => {
        setLoading(true);
        try {
            switch (activeSection) {
                case 'deviceList': {
                    const deviceResponse = await axios.post(`${QC_API}GetConfigData`);
                    // Alphabetical by deviceName
                    const sortedDevices = (deviceResponse.data.deviceMasterLists || []).sort((a, b) =>
                        (a.deviceName || '').localeCompare(b.deviceName || '')
                    );
                    setDeviceList(sortedDevices);
                    break;
                }
                case 'deviceModels': {
                    const modelResponse = await axios.post(`${QC_API}GetConfigData`);
                    // Dropdown: unique device names, alphabetical
                    const dropDown = (modelResponse.data.deviceMasterLists || [])
                        .filter((device, index, self) =>
                            index === self.findIndex(t => t.deviceName === device.deviceName)
                        )
                        .sort((a, b) => (a.deviceName || '').localeCompare(b.deviceName || ''));
                    setDrop(dropDown);
                    // Device models: alphabetical by deviceTypeName
                    const sortedModels = (modelResponse.data.deviceMasterLists || []).sort((a, b) =>
                        (a.deviceTypeName || '').localeCompare(b.deviceTypeName || '')
                    );
                    setDeviceModels(sortedModels);
                    break;
                }
                case 'checkpoints': {
                    const checkpointResponse = await axios.post(`${QC_API}GetConfigData`);
                    // Alphabetical by checkPointDetails
                    const sortedCheckpoints = (checkpointResponse.data.checkPointMasters || []).sort((a, b) =>
                        (a.checkPointDetails || '').localeCompare(b.checkPointDetails || '')
                    );
                    setCheckpoints(sortedCheckpoints);
                    break;
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Device List Functions
    const handleOpenDeviceModal = (device = null) => {
        if (device) {
            setDeviceName(device.deviceName || '');
            setDeviceTypeId(device.deviceTypeId?.toString() || '');
            setSerialNumber(device.serialNumber || '');
            setStatus(device.status || '');
            setEditingDeviceId(device.deviceId);
        } else {
            resetDeviceForm();
        }
        setIsDeviceModalOpen(true);
    };

    const resetDeviceForm = () => {
        setDeviceName('');
        setDeviceTypeId('');
        setSerialNumber('');
        setStatus('');
        setEditingDeviceId(null);
    };

    const handleCloseDeviceModal = () => {
        setIsDeviceModalOpen(false);
        resetDeviceForm();
    };

    const handleSaveDevice = async () => {
        if (!validateDeviceInputs()) return;

        try {
            const payload = {
                operationFlag: editingDeviceId ? 1 : 0,
                deviceId: editingDeviceId || 0,
                deviceName: deviceName.trim(),
                deviceTypeId: parseInt(deviceTypeId),
                serialNumber: serialNumber.trim(),
                status: status.trim()
            };

            const { data, status: resStatus } = await axios.post(`${QC_API}CRUD_DeviceMaster`, payload);
            if (resStatus === 200) {
                Alert.alert('Success', data.statusResponse?.[0]?.statusMessage || 'Operation successful');
                fetchData();
                handleCloseDeviceModal();
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save device');
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this device?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const result = await axios.post(`${QC_API}CRUD_DeviceMaster`, { 
                                operationFlag: 2, 
                                deviceId: parseInt(deviceId) 
                            });
                            if (result.status === 200) {
                                Alert.alert('Success', 'Device deleted successfully');
                                fetchData();
                            }
                        } catch (error) {
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
            setModelName(model.deviceName || '');
            setModelType(model.deviceTypeId?.toString() || '');
            setManufacturer(model.manufacturer || '');
            setEditingModelId(model.deviceId);
        } else {
            resetModelForm();
        }
        setIsModelModalOpen(true);
    };

    const resetModelForm = () => {
        setModelName('');
        setModelType('');
        setManufacturer('');
        setEditingModelId(null);
    };

    const handleCloseModelModal = () => {
        setIsModelModalOpen(false);
        resetModelForm();
    };

    const handleSaveModel = async () => {
        if (!validateModelInputs()) return;

        try {
            const payload = {
                operationFlag: editingModelId ? 1 : 0,
                deviceId: editingModelId || 0,
                deviceName: modelName.trim(),
                deviceTypeId: parseInt(modelType),
                manufacturer: manufacturer.trim()
            };

            const { data, status: resStatus } = await axios.post(`${QC_API}CRUD_DeviceTypeMaster`, payload);
            if (resStatus === 200) {
                Alert.alert('Success', data.statusResponse?.[0]?.statusMessage || 'Operation successful');
                fetchData();
                handleCloseModelModal();
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save model');
        }
    };

    const handleDeleteModel = async (modelId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this model?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const result = await axios.post(`${QC_API}CRUD_DeviceTypeMaster`, {
                                operationFlag: 2,
                                deviceId: modelId
                            });
                            if (result.status === 200) {
                                Alert.alert('Success', 'Model deleted successfully');
                                fetchData();
                            }
                        } catch (error) {
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
        if (checkpoint) {
            setCheckpointName(checkpoint.checkPointDetails || '');
            setCategory(checkpoint.category || '');
            setDescription(checkpoint.description || '');
            setEditingCheckpointId(checkpoint.checkPointId);
        } else {
            resetCheckpointForm();
        }
        setIsCheckpointModalOpen(true);
    };

    const resetCheckpointForm = () => {
        setCheckpointName('');
        setCategory('');
        setDescription('');
        setEditingCheckpointId(null);
    };

    const handleCloseCheckpointModal = () => {
        setIsCheckpointModalOpen(false);
        resetCheckpointForm();
    };

    const handleSaveCheckpoint = async () => {
        if (!validateCheckpointInputs()) return;

        try {
            const payload = {
                operationFlag: editingCheckpointId ? 1 : 0,
                checkPointId: editingCheckpointId || 0,
                checkPointDetails: checkpointName.trim(),
                category: category.trim(),
                description: description.trim()
            };

            const { data, status: resStatus } = await axios.post(`${QC_API}CRUD_CheckPoints`, payload);
            if (resStatus === 200) {
                Alert.alert('Success', data.statusResponse?.[0]?.statusMessage || 'Operation successful');
                fetchData();
                handleCloseCheckpointModal();
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save checkpoint');
        }
    };

    const handleDeleteCheckpoint = async (checkpointId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this checkpoint?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const result = await axios.post(`${QC_API}CRUD_CheckPoints`, {
                                operationFlag: 2,
                                checkPointId: checkpointId
                            });
                            if (result.status === 200) {
                                Alert.alert('Success', 'Checkpoint deleted successfully');
                                fetchData();
                            }
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to delete checkpoint');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    // Render Functions
    const renderDeviceList = () => {
        const filteredDevices = deviceList
            .filter((device, index, self) =>
                index === self.findIndex(t => t.deviceName === device.deviceName)
            )
            .filter(device =>
                device.deviceName?.toLowerCase()?.includes(searchQueryDevice.toLowerCase())
            );

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
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search devices..."
                    placeholderTextColor={theme.colors.placeholder}
                    value={searchQueryDevice}
                    onChangeText={setSearchQueryDevice}
                />

                <ScrollView>
                    {filteredDevices.length > 0 ? (
                        filteredDevices.map((device, index) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>{device.deviceName || 'Unknown Device'}</Text>
                                <Text style={styles.cardDescription}>ID: {device.deviceId || 'N/A'}</Text>
                                <Text style={styles.cardDescription}>Type: {device.deviceTypeId || 'N/A'}</Text>
                                <Text style={styles.cardDescription}>Serial: {device.serialNumber || 'N/A'}</Text>
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
                                        onPress={() => handleDeleteDevice(device.deviceId)}
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

                <Modal visible={isDeviceModalOpen} transparent animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingDeviceId ? 'Edit Device' : 'Add New Device'}
                            </Text>
                            <Field
                                placeholder="Device Name"
                                value={deviceName}
                                onChangeText={text => setDeviceName(sanitizeAlphanumeric(text))}
                                maxLength={50}
                            />
                            <Field
                                placeholder="Device Type ID"
                                keyboardType="numeric"
                                value={deviceTypeId}
                                onChangeText={text => setDeviceTypeId(sanitizeNumbers(text))}
                            />
                            <Field
                                placeholder="Serial Number"
                                value={serialNumber}
                                onChangeText={text => setSerialNumber(sanitizeAlphanumeric(text))}
                                maxLength={50}
                            />
                            <Field
                                placeholder="Status"
                                value={status}
                                onChangeText={setStatus}
                                maxLength={20}
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
        const filteredModels = selectedDevice
            ? deviceModels.filter(m => m.deviceName === selectedDevice.deviceName)
            : deviceModels;

        const searchedModels = filteredModels.filter(model =>
            (model.deviceTypeName?.toLowerCase() ?? '').includes(searchQueryModel.toLowerCase())
        );

        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                <Text style={styles.contentTitle}>Device Models</Text>
                <Text style={styles.modalLabel}>Filter by Device Type:</Text>
                <TouchableOpacity
                    style={styles.dropdownToggle}
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <Text style={[styles.dropdownToggleText, !selectedDevice && { color: theme.colors.disabled }]}>
                        {selectedDevice?.deviceName || 'All Devices'}
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

                <TouchableOpacity style={styles.addButton} onPress={handleOpenModelModal}>
                    <FontAwesomeIcon icon={faPlus} color="white" size={16} />
                    <Text style={styles.addButtonText}>Add New Model</Text>
                </TouchableOpacity>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search models..."
                    placeholderTextColor={theme.colors.placeholder}
                    value={searchQueryModel}
                    onChangeText={setSearchQueryModel}
                />

                <ScrollView>
                    {searchedModels.length > 0 ? (
                        searchedModels.map((model, idx) => (
                            <View key={idx} style={styles.card}>
                                <Text style={styles.cardTitle}>{model.deviceTypeName || 'Unknown Model'}</Text>
                                <Text style={styles.cardDescription}>ID: {model.deviceId || 'N/A'}</Text>
                                <Text style={styles.cardDescription}>Type: {model.deviceTypeId || 'N/A'}</Text>
                                <Text style={styles.cardDescription}>Manufacturer: {model.manufacturer || 'N/A'}</Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleOpenModelModal(model)}
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} style={styles.editButton} size={20} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleDeleteModel(model.deviceId)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} style={styles.deleteButton} size={20} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text>No device models found</Text>
                    )}
                </ScrollView>

                <Modal visible={isModelModalOpen} transparent animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingModelId ? 'Edit Model' : 'Add New Model'}
                            </Text>
                            <Field
                                placeholder="Model Name"
                                value={modelName}
                                onChangeText={text => setModelName(sanitizeAlphanumeric(text))}
                                maxLength={50}
                            />
                            <Field
                                placeholder="Model Type"
                                value={modelType}
                                onChangeText={text => setModelType(sanitizeNumbers(text))}
                                keyboardType="numeric"
                            />
                            <Field
                                placeholder="Manufacturer"
                                value={manufacturer}
                                onChangeText={text => setManufacturer(text.slice(0, 50))}
                                maxLength={50}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={handleCloseModelModal}
                                >
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={handleSaveModel}
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
        const filteredCheckpoints = checkpoints.filter(checkpoint =>
            (checkpoint.checkPointDetails?.toLowerCase() ?? '').includes(searchQueryCheckpoint.toLowerCase())
        );

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
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search checkpoints..."
                    placeholderTextColor={theme.colors.placeholder}
                    value={searchQueryCheckpoint}
                    onChangeText={setSearchQueryCheckpoint}
                />

                <ScrollView>
                    {filteredCheckpoints.length > 0 ? (
                        filteredCheckpoints.map((checkpoint, index) => (
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

                <Modal visible={isCheckpointModalOpen} transparent animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingCheckpointId ? 'Edit Checkpoint' : 'Add New Checkpoint'}
                            </Text>
                            <Field
                                placeholder="Checkpoint Name"
                                value={checkpointName}
                                onChangeText={text => setCheckpointName(text.slice(0, 100))}
                                maxLength={100}
                            />
                            <Field
                                placeholder="Category"
                                value={category}
                                onChangeText={setCategory}
                                maxLength={50}
                            />
                            <Field
                                placeholder="Description"
                                value={description}
                                onChangeText={text => setDescription(text.slice(0, 200))}
                                maxLength={200}
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
            case 'deviceList': return renderDeviceList();
            case 'deviceModels': return renderDeviceModels();
            case 'checkpoints': return renderCheckpoints();
            default: return renderDeviceList();
        }
    };

    return (
        <View style={styles.container}>
            <Background>
                <View style={styles.background}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => props.navigation.goBack()}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.header}>Configuration</Text>
                    <View style={styles.mainContent}>
                        <View style={styles.sectionContainer}>
                            {['deviceList', 'deviceModels', 'checkpoints'].map((section) => (
                                <TouchableOpacity
                                    key={section}
                                    style={[
                                        styles.sectionButton,
                                        activeSection === section && styles.activeSection
                                    ]}
                                    onPress={() => setActiveSection(section)}
                                >
                                    <FontAwesomeIcon
                                        icon={
                                            section === 'deviceList' ? faComputer :
                                            section === 'deviceModels' ? faComputerMouse : faListDots
                                        }
                                        style={[
                                            styles.sectionIcon,
                                            activeSection === section && styles.activeSectionIcon
                                        ]}
                                        size={24}
                                    />
                                    <Text style={[
                                        styles.sectionText,
                                        activeSection === section && styles.activeSectionText
                                    ]}>
                                        {section === 'deviceList' ? 'Device List' :
                                         section === 'deviceModels' ? 'Device Models' : 'Checkpoints'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {renderContent()}
                    </View>
                </View>
            </Background>
        </View>
    );
};

export default ConfigurationPage;