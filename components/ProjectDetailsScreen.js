// ProjectDetailsScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faServer, faInfoCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { QC_API } from '../public/config';
import Background from './Background';

const ProjectDetailsScreen = ({ route }) => {
  const { projectId } = route.params;
  const theme = useTheme();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.primary,
    },
    kioskCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
    },
    kioskTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
  });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`${QC_API}/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return (
      <Background>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.header}>{project.name}</Text>
        <ScrollView>
          {project.kiosks.map((kiosk, index) => (
            <View key={index} style={styles.kioskCard}>
              <Text style={styles.kioskTitle}>{kiosk.type} Kiosk</Text>
              
              <View style={styles.detailRow}>
                <FontAwesomeIcon icon={faServer} color={theme.colors.primary} />
                <Text style={{ marginLeft: 8 }}>Device: {kiosk.device}</Text>
              </View>

              <View style={styles.detailRow}>
                <FontAwesomeIcon icon={faInfoCircle} color={theme.colors.primary} />
                <Text style={{ marginLeft: 8 }}>Status: {kiosk.status}</Text>
              </View>

              {kiosk.completed && (
                <View style={styles.detailRow}>
                  <FontAwesomeIcon icon={faCheckCircle} color="green" />
                  <Text style={{ marginLeft: 8, color: 'green' }}>QC Completed</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Background>
  );
};

export default ProjectDetailsScreen;