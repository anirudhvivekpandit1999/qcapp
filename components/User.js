import React, { useEffect, useState, useMemo } from 'react';
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
import axios from 'axios';
import { QC_API } from '../public/config';

const { width, height } = Dimensions.get('window');
const HEADER_FONT_SIZE = Math.round(width * 0.05);
const BUTTON_FONT_SIZE = Math.round(width * 0.04);
const MAIN_CONTENT_HEIGHT = height * 0.94;

const buildUrl = (path) => QC_API + path;

// Helper to validate username
const validateUserName = (name) => {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Username cannot be empty.';
  if (trimmed.length < 3) return 'Username must be at least 3 characters.';
  if (trimmed.length > 20) return 'Username must be at most 20 characters.';
  if (!/^[A-Za-z0-9._-]+$/.test(trimmed)) return 'Username can only include letters, numbers, dot, underscore, or hyphen.';
  return null;
};

const UserManagement = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, status } = await axios.post(buildUrl('CRUD_User'), {
        operationFlag: 3,
        userId: 0,
        userName: '',
        password: '',
        isActive: true,
      });
      if (status === 200 && data.userList) {
        // sort alphabetically by userName
        const sorted = [...data.userList].sort((a, b) =>
          a.userName.localeCompare(b.userName)
        );
        setUsers(sorted);
      } else {
        throw new Error('Invalid users response');
      }
    } catch (err) {
      Alert.alert('Error', `Could not load users: ${err.message}`);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, status } = await axios.post(buildUrl('CRUD_Role'), {
        operationFlag: 3,
        roleId: 0,
      });
      if (status === 200 && data.roleList) {
        // sort alphabetically by roleName
        const sorted = [...data.roleList].sort((a, b) =>
          a.roleName.localeCompare(b.roleName)
        );
        setRoles(sorted);
      } else {
        throw new Error('Invalid roles response');
      }
    } catch (err) {
      Alert.alert('Error', `Could not load roles: ${err.message}`);
    }
  };

  const resetForm = () => {
    setNewUserName('');
    setSelectedRoleId(null);
    setEditingUserId(null);
  };

  const addUser = async () => {
    const nameError = validateUserName(newUserName);
    if (nameError) {
      Alert.alert('Validation Error', nameError);
      return;
    }
    if (!selectedRoleId) {
      Alert.alert('Validation Error', 'Please select a role.');
      return;
    }

    try {
      const { data, status } = await axios.post(buildUrl('CRUD_User'), {
        operationFlag: 0,
        userId: 0,
        userName: newUserName.trim(),
        password: `${newUserName.trim()}@123`,
        roleId: selectedRoleId,
        isActive: true,
      });
      if (status === 200) {
        const resp = data.statusResponse?.[0];
        Alert.alert('Success', resp.statusMessage || 'User added');
        fetchUsers();
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', `Failed to add user: ${err.message}`);
    }
  };

  const updateUser = async () => {
    const nameError = validateUserName(newUserName);
    if (nameError) {
      Alert.alert('Validation Error', nameError);
      return;
    }
    if (!selectedRoleId) {
      Alert.alert('Validation Error', 'Please select a role.');
      return;
    }

    try {
      const { data, status } = await axios.post(buildUrl('CRUD_User'), {
        operationFlag: 1,
        userId: editingUserId,
        userName: newUserName.trim(),
        password: `${newUserName.trim()}@123`,
        roleId: selectedRoleId,
        isActive: true,
      });
      if (status === 200) {
        const resp = data.statusResponse?.[0];
        Alert.alert('Success', resp.statusMessage || 'User updated');
        fetchUsers();
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', `Failed to update user: ${err.message}`);
    }
  };

  const deleteUser = (userId) => {
    Alert.alert('Confirm Delete', 'Delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { data, status } = await axios.post(buildUrl('CRUD_User'), {
              operationFlag: 2,
              userId,
              userName: '',
              password: '',
              isActive: true,
            });
            if (status === 200) {
              const resp = data.statusResponse?.[0];
              Alert.alert('Success', resp.statusMessage || 'User deleted');
              fetchUsers();
            }
          } catch (err) {
            Alert.alert('Error', `Failed to delete user: ${err.message}`);
          }
        },
      },
    ]);
  };

  const startEditUser = (user) => {
    setEditingUserId(user.userId);
    setNewUserName(user.userName);
    setSelectedRoleId(user.roleId || null);
  };

  const filteredUsers = useMemo(() => {
    // filter on already sorted users
    return users.filter(u =>
      u.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const renderRole = ({ item }) => (
    <TouchableOpacity
      style={[styles.roleDropdown, { backgroundColor: selectedRoleId === item.roleId ? darkRed : 'transparent' }]}
      onPress={() => setSelectedRoleId(item.roleId)}
    >
      <Text style={{ color: selectedRoleId === item.roleId ? '#fff' : darkRed }}>{item.roleName}</Text>
    </TouchableOpacity>
  );

  const renderUser = ({ item }) => (
    <View style={styles.userItem}>
      <View>
        <Text style={styles.userText}>{item.userName}</Text>
        <Text style={[styles.statusLabel, { color: item.active ? 'green' : 'red' }]}> {item.active ? 'Active' : 'Inactive'}</Text>
      </View>
      <View style={styles.userButtons}>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: darkRed }]} onPress={() => startEditUser(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: darkRed }]} onPress={() => deleteUser(item.userId)}>
          <Text style={styles.editButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Background>
        <Text style={[styles.header, { backgroundColor: darkRed }]}>User Management</Text>
        <View style={styles.mainContent}>
          {/* Add/Edit Form */}
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            placeholderTextColor="#aaa"
            value={newUserName}
            onChangeText={setNewUserName}
          />
          <Text style={[styles.label, { color: darkRed }]}>Select Role:</Text>
          <FlatList
            data={roles}
            keyExtractor={item => item.roleId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderRole}
            style={styles.roleList}
          />
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: darkRed }]}
            onPress={editingUserId ? updateUser : addUser}
          >
            <Text style={styles.actionButtonText}>{editingUserId ? 'Update User' : 'Add User'}</Text>
          </TouchableOpacity>

          {/* Search Bar */}
          <TextInput
            style={styles.input}
            placeholder="Search Users"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* User List */}
          <FlatList
            data={filteredUsers}
            extraData={[filteredUsers, users]}
            keyExtractor={item => item.userId.toString()}
            renderItem={renderUser}
            contentContainerStyle={filteredUsers.length === 0 ? styles.emptyContainer : null}
            ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
          />

          <TouchableOpacity style={styles.previousButton} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.previousButtonText}>← Dashboard</Text>
          </TouchableOpacity>
        </View>
      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    width: '100%',
    textAlign: 'center',
    fontSize: HEADER_FONT_SIZE,
    fontWeight: 'bold',
    color: '#fff',
    paddingVertical: height * 0.02,
  },
  mainContent: {
    backgroundColor: '#fff',
    height: MAIN_CONTENT_HEIGHT,
    width: width,
    borderTopLeftRadius: width * 0.05,
    borderTopRightRadius: width * 0.05,
    padding: width * 0.05,
  },
  input: {
    borderWidth: 1,
    borderColor: darkRed,
    borderRadius: 10,
    padding: width * 0.03,
    marginBottom: height * 0.02,
    color: '#000',
  },
  label: { fontSize: BUTTON_FONT_SIZE, marginBottom: height * 0.01 },
  roleList: { marginBottom: height * 0.02 },
  roleDropdown: {
    borderWidth: 1,
    borderColor: darkRed,
    borderRadius: 10,
    padding: width * 0.03,
    marginRight: width * 0.02,
  },
  actionButton: {
    padding: width * 0.04,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f7f7f7',
    padding: width * 0.04,
    borderRadius: 10,
    marginBottom: height * 0.015,
  },
  userText: { fontSize: BUTTON_FONT_SIZE, color: '#000' },
  statusLabel: { fontSize: 12, marginTop: 4 },
  userButtons: { flexDirection: 'row' },
  editButton: { padding: width * 0.02, borderRadius: 8, marginLeft: width * 0.02 },
  editButtonText: { color: '#fff' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999' },
  previousButton: { position: 'absolute', bottom: height * 0.03, left: width * 0.03 },
  previousButtonText: { color: darkRed, fontWeight: 'bold', fontSize: BUTTON_FONT_SIZE },
});

export default UserManagement;
