import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import axios from 'axios';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import XLSX from 'xlsx';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { QC_API } from '../public/config';

const { width, height } = Dimensions.get('window');
const HEADER_FONT_SIZE = Math.round(width * 0.05);
const PRIMARY_RED = '#B71C1C';
const ON_PRIMARY = '#FFFFFF';
const ROW_EVEN_BG = '#FDE0DC'; // light red tint for even rows

const Reports = () => {
  const theme = useTheme();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

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
        Alert.alert(
          'Permission required',
          'Storage permission is needed to save reports.'
        );
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
    } catch {
      Alert.alert('Error', 'Could not load devices.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      const wsData = [
        ['Device Name', 'Status'],
        ...devices.map(d => [d.deviceName, d.status || 'Unknown']),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Devices');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const filePath = `${RNFS.DownloadDirectoryPath}/device_report_${Date.now()}.xlsx`;
      await RNFS.writeFile(filePath, wbout, 'base64');
      await FileViewer.open(filePath, { showOpenWithDialog: true });
      Alert.alert('Success', 'Excel report exported successfully');
    } catch {
      Alert.alert('Error', 'Failed to export Excel.');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setExportLoading(true);
      let html = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: ${PRIMARY_RED}; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: ${PRIMARY_RED}; color: ${ON_PRIMARY}; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Device Report</h1>
          <table>
            <tr><th>Device Name</th><th>Status</th></tr>
      `;
      devices.forEach(d => {
        html += `<tr><td>${d.deviceName}</td><td>$\{d.status || 'Unknown'\}</td></tr>`;
      });
      html += `</table></body></html>`;

      const { filePath } = await RNHTMLtoPDF.convert({ html, fileName: `device_report_${Date.now()}`, directory: 'Download' });
      await FileViewer.open(filePath, { showOpenWithDialog: true });
      Alert.alert('Success', 'PDF report exported successfully');
    } catch {
      Alert.alert('Error', 'Failed to export PDF.');
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusColor = status => {
    if (!status) return { bg: theme.colors.surfaceVariant, text: theme.colors.onSurfaceVariant };
    switch (status.toLowerCase()) {
      case 'active': return { bg: '#d4edda', text: '#155724' };
      case 'inactive': return { bg: '#f8d7da', text: '#721c24' };
      case 'maintenance': return { bg: '#fff3cd', text: '#856404' };
      default: return { bg: theme.colors.elevation.level1, text: theme.colors.onSurface };
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index % 2 && { backgroundColor: ROW_EVEN_BG }]}> 
      <Text style={styles.cell}>{item.deviceName}</Text>
      <Text style={[
        styles.statusCell,
        { backgroundColor: getStatusColor(item.status).bg, color: getStatusColor(item.status).text }
      ]}>
        {item.status || 'Unknown'}
      </Text>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: PRIMARY_RED }]}>No devices found</Text>
      <Button
        mode="outlined"
        onPress={fetchDevices}
        style={[styles.refreshButton, { borderColor: PRIMARY_RED }]}
        labelStyle={{ color: PRIMARY_RED }}
      >
        Refresh
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>  
      <View style={[styles.headerContainer, { backgroundColor: PRIMARY_RED }]}>  
        <Text style={[styles.header, { color: ON_PRIMARY }]}>Device Reports</Text>
      </View>
      <View style={[styles.main, { backgroundColor: theme.colors.surface }]}>  
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={[styles.loadingText, { color: theme.colors.placeholder }]}>Loading devices...</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableContainer}>
              <FlatList
                data={devices}
                keyExtractor={d => d.id?.toString() || d.deviceName}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={ListEmptyComponent}
                ListHeaderComponent={() => (
                  <View style={[styles.headerRow, { backgroundColor: PRIMARY_RED }]}>  
                    <Text style={[styles.headerCell, { flex: 1, color: ON_PRIMARY }]}>Name</Text>
                    <Text style={[styles.headerCell, { flex: 1, color: ON_PRIMARY }]}>Status</Text>
                  </View>
                )}
                contentContainerStyle={devices.length === 0 ? { flex: 1 } : null}
              />
            </View>
            <View style={styles.buttons}>
              <Button
                mode="contained"
                onPress={exportToExcel}
                color={PRIMARY_RED}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                disabled={exportLoading || !devices.length}
                loading={exportLoading}
              >Export as Excel</Button>
              <Button
                mode="contained"
                onPress={exportToPDF}
                color={PRIMARY_RED}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                disabled={exportLoading || !devices.length}
                loading={exportLoading}
              >Export as PDF</Button>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingVertical: height * 0.02 },
  header: { fontSize: HEADER_FONT_SIZE, fontWeight: 'bold', textAlign: 'center' },
  main: { flex: 1, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  tableContainer: { flex: 1, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, marginBottom: 20 },
  row: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 15, borderBottomWidth: 1, borderColor: '#ececec', alignItems: 'center' },
  headerRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 15, borderBottomWidth: 2, borderColor: '#ddd' },
  cell: { flex: 1, fontSize: 16 },
  statusCell: { flex: 1, fontSize: 14, fontWeight: '500', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, textAlign: 'center', overflow: 'hidden' },
  headerCell: { fontWeight: 'bold', fontSize: 16 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
  button: { flex: 0.48, borderRadius: 8, paddingVertical: 4, elevation: 2 },
  buttonLabel: { fontSize: 14, fontWeight: 'bold', paddingVertical: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 16, marginBottom: 16 },
  refreshButton: { marginTop: 8 }
});

export default Reports;
 