import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import axios from 'axios';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import XLSX from 'xlsx';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Background from './Background';
import { QC_API } from '../public/config';

const { width, height } = Dimensions.get('window');
const HEADER_FONT_SIZE = Math.round(width * 0.05);

const Reports = () => {
  const theme = useTheme();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await requestStoragePermission();
      await fetchDevices();
    })();
  }, []);

  const requestStoragePermission = async () => {
    try {
      const perm = Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ios: PERMISSIONS.IOS.MEDIA_LIBRARY,
      });
      if (!perm) return;

      const status = await request(perm);
      if (status !== RESULTS.GRANTED) {
        Alert.alert('Permission required', 'Storage permission is needed to save reports.');
      }
    } catch (err) {
      console.warn('Permission error', err);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${QC_API}/getDeviceList`);
      setDevices(res.data || []);
    } catch (err) {
      Alert.alert('Error', 'Could not load devices.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      // 1. Build worksheet data
      const wsData = [
        ['Device Name', 'Status'],
        ...devices.map(d => [d.deviceName, d.status || 'Unknown']),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Devices');

      // 2. Write workbook to base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // 3. Save file
      const filePath = `${RNFS.DownloadDirectoryPath}/device_report_${Date.now()}.xlsx`;
      await RNFS.writeFile(filePath, wbout, 'base64');

      // 4. Open it
      await FileViewer.open(filePath, { showOpenWithDialog: true });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to export Excel.');
    }
  };

  const exportToPDF = async () => {
    try {
      // 1. Build HTML table
      let html = `
        <h1 style="text-align:center;">Device Report</h1>
        <table border="1" style="width:100%;border-collapse:collapse;">
          <tr><th>Device Name</th><th>Status</th></tr>
      `;
      devices.forEach(d => {
        html += `<tr>
          <td>${d.deviceName}</td>
          <td>${d.status || 'Unknown'}</td>
        </tr>`;
      });
      html += `</table>`;

      // 2. Convert to PDF
      const { filePath } = await RNHTMLtoPDF.convert({
        html,
        fileName: `device_report_${Date.now()}`,
        directory: 'Download',
      });

      // 3. Open PDF
      await FileViewer.open(filePath, { showOpenWithDialog: true });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to export PDF.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.deviceName}</Text>
      <Text style={styles.cell}>{item.status || 'Unknown'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Background>
        <Text style={styles.header}>Device Reports</Text>
        <View style={styles.main}>
          {loading ? (
            <Text>Loading devices…</Text>
          ) : (
            <FlatList
              data={devices}
              keyExtractor={d => d.id?.toString() || d.deviceName}
              renderItem={renderItem}
              ListHeaderComponent={() => (
                <View style={[styles.row, styles.headerRow]}>
                  <Text style={[styles.cell, styles.headerText]}>Name</Text>
                  <Text style={[styles.cell, styles.headerText]}>Status</Text>
                </View>
              )}
            />
          )}

          <View style={styles.buttons}>
            <Button
              mode="contained"
              onPress={exportToExcel}
              style={styles.button}
            >
              Export as Excel
            </Button>
            <Button
              mode="contained"
              onPress={exportToPDF}
              style={styles.button}
            >
              Export as PDF
            </Button>
          </View>
        </View>
      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    color: 'white',
    fontSize: HEADER_FONT_SIZE,
    fontWeight: 'bold',
    marginVertical: height * 0.015,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerRow: {
    borderBottomWidth: 2,
  },
  cell: {
    flex: 1,
    fontSize: 16,
  },
  headerText: {
    fontWeight: 'bold',
  },
  buttons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 0.45,
  },
});

export default Reports;
