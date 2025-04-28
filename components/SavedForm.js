import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Background from './Background';
import {darkRed} from './Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const MAIN_CONTENT_HEIGHT = height * 0.936;

const SavedForm = props => {
  const theme = useTheme();

  const [savedForms, setSavedForms] = useState([]);
  const headerItem = {
    isHeader: true,
    kiosksrno: 'Kiosk SRNo.',
    date: 'Date',
    actions: 'ACTIONS',
  };

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
    scrollView: {
      // width: '100%',
      // marginBottom: height * 0.055,
      // marginTop: height * 0.03,
    },
    previousButton: {
      position: 'absolute',
      bottom: height * 0.03,
      left: width * 0.03,
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.01,
      // backgroundColor: theme.colors.background
    },
    previousButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: BUTTON_FONT_SIZE,
    },
    savedForm: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: theme.colors.tertiary,
      paddingVertical: height * 0.01,
      zIndex: 1,
      backgroundColor: theme.colors.background,
    },
    savedFormText: {
      fontSize: 18,
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
    continueButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 5,
      borderRadius: 5,
    },
    continueButtonText: {
      color: theme.colors.secondary,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  useEffect(() => {
    loadSavedForms();
  }, []);

  const loadSavedForms = async () => {
    try {
      const savedFormsData = await AsyncStorage.getItem('savedForms');
      if (savedFormsData) {
        const parsedSavedForms = JSON.parse(savedFormsData);
        const savedFormsArray = Object.entries(parsedSavedForms).map(
          ([key, value]) => ({
            formId: key,
            formData: value.formData,
            date: value.date,
          }),
        );
        setSavedForms([headerItem, ...savedFormsArray]); // Add the header item
      }
    } catch (error) {
      console.error('Error loading saved forms:', error);
    }
  };

  const continueForm = (formId, formData) => {
    props.navigation.navigate('Form', {
      savedFormId: formId,
      savedFormData: formData,
    });
  };

  const deleteForm = async formId => {
    try {
      Alert.alert(
        'Delete Saved Form !',
        'Are you sure you want to delete this saved form?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              const savedFormsData = await AsyncStorage.getItem('savedForms');
              if (savedFormsData) {
                const parsedSavedForms = JSON.parse(savedFormsData);

                delete parsedSavedForms[formId];

                await AsyncStorage.setItem(
                  'savedForms',
                  JSON.stringify(parsedSavedForms),
                );

                loadSavedForms();
              }
            },
            style: 'destructive',
          },
        ],
      );
    } catch (error) {
      console.error('Error deleting saved form:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>Saved Forms</Text>
          <View style={styles.mainContent}>
            {savedForms.slice(1).length === 0 ? ( // Use slice(1) to exclude the header item
              <View style={styles.emptyState}>
                <Text style={[styles.savedFormText, styles.emptyStateText]}>
                  Please save a form to display here.
                </Text>
              </View>
            ) : (
              <FlatList
                data={savedForms}
                renderItem={({item}) =>
                  item.isHeader ? (
                    <View style={styles.savedForm}>
                      <Text
                        style={[
                          styles.savedFormText,
                          {width: width * 0.27, fontWeight: 'bold'},
                        ]}>
                        {item.kiosksrno}
                      </Text>
                      <Text
                        style={[styles.savedFormText, {fontWeight: 'bold'}]}>
                        {item.date}
                      </Text>
                      <Text
                        style={[styles.savedFormText, {fontWeight: 'bold'}]}>
                        {item.actions}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.savedForm}>
                      <Text
                        style={[
                          styles.savedFormText,
                          {width: width * 0.27, fontWeight: 'bold'},
                        ]}>
                        {item.formData.kiosksrno}
                      </Text>
                      <Text style={styles.savedFormText}>{item.date}</Text>
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.continueButton}
                          onPress={() =>
                            continueForm(item.formId, item.formData)
                          }>
                          <Text style={styles.continueButtonText}>
                            Continue
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.continueButton}
                          onPress={() => deleteForm(item.formId)}>
                          <Text style={styles.continueButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                }
                keyExtractor={item => (item.isHeader ? 'header' : item.formId)}
                style={{marginBottom: height * 0.048}}
                stickySectionHeadersEnabled={true}
                stickyHeaderIndices={[0]}
              />
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

export default SavedForm;
