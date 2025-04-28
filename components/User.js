import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Background from './Background';
import { darkRed } from './Constants';
import { useTheme } from 'react-native-paper';
import axios from 'axios';
import { QC_API } from '../public/config'; // adjust import if needed

const { width, height } = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const MAIN_CONTENT_HEIGHT = height * 0.94;

const User = (props) => {
  const theme = useTheme();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = () => {
    axios
      .get(QC_API + 'GetUsers')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => console.error(error));
  };

  const fetchRoles = () => {
    axios
      .get(QC_API + 'GetRoles')
      .then((response) => {
        setRoles(response.data);
      })
      .catch((error) => console.error(error));
  };

  const addUser = () => {
    if (newUserName.trim() === '' || !selectedRoleId) {
      Alert.alert('Error', 'Username and Role are required.');
      return;
    }
    axios
      .post(QC_API + 'AddUser', { userName: newUserName, roleId: selectedRoleId })
      .then(() => {
        fetchUsers();
        setNewUserName('');
        setSelectedRoleId(null);
      })
      .catch((error) => console.error(error));
  };

  const updateUser = () => {
    if (newUserName.trim() === '' || !selectedRoleId) {
      Alert.alert('Error', 'Username and Role are required.');
      return;
    }
    axios
      .put(QC_API + `UpdateUser/${editingUserId}`, { userName: newUserName, roleId: selectedRoleId })
      .then(() => {
        fetchUsers();
        setNewUserName('');
        setSelectedRoleId(null);
        setEditingUserId(null);
      })
      .catch((error) => console.error(error));
  };

  const deleteUser = (userId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          axios
            .delete(QC_API + `DeleteUser/${userId}`)
            .then(() => fetchUsers())
            .catch((error) => console.error(error));
        },
      },
    ]);
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setNewUserName(user.userName);
    setSelectedRoleId(user.roleId);
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1, alignItems: 'center' },
    header: {
      color: 'white',
      fontSize: HEADER_FONT_SIZE,
      fontWeight: 'bold',
      marginBottom: height * 0.01,
      marginTop: height * 0.01,
    },
    mainContent: {
      backgroundColor: theme.colors.background,
      height: MAIN_CONTENT_HEIGHT,
      width: width,
      borderTopLeftRadius: width * 0.05,
      borderTopRightRadius: width * 0.05,
      padding: width * 0.05,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 10,
      padding: width * 0.03,
      marginBottom: height * 0.02,
      color: theme.colors.primary,
    },
    roleDropdown: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 10,
      padding: width * 0.03,
      marginRight: width * 0.02,
    },
    actionButton: {
      backgroundColor: darkRed,
      padding: width * 0.04,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: height * 0.02,
    },
    actionButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    userItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      padding: width * 0.04,
      borderRadius: 10,
      marginBottom: height * 0.015,
    },
    userText: {
      color: theme.colors.primary,
      fontSize: BUTTON_FONT_SIZE,
    },
    userButtons: {
      flexDirection: 'row',
    },
    editButton: {
      backgroundColor: theme.colors.primary,
      padding: width * 0.02,
      borderRadius: 8,
      marginLeft: width * 0.02,
    },
    editButtonText: {
      color: 'white',
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
  });

  return (
    <View style={styles.container}>
      <Background>
        <View style={styles.background}>
          <Text style={styles.header}>User Management</Text>

          <View style={styles.mainContent}>
            {/* Input Section */}
            <TextInput
              style={styles.input}
              placeholder="Enter Username"
              placeholderTextColor="#aaa"
              value={newUserName}
              onChangeText={setNewUserName}
            />

            {/* Role Selection */}
            <Text style={{ color: theme.colors.primary, marginBottom: 5 }}>Select Role:</Text>
            <FlatList
              data={roles}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roleDropdown,
                    { backgroundColor: selectedRoleId === item.id ? theme.colors.primary : 'transparent' },
                  ]}
                  onPress={() => setSelectedRoleId(item.id)}
                >
                  <Text
                    style={{ color: selectedRoleId === item.id ? 'white' : theme.colors.primary }}
                  >
                    {item.roleName}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Add/Edit Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={editingUserId ? updateUser : addUser}
            >
              <Text style={styles.actionButtonText}>
                {editingUserId ? 'Update User' : 'Add User'}
              </Text>
            </TouchableOpacity>

            {/* List of Users */}
            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <View>
                    <Text style={styles.userText}>{item.userName}</Text>
                    <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
                      {item.roleName}
                    </Text>
                  </View>
                  <View style={styles.userButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => startEditUser(item)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => deleteUser(item.id)}
                    >
                      <Text style={styles.editButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>

          {/* Back Button */}
          <View style={styles.previousButton}>
            <TouchableOpacity onPress={() => props.navigation.navigate('Dashboard')}>
              <Text style={styles.previousButtonText}>{'<'} Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Background>
    </View>
  );
};

export default User;
