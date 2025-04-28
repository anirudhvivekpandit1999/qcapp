import React from 'react';
import {TextInput} from 'react-native';
import {useTheme} from 'react-native-paper';

const Field = props => {
  const theme = useTheme();
  return (
    <TextInput
      {...props}
      style={{
        borderRadius: 100,
        color: theme.colors.primary,
        paddingHorizontal: 10,
        width: '80%',
        backgroundColor: theme.colors.tertiary,
        marginVertical: 10,
      }}
      placeholderTextColor={theme.colors.primary}></TextInput>
  );
};

export default Field;
