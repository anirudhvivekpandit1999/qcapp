import * as React from 'react';
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Form from './components/Form';
import Submit from './components/Submit';
import Page2 from './components/Page2';
import Review from './components/Review';
import QRCode from './components/QRCode';
import Dashboard from './components/Dashboard';
import CapturePicture from './components/CapturePicture';
import Reports from './components/Reports';
import ProjectName from './components/ProjectName';
import Device from './components/Device';
import CheckPoints from './components/CheckPoints';
import ModelType from './components/ModelType';
import Excel from './components/Excel';
import SavedForm from './components/SavedForm';
import User from './components/User';
import { MD3LightTheme, MD3DarkTheme, PaperProvider, Button, Switch } from 'react-native-paper';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { LightScheme } from './components/themes/lightScheme';
import { DarkScheme } from './components/themes/darkScheme';
import RoleManagement from './components/RoleManagement';

const Stack = createNativeStackNavigator();
// const Drawer = createDrawerNavigator();

const lightTheme = {
  ...MD3LightTheme,
  colors: LightScheme
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: DarkScheme
};

function App() {

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme

  return (
    <SafeAreaView style={{ display: 'flex', flex: 1 }}>
    <NavigationContainer>
      <PaperProvider theme={theme}>
      {/* <Button onPress={toggleTheme}>
          {isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        </Button> */}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Form" component={Form} />
          <Stack.Screen name="Page2" component={Page2} />
          <Stack.Screen name="Submit" component={Submit} />
          <Stack.Screen name="Review" component={Review} />
          <Stack.Screen name="CapturePicture" component={CapturePicture} />
          <Stack.Screen name="QRCode" component={QRCode} />
          <Stack.Screen name="SavedForm" component={SavedForm} />
          <Stack.Screen name="ProjectName" component={ProjectName} />
          <Stack.Screen name="Device" component={Device} />
          <Stack.Screen name="ModelType" component={ModelType} />
          <Stack.Screen name="CheckPoints" component={CheckPoints} />
          <Stack.Screen name="Reports" component={Reports} />
          <Stack.Screen name="Excel" component={Excel} />
          <Stack.Screen name="User" component={User} />
          <Stack.Screen name="RoleManagement" component={RoleManagement} />
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
    </SafeAreaView>
  );
}

StatusBar.setHidden(true);

export default App;