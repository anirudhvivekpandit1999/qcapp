import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  TextInput,
  Button,
  Image,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import DataTable, {COL_TYPES} from 'react-native-datatable-component';
import {request, PERMISSIONS} from 'react-native-permissions';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import Background from './Background';
import {darkRed} from './Constants';
import axios from 'axios';
import {useTheme} from 'react-native-paper';
import {QC_API} from '../public/config';
import XLSX from 'xlsx';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const INPUT_HEADER_FONT_SIZE = Math.round(width * 0.035);
const MAIN_CONTENT_HEIGHT = height * 0.94;

const Excel = props => {
  const theme = useTheme();

  const [excelData, setExcelData] = useState([]);

  const [searchJobID, setSearchJobID] = useState('');

  const [downloadAvailable, setDownloadAvailable] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [showDataTable, setShowDataTable] = useState(false);

  const filteredData = excelData.filter(item =>
    item.jobID.includes(searchJobID),
  );
  const itemsPerPage = 15;
  const totalPages = Math.ceil(excelData.length / itemsPerPage);

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
    text: {
      margin: 6,
      textAlign: 'center',
      color: theme.colors.primary,
    },
    table: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headrow: {
      height: 35,
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      textAlign: 'center',
    },
    headcell: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 5,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
    },
    row: {
      height: 35,
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      textAlign: 'center',
    },
    cell: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      color: theme.colors.primary,
      textAlign: 'left',
      // backgroundColor: theme.colors.background
    },
    scrollView: {
      // width: '100%',
      height: '87%',
      marginTop: height * 0.02,
    },
    select: {
      backgroundColor: theme.colors.tertiary,
      color: theme.colors.primary,
      width: '97%',
    },
    filterContainer: {
      flexDirection: 'row', // Arrange children horizontally
      justifyContent: 'space-between', // Create space between the dropdown and search input
    },
    dropdownContainer: {
      flex: 1, // Take up available space on the left
      marginRight: 25, // Add margin to separate from search input
    },
    searchContainer: {
      flex: 1, // Take up available space on the right
      marginLeft: 8, // Add margin to separate from dropdown
    },
    DashIcon: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      // paddingLeft: height * 0.04,
      // right: width *0.1,
      top: height * 0.002,
      padding: height * 0.015,
    },
    input: {
      color: theme.colors.primary,
      paddingHorizontal: width * 0.03,
      width: '90%',
      // height: '21%',
      backgroundColor: theme.colors.tertiary,
      // marginVertical: height * 0.01,
    },
    button: {
      marginTop: height * 0.02,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    savedFormText: {
      marginTop: height * 0.375,
      fontSize: HEADER_FONT_SIZE - 10,
      color: theme.colors.primary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: MAIN_CONTENT_HEIGHT,
    },
    emptyStateText: {
      fontSize: HEADER_FONT_SIZE - 10,
      textAlign: 'center',
    },
  });

  useEffect(() => {
    requestStoragePermission();
    fetchData();
  }, []);

  useEffect(() => {
    if (excelData.length > 0) {
      setShowDataTable(true);
    } else {
      setShowDataTable(false);
    }
  }, [excelData]);

  const requestStoragePermission = async () => {
    try {
      const permissionStatus = await request(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );
      if (permissionStatus === 'granted') {
      } else {
        console.log('Storage permission denied');
      }
    } catch (error) {
      console.log('Error requesting storage permission:', error);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(QC_API + 'GetFormData', {});
      const excelData = response.data;
      setExcelData(excelData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };

  const handleSearch = () => {
    if (searchJobID) {
      const filtered = excelData.filter(item =>
        item.jobID.includes(searchJobID),
      );
      if (filtered.length > 0) {
        setShowDataTable(true);
        setDownloadAvailable(true);
      } else {
        setDownloadAvailable(false);
      }
    }
  };

  const generateExcelFile = async () => {
    if (filteredData.length === 0) {
      return;
    }
    const directory =
      Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : undefined;
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}_ExcelReport.xlsx`;
    const filePath = `${directory}/${fileName}`;

    if (directory) {
      const directoryExists = await RNFS.exists(directory);
      if (!directoryExists) {
        await RNFS.mkdir(directory);
      }
    }

    const data = filteredData;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});

    RNFS.writeFile(filePath, wbout, 'ascii')
      .then(r => {
        Alert.alert('Excel Downloaded successfully');
      })
      .catch(e => {
        console.log('Error', e);
      });
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>Excel Report</Text>
          <View style={styles.mainContent}>
            <View style={{flex: 1}}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TextInput
                    placeholder="Search by Job ID"
                    value={searchJobID}
                    maxLength={16}
                    placeholderTextColor={theme.colors.primary}
                    onChangeText={text => setSearchJobID(text)}
                    style={styles.input}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    onPress={handleSearch}
                    style={styles.searchButton}>
                    <FontAwesomeIcon icon={faSearch} style={styles.DashIcon} />
                  </TouchableOpacity>
                </View>
                {downloadAvailable && (
                  <View style={styles.button}>
                    <Button
                      title="Download Excel"
                      color={darkRed}
                      onPress={generateExcelFile}
                    />
                  </View>
                )}
                {showDataTable ? (
                  <ScrollView style={styles.scrollView}>
                    <DataTable
                      data={filteredData}
                      stickyHeader={true}
                      noOfPages={totalPages}
                      backgroundColor={theme.colors.tertiary}
                      colNames={[
                        'date',
                        'jobID',
                        'projectName',
                        'kioskSrNo',
                        'cpuSrNo',
                        'cpumacid',
                        'osType',
                        'osVersion',
                        'productKey',
                        'appVersion',
                        'cmmsVersion',
                        'deviceName',
                        'modelType',
                        'firmware_Driver',
                        'deviceSrNo',
                      ]}
                      colSettings={[
                        {name: 'date', type: COL_TYPES.STRING},
                        {name: 'jobID', type: COL_TYPES.STRING},
                        {name: 'projectName', type: COL_TYPES.STRING},
                        {name: 'kioskSrNo', type: COL_TYPES.STRING},
                        {name: 'cpuSrNo', type: COL_TYPES.STRING},
                        {name: 'cpumacid', type: COL_TYPES.STRING},
                        {name: 'osType', type: COL_TYPES.STRING},
                        {name: 'osVersion', type: COL_TYPES.STRING},
                        {name: 'productKey', type: COL_TYPES.STRING},
                        {name: 'appVersion', type: COL_TYPES.STRING},
                        {name: 'cmmsVersion', type: COL_TYPES.STRING},
                        {name: 'deviceName', type: COL_TYPES.STRING},
                        {name: 'modelType', type: COL_TYPES.STRING},
                        {name: 'firmware_Driver', type: COL_TYPES.STRING},
                        {name: 'deviceSrNo', type: COL_TYPES.STRING},
                      ]}>
                      <DataTable.ContentWrapper
                        style={{color: theme.colors.background}}>
                        {filteredData.map((rowData, index) => (
                          <DataTable.Row key={index} style={styles.row}>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.date}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.jobID}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.projectName}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.kioskSrNo}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.cpuSrNo}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.cpumacid}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.osType}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.osVersion}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.productKey}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.appVersion}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.cmmsVersion}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.deviceName}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.modelType}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.firmware_Driver}
                            </DataTable.Cell>
                            <DataTable.Cell style={styles.cell}>
                              {rowData.deviceSrNo}
                            </DataTable.Cell>
                          </DataTable.Row>
                        ))}
                      </DataTable.ContentWrapper>
                    </DataTable>
                  </ScrollView>
                ) : (
                  <Text style={[styles.savedFormText, styles.emptyStateText]}>
                    Please submit a form to display the data here.
                  </Text>
                )}
              </View>
            </View>
            {isLoading && (
              <View style={styles.overlay}>
                <Image
                  source={require('../components/images/loader.gif')}
                  style={styles.loader}
                />
              </View>
            )}
            <View style={styles.previousButton}>
              <TouchableOpacity
                onPress={() => props.navigation.navigate('Dashboard')}>
                <Text style={styles.previousButtonText}>{'<'} Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Background>
    </View>
  );
};

export default Excel;
