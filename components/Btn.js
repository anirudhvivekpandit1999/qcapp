import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  button: {
    borderRadius: 100,
    alignItems: 'center',
    paddingVertical: 5,
    marginVertical: 10,
  },
});

export default function Btn({bgColor, btnLabel, textColor, Press}) {
  const windowWidth = Dimensions.get('window').width;
  const buttonWidth = windowWidth * 0.8;

  return (
    <TouchableOpacity
      onPress={Press}
      style={[styles.button, {backgroundColor: bgColor, width: buttonWidth}]}>
      <Text style={{color: textColor, fontSize: 25, fontWeight: 'bold'}}>
        {btnLabel}
      </Text>
    </TouchableOpacity>
  );
}
