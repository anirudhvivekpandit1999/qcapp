import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import axios from 'axios';
import { QC_API } from '../public/config'; // Adjust if your config path is different

const { width, height } = Dimensions.get('window');

const HEADER_FONT_SIZE = Math.round(width * 0.05);
const SUBTITLE_FONT_SIZE = Math.round(width * 0.04);
const INPUT_FONT_SIZE = Math.round(width * 0.04);

const RoleManagement = ({ navigation }) => {
  const theme = useTheme();
  
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    axios
      .get(QC_API + 'GetRoles')
      .then(response => {
        setRoles(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const addRole = () => {
    if (newRole.trim() === '') {
      Alert.alert('Error', 'Role name cannot be empty');
      return;
    }
    axios
      .post(QC_API + 'AddRole', { roleName: newRole })
      .then(() => {
        fetchRoles();
        setNewRole('');
      })
      .catch(error => {
        console.error(error);
      });
  };

  const deleteRole = (roleId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this role?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            axios
              .delete(QC_API + `DeleteRole/${roleId}`)
              .then(() => {
                fetchRoles();
              })
              .catch(error => {
                console.error(error);
              });
          },
        },
      ],
    );
  };

  const updateRole = () => {
    if (editingRoleName.trim() === '') {
      Alert.alert('Error', 'Role name cannot be empty');
      return;
    }
    axios
      .put(QC_API + `UpdateRole/${editingRoleId}`, { roleName: editingRoleName })
      .then(() => {
        fetchRoles();
        setEditingRoleId(null);
        setEditingRoleName('');
      })
      .catch(error => {
        console.error(error);
      });
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
      color: theme.colors.background,
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
      color: theme.colors.primary,
      fontSize: INPUT_FONT_SIZE,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      padding: width * 0.035,
      borderRadius: 10,
      marginLeft: width * 0.03,
    },
    addButtonText: {
      color: theme.colors.background,
      fontWeight: 'bold',
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
      color: theme.colors.primary,
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
      color: theme.colors.background,
      fontSize: INPUT_FONT_SIZE - 2,
    },
  });

  const renderRoleItem = ({ item }) => (
    <View style={styles.roleItem}>
      {editingRoleId === item.id ? (
        <TextInput
          style={styles.input}
          value={editingRoleName}
          onChangeText={setEditingRoleName}
          placeholder="Edit Role Name"
          placeholderTextColor="#aaa"
        />
      ) : (
        <Text style={styles.roleText}>{item.roleName}</Text>
      )}

      <View style={styles.roleButtons}>
        {editingRoleId === item.id ? (
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => updateRole()}>
            <Text style={styles.roleButtonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => {
              setEditingRoleId(item.id);
              setEditingRoleName(item.roleName);
            }}>
            <Text style={styles.roleButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => deleteRole(item.id)}>
          <Text style={styles.roleButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Role Management</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newRole}
          onChangeText={setNewRole}
          placeholder="Enter Role Name"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.addButton} onPress={addRole}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={roles}
        keyExtractor={item => item.id.toString()}
        renderItem={renderRoleItem}
      />
    </View>
  );
};

export default RoleManagement;
