import React, {useState, useEffect, Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import Background from './Background';
import {darkRed} from './Constants';
import Btn from './Btn';
import {RadioButton, DataTable, TextInput} from 'react-native-paper';
// import Field from './Field';
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from 'react-native-table-component';
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
const buttonWidth = width * 0.5;

const Submit = props => {
  const theme = useTheme();

  const [tableData, setTableData] = useState([]);

  const [CheckBoxArray, setCheckBoxArray] = useState([]);
  const [RemarksArray, setRemarksArray] = useState([]);

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
    scrollView: {
      width: '100%',
      marginBottom: height * 0.01,
      // marginTop: height * 0.03,
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
    pageText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE - 10,
      paddingTop: height * 0.025,
      paddingBottom: height * 0.015,
      right: width * 0.36,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(QC_API + 'GetCheckListData');
      setTableData(Object.values(response.data));
    } catch (error) {
      console.log(error);
    }
  };

  const TABLE_DATA = {
    tableHead: ['Check Points', 'Working', 'Remarks'],
  };

  const Remarks = props => {
    const [remarks, setremarks] = useState('');
    const [isFilled, setIsFilled] = useState(false);

    const handleChanges = itemValue => {
      setremarks(itemValue);
      setIsFilled(itemValue !== '');
      const index = RemarksArray.findIndex(
        data => data.checkPointID === props.checkPointID,
      );

      if (index !== -1) {
        // If the selected device type already exists in the array, update its value
        RemarksArray[index].Remarks = itemValue;
      } else {
        // Otherwise, add a new entry to the array
        RemarksArray.push({
          checkPointID: props.checkPointID,
          Remarks: itemValue,
        });
      }

      //   console.log(RemarksArray);
    };

    return (
      <View style={{minWidth: '100%', alignItems: 'center'}}>
        <TextInput
          style={{
            color: theme.colors.primary,
            padding: 10,
            width: '98%',
            marginVertical: 10,
            borderWidth: 0.5,
            borderColor: isFilled
              ? theme.colors.primary
              : theme.colors.secondary,
            backgroundColor: theme.colors.background,
          }}
          placeholderTextColor={theme.colors.primary}
          textColor={theme.colors.primary}
          placeholder="Type here..."
          autoCapitalize="characters"
          // value={firmware}
          maxLength={29}
          onChangeText={handleChanges.bind(this)}
        />
      </View>
    );
  };

  const CheckBox = props => {
    const [selectedOptions, setSelectedOptions] = useState('');

    const handleChanges = itemValue => {
      setSelectedOptions(itemValue);
      const index = CheckBoxArray.findIndex(
        data => data.checkPointID === props.checkPointID,
      );

      if (index !== -1) {
        // If the selected device type already exists in the array, update its value
        CheckBoxArray[index].Status = itemValue;
      } else {
        // Otherwise, add a new entry to the array
        CheckBoxArray.push({
          checkPointID: props.checkPointID,
          Status: itemValue,
        });
      }

      // console.log(CheckBoxArray);
    };

    return (
      <View>
        {/* {props.options.map((option, index) => ( */}
        <View>
          <RadioButton.Group
            onValueChange={handleChanges.bind(this)}
            value={selectedOptions}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <RadioButton value="Yes" />
              <Text style={{color: theme.colors.primary}}>Yes</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <RadioButton value="No" />
              <Text style={{color: theme.colors.primary}}>No</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <RadioButton value="N/A" />
              <Text style={{color: theme.colors.primary}}>N/A</Text>
            </View>
          </RadioButton.Group>
        </View>
        {/* ))} */}
      </View>
    );
  };

  let ArrayofArray = tableData.map((obj, i) => {
    return [
      obj.checkPointDetails,
      <CheckBox checkPointID={obj.checkPointId} />,
      <Remarks checkPointID={obj.checkPointId} />,
    ];
  });

  const CheckPointsFilter = () => {
    let CheckBoxArrayFilter = [];
    CheckBoxArrayFilter = CheckBoxArray.map(obj => obj);
    let RemarksArrayFilter = [];
    RemarksArrayFilter = RemarksArray.map(obj => obj);

    let CombineArray = tableData.map(obj => {
      let CheckBoxArrayFilter1 = [];
      CheckBoxArrayFilter1 = CheckBoxArrayFilter.filter(obj1 => {
        return obj1.checkPointID === obj.checkPointId;
      });
      let RemarksArrayFilter1 = [];
      RemarksArrayFilter1 = RemarksArrayFilter.filter(obj1 => {
        return obj1.checkPointID === obj.checkPointId;
      });

      if (CheckBoxArrayFilter1) {
        return {
          checkPointDetails: obj.checkPointDetails,
          checkPointID: CheckBoxArrayFilter1.map(obj1 => obj1.checkPointID)[0],
          Status: CheckBoxArrayFilter1.map(obj1 => obj1.Status)[0],
          Remarks: RemarksArrayFilter1.map(obj1 => obj1.Remarks)[0],
        };
      }
    });
    saveData(CombineArray);
    // console.log(CombineArray);

    // try {
    //     AsyncStorage.setItem('CheckPointData', JSON.stringify(CombineArray));
    //     alert('Data saved successfully!');
    // } catch (error) {
    //     alert('Failed to save data.');
    // }
    // console.log(CombineArray);
    // return CombineArray;

    let NAfilteredArray = tableData
      .map(obj => {
        let NACheckBoxArrayFilter1 = [];
        NACheckBoxArrayFilter1 = CheckBoxArrayFilter.filter(obj1 => {
          return obj1.checkPointID === obj.checkPointId;
        });
        let NARemarksArrayFilter1 = [];
        NARemarksArrayFilter1 = RemarksArrayFilter.filter(obj1 => {
          return obj1.checkPointID === obj.checkPointId;
        });

        if (NACheckBoxArrayFilter1) {
          return {
            checkPointDetails: obj.checkPointDetails,
            checkPointID: NACheckBoxArrayFilter1.map(obj1 => obj1.checkPointID),
            Status: NACheckBoxArrayFilter1.map(obj1 => obj1.Status)[0],
            Remarks: NARemarksArrayFilter1.map(obj1 => obj1.Remarks),
          };
        }
      })
      .filter(checkpoint => checkpoint && checkpoint.Status !== 'N/A');

    saveNAData(NAfilteredArray);
    console.log(NAfilteredArray);
  };

  async function saveData(CombineArray) {
    try {
      let chklist = CombineArray.map(obj => {
        return {
          checkPointID: obj.checkPointID,
          status: obj.Status,
          remark: obj.Remarks,
        };
      });
      // console.log(chklist)
      await AsyncStorage.setItem(
        'CheckPointData',
        JSON.stringify(CombineArray),
      );
      await AsyncStorage.setItem('arrayChkList', JSON.stringify(chklist));
      //   alert('Form saved for review!');
    } catch (error) {
      Alert('Failed to save data.');
    }
  }

  async function saveNAData(NAfilteredArray) {
    try {
      let NAchklist = NAfilteredArray.map(obj => {
        return {
          checkPointID: obj.checkPointID[0],
          status: obj.Status,
          remark: obj.Remarks,
        };
      });
      // console.log(chklist)
      await AsyncStorage.setItem(
        'NAfilteredArray',
        JSON.stringify(NAfilteredArray),
      );
      await AsyncStorage.setItem('NAchklist', JSON.stringify(NAchklist));
      //   alert('Form saved for review!');
    } catch (error) {
      Alert('Failed to save data.');
    }
  }

  const Validation = () => {
    if (CheckBoxArray.length === tableData.length) {
      props.navigation.navigate('Review');
    } else {
      Alert.alert(
        '',
        'Please select the status of all the check points !',
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
    }
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>General Check Points</Text>
          <View style={styles.mainContent}>
            <KeyboardAwareScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              enableOnAndroid={true}
              extraScrollHeight={Platform.select({ios: 0, android: 100})}
              keyboardShouldPersistTaps="handled">
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: theme.colors.tertiary,
                }}>
                <Row
                  data={TABLE_DATA.tableHead}
                  style={{height: 40, backgroundColor: theme.colors.tertiary}}
                  textStyle={{
                    height: 40,
                    margin: 6,
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: theme.colors.primary,
                  }}
                  flexArr={[5, 2, 4]}
                />
                <Rows
                  data={ArrayofArray}
                  textStyle={{color: theme.colors.primary}}
                  flexArr={[5, 2, 4]}
                />
              </Table>
            </KeyboardAwareScrollView>

            <TouchableOpacity
              onPress={() => {
                CheckPointsFilter();
                Validation();
              }}
              style={[
                styles.button,
                {backgroundColor: theme.colors.primary, width: buttonWidth},
              ]}>
              <Text
                style={{
                  color: theme.colors.secondary,
                  fontSize: 25,
                  fontWeight: 'bold',
                }}>
                Review
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <View style={styles.previousButton}>
                <TouchableOpacity
                  onPress={() => props.navigation.navigate('Page2')}>
                  <Text style={styles.previousButtonText}>{'<'} Previous</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.pageText}>Page 3/6</Text>
            </View>
          </View>
        </View>
      </Background>
    </View>
  );
};

export default Submit;
