import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import axios from 'axios';
import { QC_API } from '../public/config';

const { width, height } = Dimensions.get('window');

const HEADER_FONT_SIZE   = Math.round(width * 0.05);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const INPUT_FONT_SIZE    = Math.round(width * 0.04);

const validateRoleName = (name) => {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return 'Role name cannot be empty.';
  }
  if (trimmed.length < 3) {
    return 'Role name must be at least 3 characters.';
  }
  if (trimmed.length > 30) {
    return 'Role name must be at most 30 characters.';
  }
  if (!/^[A-Za-z0-9 _-]+$/.test(trimmed)) {
    return 'Only letters, numbers, spaces, hyphens and underscores are allowed.';
  }
  return null;
};

const RoleManagement = ({ navigation }) => {
  const theme = useTheme();

  const [roles, setRoles]                   = useState([]);
  const [newRole, setNewRole]               = useState('');
  const [editingRoleId, setEditingRoleId]   = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');
  const [searchTerm, setSearchTerm]         = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, status } = await axios.post(QC_API + 'CRUD_Role', {
        operationFlag: 3,
        roleId: 0,
      });
      if (status === 200 && Array.isArray(data.roleList)) {
        // Sort roles alphabetically when fetching
        const sortedRoles = [...data.roleList].sort((a, b) => 
          a.roleName.localeCompare(b.roleName)
        );
        setRoles(sortedRoles);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load roles');
    }
  };

  // Add alphabetical sorting to filtered results
  const filteredRoles = roles
    .filter(r => r.roleName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.roleName.localeCompare(b.roleName));

  const addRole = async () => {
    const error = validateRoleName(newRole);
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
    try {
      const { status } = await axios.post(QC_API + 'CRUD_Role', {
        operationFlag: 0,
        roleName: newRole.trim(),
      });
      if (status === 200) {
        setNewRole('');
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add role');
    }
  };

  const deleteRole = (roleId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this role?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { status } = await axios.post(QC_API + 'CRUD_Role', {
                operationFlag: 2,
                roleId,
              });
              if (status === 200) {
                fetchRoles();
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete role');
            }
          },
        },
      ],
    );
  };

  const updateRole = async () => {
    const error = validateRoleName(editingRoleName);
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
    try {
      const { status } = await axios.post(QC_API + 'CRUD_Role', {
        operationFlag: 1,
        roleId: editingRoleId,
        roleName: editingRoleName.trim(),
      });
      if (status === 200) {
        setEditingRoleId(null);
        setEditingRoleName('');
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update role');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: width * 0.05,
      backgroundColor: theme.colors.background,
    },
    backButton: {
      marginBottom: height * 0.02,
      paddingVertical: height * 0.01,
      paddingHorizontal: width * 0.03,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    backButtonText: {
      color: 'white',
      fontSize: INPUT_FONT_SIZE,
      fontWeight: 'bold',
    },
    header: {
      fontSize: HEADER_FONT_SIZE,
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginBottom: height * 0.02,
      textAlign: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      marginBottom: height * 0.02,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: width * 0.03,
      paddingVertical: height * 0.01,
      color: theme.colors.onBackground,
      fontSize: INPUT_FONT_SIZE,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      padding: width * 0.035,
      borderRadius: 10,
      marginLeft: width * 0.03,
    },
    addButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    searchContainer: {
      marginBottom: height * 0.02,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: width * 0.03,
      paddingVertical: height * 0.01,
      color: theme.colors.onBackground,
      fontSize: INPUT_FONT_SIZE,
    },
    roleItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: width * 0.04,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      marginBottom: height * 0.015,
      alignItems: 'center',
    },
    roleText: {
      fontSize: SUBTITLE_FONT_SIZE,
      color: theme.colors.onSurface,
      flex: 1,
    },
    roleButtons: {
      flexDirection: 'row',
    },
    roleButton: {
      marginLeft: width * 0.03,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: width * 0.03,
      paddingVertical: height * 0.01,
      borderRadius: 8,
    },
    roleButtonText: {
      color: 'white',
      fontSize: INPUT_FONT_SIZE - 2,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Role Management</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newRole}
          onChangeText={setNewRole}
          placeholder="Enter Role Name"
          placeholderTextColor={theme.colors.disabled}
        />
        <TouchableOpacity style={styles.addButton} onPress={addRole}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search roles..."
          placeholderTextColor={theme.colors.disabled}
        />
      </View>

      <ScrollView>
        {filteredRoles.map(item => (
          <View key={item.roleId} style={styles.roleItem}>
            {editingRoleId === item.roleId ? (
              <TextInput
                style={styles.input}
                value={editingRoleName}
                onChangeText={setEditingRoleName}
                placeholder="Edit Role Name"
                placeholderTextColor={theme.colors.disabled}
              />
            ) : (
              <Text style={styles.roleText}>{item.roleName}</Text>
            )}

            <View style={styles.roleButtons}>
              {editingRoleId === item.roleId ? (
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={updateRole}
                >
                  <Text style={styles.roleButtonText}>Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() => {
                    setEditingRoleId(item.roleId);
                    setEditingRoleName(item.roleName);
                  }}
                >
                  <Text style={styles.roleButtonText}>Edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => deleteRole(item.roleId)}
              >
                <Text style={styles.roleButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RoleManagement;