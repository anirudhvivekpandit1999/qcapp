import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Background from './Background';
import {darkRed} from './Constants';
import {TextInput} from 'react-native';
import {RadioButton} from 'react-native-paper';
import {Table, Row, Rows, Col} from 'react-native-table-component';
import {Picker} from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QC_API} from '../public/config';
import {useTheme} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.06);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const MAIN_CONTENT_HEIGHT = height * 0.94;

const Page2 = props => {
  const theme = useTheme();

  const [tableData, setTableData] = useState([]);
  const [tableData1, setTableData1] = useState([]);
  // const [devicetype, setdevicetype] = useState([]);

  const [deviceTypeDataArray, setDeviceTypeDataArray] = useState([]);
  const [FirmwareArray, setFirmwareArray] = useState([]);
  const [SRNoArray, setSRNoArray] = useState([]);
  const [RadioArray, setRadioArray] = useState([]);

  const [RadioButtonValid, setRadioButtonValid] = useState([]);

  let projectid;

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
      marginBottom: height * 0.01,
    },
    mainContent: {
      backgroundColor: theme.colors.background,
      height: MAIN_CONTENT_HEIGHT,
      width: width * 1,
      padding: width * 0.01,
      alignItems: 'center',
      marginBottom: height * 0.05, // Add margin to create space between table and buttons
    },
    dropdown: {
      height: 50,
      borderColor: theme.colors.tertiary,
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    scrollView: {
      width: '100%',
      marginBottom: height * 0.01,
      // marginTop: height * 0.03,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      // marginTop: height * 0.01, // Adjust the margin for the button container
    },
    nextButton: {
      position: 'absolute',
      right: width * 0.03,
      // marginLeft: width * 0.5, // Adjust the margin for the next button
    },
    nextButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
      paddingBottom: height * 0.02,
      // paddingTop: height * 0.01,
    },
    previousButton: {
      marginRight: width * 0.5, // Adjust the margin for the previous button
    },
    previousButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
      paddingBottom: height * 0.02,
    },
    pageText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE - 10,
      paddingTop: height * 0.025,
      paddingBottom: height * 0.01,
      right: width * 0.35,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
    }
  };

  const TABLE_DATA = {
    tableHead: [
      'Device List',
      'Status',
      'Model/Type',
      'Firmware/Driver/MAC ',
      'Device SR No.',
    ],
  };

  const DeviceTypeDropdown = deviceTypeID => {
    const dropdownItems = [];
    const deviceNames = tableData1
      .filter(obj => obj.deviceTypeId === deviceTypeID)
      .map(obj => obj.deviceName);

    dropdownItems.push(
      ...deviceNames.map((deviceName, j) => {
        return (
          <Picker.Item
            label={deviceName}
            value={deviceName}
            key={`${deviceTypeID}_${j}`}
          />
        );
      }),
    );
    return dropdownItems;
  };

  const Status = props => {
    const [selectedOptions, setSelectedOptions] = useState(
      props.selectedStatus,
    );

    const handleChanges = itemValue => {
      setSelectedOptions(itemValue);
      updateSelectedStatus(props.deviceTypeID, itemValue);

      setRadioButtonValid(prevArray => [
        ...prevArray.filter(obj => obj.deviceTypeID !== props.deviceTypeID),
        {
          deviceTypeID: props.deviceTypeID,
          Status: itemValue,
        },
      ]);

      // If "N/A" is selected, update the corresponding dropdown, firmware, and SRNo
      if (itemValue === 'N/A') {
        updateSelectedDeviceType(props.deviceTypeID, 'N/A');
        updateSelectedFirmware(props.deviceTypeID, 'N/A');
        updateSelectedSRNo(props.deviceTypeID, 'N/A');
      } else {
        // Clear dropdown, firmware, and SRNo when an option other than "N/A" is selected
        updateSelectedDeviceType(props.deviceTypeID, '');
        updateSelectedFirmware(props.deviceTypeID, '');
        updateSelectedSRNo(props.deviceTypeID, '');
      }
    };

    useEffect(() => {
      // Handle the case where "N/A" is selected and add it to the array
      if (props.selectedStatus === 'N/A') {
        const index = RadioArray.findIndex(
          data => data.deviceTypeID === props.deviceTypeID,
        );

        if (index !== -1) {
          // If "N/A" is not already in the array, add it
          RadioArray.push({
            deviceTypeID: props.deviceTypeID,
            Status: 'N/A',
          });
        }
      }
    }, [props.selectedStatus, props.deviceTypeID]);

    return (
      <View>
        <RadioButton.Group
          onValueChange={handleChanges.bind(this)}
          value={selectedOptions}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <RadioButton value="Working" />
            <Text style={{color: theme.colors.primary}}>Working</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <RadioButton value="Not Working" />
            <Text style={{color: theme.colors.primary}}>Not Working</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <RadioButton value="N/A" />
            <Text style={{color: theme.colors.primary}}>N/A</Text>
          </View>
        </RadioButton.Group>
      </View>
    );
  };

  const DeviceType = props => {
    const [selectedDeviceType, setSelectedDeviceType] = useState('');

    useEffect(() => {
      // Set the selected device type based on the status
      if (props.selectedStatus === 'N/A') {
        setSelectedDeviceType('N/A');
      } else {
        setSelectedDeviceType(getSelectedDeviceType(props.deviceTypeID));
      }
    }, [props.selectedStatus, props.deviceTypeID]);

    const handleChanges = itemValue => {
      setSelectedDeviceType(itemValue);

      updateSelectedDeviceType(props.deviceTypeID, itemValue);

      // If the selected status is "N/A," also update the corresponding firmware and SRNo
      if (props.selectedStatus === 'N/A') {
        updateSelectedFirmware(props.deviceTypeID, 'N/A');
        updateSelectedSRNo(props.deviceTypeID, 'N/A');
      }
    };

    return (
      <View>
        <Picker
          selectedValue={selectedDeviceType}
          onValueChange={itemValue => handleChanges(itemValue)}
          style={{color: theme.colors.primary}}
          enabled={props.selectedDeviceType !== 'N/A'}>
          <Picker.Item label="Select Device name" value="" enabled={false} />
          {DeviceTypeDropdown(props.deviceTypeID)}
        </Picker>
      </View>
    );
  };

  const Firmware = props => {
    const [firmware, setFirmware] = useState(props.selectedFirmware || '');
    const [isFilled, setIsFilled] = useState(!!props.selectedFirmware);

    const handleChanges = itemValue => {
      setFirmware(itemValue);
      setIsFilled(!!itemValue);
    };

    const handleBlur = () => {
      updateSelectedFirmware(props.deviceTypeID, firmware);
    };

    return (
      <View style={{minWidth: '100%', alignItems: 'center'}}>
        <TextInput
          style={{
            color: theme.colors.primary,
            padding: 10,
            width: '98%',
            marginVertical: 10,
            borderColor: isFilled
              ? theme.colors.primary
              : theme.colors.secondary,
            borderWidth: 0.5,
          }}
          editable={props.selectedFirmware === 'N/A' ? false : true}
          placeholderTextColor={theme.colors.primary}
          placeholder="Type here..."
          autoCapitalize="characters"
          maxLength={29}
          value={props.selectedStatus === 'N/A' ? 'N/A' : firmware}
          onChangeText={handleChanges}
          onBlur={handleBlur}
        />
      </View>
    );
  };

  const SRNo = props => {
    const [srno, setSrNo] = useState(props.selectedSRNo || '');
    const [isFilled, setIsFilled] = useState(!!props.selectedSRNo);

    const handleChanges = itemValue => {
      setSrNo(itemValue);
      setIsFilled(!!itemValue);
    };

    const handleBlur = () => {
      updateSelectedSRNo(props.deviceTypeID, srno);
    };

    return (
      <View style={{minWidth: '100%', alignItems: 'center'}}>
        <TextInput
          style={{
            color: theme.colors.primary,
            padding: 10,
            width: '98%',
            marginVertical: 10,
            borderColor: isFilled
              ? theme.colors.primary
              : theme.colors.secondary,
            borderWidth: 0.5,
          }}
          editable={props.selectedSRNo === 'N/A' ? false : true}
          placeholderTextColor={theme.colors.primary}
          placeholder="Type here..."
          autoCapitalize="characters"
          maxLength={29}
          value={props.selectedStatus === 'N/A' ? 'N/A' : srno}
          onChangeText={handleChanges}
          onBlur={handleBlur}
        />
      </View>
    );
  };

  let ArrayofArray2 = tableData.map((obj, i) => {
    const selectedStatus = getSelectedStatus(obj.deviceTypeId);
    const selectedDeviceType = getSelectedDeviceType(obj.deviceTypeId);
    const selectedFirmware = getSelectedFirmware(obj.deviceTypeId);
    const selectedSRNo = getSelectedSRNo(obj.deviceTypeId);

    // Conditionally render components based on the selected status
    let deviceTypeComponent;
    let firmwareComponent;
    let srNoComponent;

    if (selectedStatus === '' || !selectedStatus) {
      deviceTypeComponent = (
        <Picker style={{color: theme.colors.secondary}} enabled={false}>
          <Picker.Item label="Select Device name" value="" enabled={false} />
          {DeviceTypeDropdown(props.deviceTypeID)}
        </Picker>
      );
      firmwareComponent = (
        <TextInput
          style={{
            color: theme.colors.primary,
            padding: 10,
            width: '98%',
            marginVertical: 10,
            borderColor: theme.colors.secondary,
            borderWidth: 0.5,
          }}
          editable={false}
          placeholder="Type here..."
        />
      );
      srNoComponent = (
        <TextInput
          style={{
            color: theme.colors.primary,
            padding: 10,
            width: '98%',
            marginVertical: 10,
            borderColor: theme.colors.secondary,
            borderWidth: 0.5,
          }}
          editable={false}
          placeholder="Type here..."
        />
      );
    } else {
      deviceTypeComponent = (
        <DeviceType
          deviceTypeID={obj.deviceTypeId}
          selectedDeviceType={selectedDeviceType}
        />
      );
      firmwareComponent = (
        <Firmware
          deviceTypeID={obj.deviceTypeId}
          selectedFirmware={selectedFirmware}
        />
      );
      srNoComponent = (
        <SRNo deviceTypeID={obj.deviceTypeId} selectedSRNo={selectedSRNo} />
      );
    }

    return [
      obj.deviceTypeName,
      <Status
        deviceTypeID={obj.deviceTypeId}
        selectedStatus={selectedStatus}
      />,
      deviceTypeComponent,
      firmwareComponent,
      srNoComponent,
    ];
  });

  // Function to get selected status based on deviceTypeID
  function getSelectedStatus(deviceTypeID) {
    // Assuming RadioArray contains the selected status for devices
    const deviceStatus = RadioArray.find(
      data => data.deviceTypeID === deviceTypeID,
    );

    if (deviceStatus) {
      return deviceStatus.Status;
    }

    // Return a default status if the device is not found in RadioArray
    return ''; // You can change this default status as needed
  }

  // Function to update selected Status
  const updateSelectedStatus = (deviceTypeID, status) => {
    setRadioArray(prevArray => {
      const index = prevArray.findIndex(
        data => data.deviceTypeID === deviceTypeID,
      );
      if (index !== -1) {
        const newArray = [...prevArray];
        newArray[index].Status = status;

        // If "N/A" is selected, update the corresponding dropdown, firmware, and SRNo
        if (status === 'N/A') {
          updateSelectedDeviceType(deviceTypeID, 'N/A'); // Update DeviceType to "N/A"
          updateSelectedFirmware(deviceTypeID, 'N/A'); // Update Firmware to "N/A"
          updateSelectedSRNo(deviceTypeID, 'N/A'); // Update SRNo to "N/A"
        }

        return newArray;
      } else {
        return [...prevArray, {deviceTypeID, Status: status}];
      }
    });
  };

  // Function to get selected DeviceType based on deviceTypeID
  function getSelectedDeviceType(deviceTypeID) {
    const deviceTypeData = deviceTypeDataArray.find(
      data => data.deviceTypeID === deviceTypeID,
    );
    return deviceTypeData ? deviceTypeData.DeviceType : '';
  }

  // Function to update selected DeviceType
  const updateSelectedDeviceType = (deviceTypeID, deviceType) => {
    setDeviceTypeDataArray(prevArray => {
      const index = prevArray.findIndex(
        data => data.deviceTypeID === deviceTypeID,
      );
      if (index !== -1) {
        const newArray = [...prevArray];
        newArray[index].DeviceType = deviceType;
        return newArray;
      } else {
        return [...prevArray, {deviceTypeID, DeviceType: deviceType}];
      }
    });
  };

  // Function to get selected firmware based on deviceTypeID
  function getSelectedFirmware(deviceTypeID) {
    const firmwareData = FirmwareArray.find(
      data => data.deviceTypeID === deviceTypeID,
    );
    return firmwareData ? firmwareData.Firmware : '';
  }

  // Function to update selected firmware
  const updateSelectedFirmware = (deviceTypeID, firmware) => {
    setFirmwareArray(prevArray => {
      const index = prevArray.findIndex(
        data => data.deviceTypeID === deviceTypeID,
      );

      if (index !== -1) {
        const newArray = [...prevArray];
        newArray[index].Firmware = firmware;
        return newArray;
      } else {
        return [...prevArray, {deviceTypeID, Firmware: firmware}];
      }
    });
  };

  // Function to get selected SRNo based on deviceTypeID
  function getSelectedSRNo(deviceTypeID) {
    const srNoData = SRNoArray.find(data => data.deviceTypeID === deviceTypeID);
    return srNoData ? srNoData.SRNo : '';
  }

  // Function to update selected SRNo
  const updateSelectedSRNo = (deviceTypeID, srNo) => {
    setSRNoArray(prevArray => {
      const newArray = prevArray.map(data => {
        if (data.deviceTypeID === deviceTypeID) {
          return {...data, SRNo: srNo};
        }
        return data;
      });
      const index = newArray.findIndex(
        data => data.deviceTypeID === deviceTypeID,
      );
      if (index !== -1) {
        return newArray;
      } else {
        return [...newArray, {deviceTypeID, SRNo: srNo}];
      }
    });
  };

  const FilteredDevices = () => {
    let RadioArrayFilter = [];
    RadioArrayFilter = RadioArray.map(obj => obj);
    let SRNoArrayFilter = [];
    SRNoArrayFilter = SRNoArray.map(obj => obj);
    let FirmwareArrayFilter = [];
    FirmwareArrayFilter = FirmwareArray.map(obj => obj);
    let deviceTypeDataArrayFilter = [];
    deviceTypeDataArrayFilter = deviceTypeDataArray.map(obj => obj);

    let CombineArray = tableData.map(obj => {
      let RadioArrayFilter1 = [];
      RadioArrayFilter1 = RadioArrayFilter.filter(obj1 => {
        return obj1.deviceTypeID === obj.deviceTypeId;
      });
      let SRNoArrayFilter1 = [];
      SRNoArrayFilter1 = SRNoArrayFilter.filter(obj1 => {
        return obj1.deviceTypeID === obj.deviceTypeId;
      });
      let FirmwareArrayFilter1 = [];
      FirmwareArrayFilter1 = FirmwareArrayFilter.filter(obj1 => {
        return obj1.deviceTypeID === obj.deviceTypeId;
      });
      let deviceTypeDataArrayFilter1 = [];
      deviceTypeDataArrayFilter1 = deviceTypeDataArrayFilter.filter(obj1 => {
        return obj1.deviceTypeID === obj.deviceTypeId;
      });

      if (RadioArrayFilter1) {
        return {
          deviceName: obj.deviceTypeName,
          deviceTypeID:
            RadioArrayFilter1.length !== 0
              ? RadioArrayFilter1.map(obj1 => obj1.deviceTypeID)[0]
              : '',
          Status:
            RadioArrayFilter1.length !== 0
              ? RadioArrayFilter1.map(obj1 => obj1.Status)[0]
              : '',
          SRNo:
            SRNoArrayFilter1.length !== 0
              ? SRNoArrayFilter1.map(obj1 => obj1.SRNo)[0]
              : '',
          Firmware:
            FirmwareArrayFilter1.length !== 0
              ? FirmwareArrayFilter1.map(obj1 => obj1.Firmware)[0]
              : '',
          DeviceType:
            deviceTypeDataArrayFilter1.length !== 0
              ? deviceTypeDataArrayFilter1.map(obj1 => obj1.DeviceType)[0]
              : '',
        };
      }
    });
    saveData(CombineArray);

    let NAfilteredArray = tableData
      .map(obj => {
        let NARadioArrayFilter1 = RadioArrayFilter.filter(
          obj1 => obj1.deviceTypeID === obj.deviceTypeId,
        );
        let NASRNoArrayFilter1 = SRNoArrayFilter.filter(
          obj1 => obj1.deviceTypeID === obj.deviceTypeId,
        );
        let NAFirmwareArrayFilter1 = FirmwareArrayFilter.filter(
          obj1 => obj1.deviceTypeID === obj.deviceTypeId,
        );
        let NAdeviceTypeDataArrayFilter1 = deviceTypeDataArrayFilter.filter(
          obj1 => obj1.deviceTypeID === obj.deviceTypeId,
        );

        if (NARadioArrayFilter1.length !== 0) {
          return {
            deviceName: obj.deviceTypeName,
            deviceTypeID: NARadioArrayFilter1.map(obj1 => obj1.deviceTypeID)[0],
            Status: NARadioArrayFilter1.map(obj1 => obj1.Status)[0],
            SRNo: NASRNoArrayFilter1.map(obj1 => obj1.SRNo)[0],
            Firmware: NAFirmwareArrayFilter1.map(obj1 => obj1.Firmware)[0],
            DeviceType: NAdeviceTypeDataArrayFilter1.map(
              obj1 => obj1.DeviceType,
            )[0],
          };
        }
      })
      .filter(device => device && device.DeviceType !== 'N/A');

    saveNAData(NAfilteredArray);
    // console.log(NAfilteredArray);
  };

  async function saveData(CombineArray) {
    try {
      let devicelist = CombineArray.map(obj => {
        return {
          deviceID: obj.deviceTypeID,
          isWorking:
            obj.Status === 'Working'
              ? true
              : obj.Status === 'Not Working'
                ? false
                : false,
          firmware_Driver: obj.Firmware,
          deviceSrNo: obj.SRNo,
          modelType: obj.DeviceType,
        };
      });

      await AsyncStorage.setItem(
        'DeviceListData',
        JSON.stringify(CombineArray),
      );
      await AsyncStorage.setItem('arrayDeviceList', JSON.stringify(devicelist));
      // alert('Data saved successfully!');
    } catch (error) {
      Alert.alert('Failed to save data.');
    }
  }

  async function saveNAData(NAfilteredArray) {
    try {
      let NAdevicelist = NAfilteredArray.map(obj => {
        return {
          deviceID: obj.deviceTypeID,
          isWorking:
            obj.Status === 'Working'
              ? true
              : obj.Status === 'Not Working'
                ? false
                : false,
          firmware_Driver: obj.Firmware,
          deviceSrNo: obj.SRNo,
          modelType: obj.DeviceType,
        };
      });

      await AsyncStorage.setItem(
        'NADeviceListData',
        JSON.stringify(NAfilteredArray),
      );
      await AsyncStorage.setItem(
        'NAarrayDeviceList',
        JSON.stringify(NAdevicelist),
      );
      // Alert.alert('Data saved successfully!');
    } catch (error) {
      Alert.alert('Failed to save data.');
    }
  }

  const Validation = () => {
    // Check if any status is not selected
    const hasEmptyStatus = RadioButtonValid.every(
      obj => obj.Status.trim() === '' || obj.Status === 'undefined',
    );

    // Check if any field is empty and not equal to "N/A"
    const hasEmptyFields =
      FirmwareArray.some(
        obj => obj.Firmware.trim() === '' && obj.Status !== 'N/A',
      ) ||
      SRNoArray.some(obj => obj.SRNo.trim() === '' && obj.Status !== 'N/A') ||
      deviceTypeDataArray.some(obj => obj.DeviceType.trim() === '');

    if (hasEmptyStatus || hasEmptyFields) {
      Alert.alert(
        'Details Required!',
        'Please select a status and fill all the details where the status is not "N/A"!',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ],
        {
          cancelable: false,
          style: 'alert',
          titleStyle: {color: 'red'},
        },
      );
    } else {
      // Navigate to the next page only when all statuses are selected and all fields are filled
      props.navigation.navigate('Submit');
    }
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>Device List</Text>
          <View style={styles.mainContent}>
            {/* <ScrollView style={styles.scrollView}> */}
            <KeyboardAwareScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              enableOnAndroid={true}
              extraScrollHeight={Platform.select({ios: 0, android: 160})}
              keyboardShouldPersistTaps="handled">
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: theme.colors.tertiary,
                }}>
                <Row
                  data={TABLE_DATA.tableHead}
                  style={{height: 45, backgroundColor: theme.colors.tertiary}}
                  textStyle={{
                    height: 45,
                    margin: 6,
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: theme.colors.primary,
                  }}
                  flexArr={[1, 2, 4, 2, 2]}
                />
                <Rows
                  data={ArrayofArray2}
                  textStyle={{
                    color: theme.colors.primary,
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                  flexArr={[1, 2, 4, 2, 2]}
                />
              </Table>
            </KeyboardAwareScrollView>
            {/* </ScrollView> */}
            <View style={styles.buttonContainer}>
              <View style={styles.previousButton}>
                <TouchableOpacity
                  onPress={() => props.navigation.navigate('Form')}>
                  <Text style={styles.previousButtonText}>{'<'} Previous</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.pageText}>Page 2/6</Text>
              <View style={styles.nextButton}>
                <TouchableOpacity
                  onPress={() => {
                    FilteredDevices();
                    Validation();
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

export default Page2;
