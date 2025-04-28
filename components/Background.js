import React from 'react';
import {View, ImageBackground, StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const Background = ({children}) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./images/wallpaper.jpg')}
        style={styles.image}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: '100%',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export default Background;
