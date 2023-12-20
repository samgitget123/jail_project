import 'react-native-gesture-handler';
import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import sqlite from 'react-native-sqlite-storage'
//navigation
const navigationRef = React.createRef();
//Native base 
import { Container } from 'native-base/lib/typescript/components/composites';
//stack
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
const Stack = createNativeStackNavigator();
//screens
import RootStackScreen from './Src/Screens/RootStackScreens/RootStackScreen';
import DrawerStackScreen from './Src/Screens/DrawerStackScreens/DrawerStackScreen';
import Login from './Src/Screens/RootStackScreens/Login';
//navigatoins
import { NavigationContainer } from '@react-navigation/native';
import AuthenticationScreen from './Src/Screens/RootStackScreens/AuthenticationScreens';
import Header from './Src/Screens/DrawerStackScreens/Header';
import Cart from './Src/Screens/DrawerStackScreens/Cart';
const App = () => {


// console.log(cart, cart.length, 'app.js file loaded');
// const getCartArray = async () => {
//   try {
//     const selectedItems = await AsyncStorage.getItem('addeditems');
//     const parsedItems = JSON.parse(selectedItems);
//     if(parsedItems.length >0){
//       return parsedItems;
//     }else{
//       return [];
//     }
//     setCart(parsedItems);
//     console.log(parsedItems, 'SELECTED CART');
//   } catch (error) {
//     console.log('Error retrieving cart items:', error);
//   }
// };
//   const db = sqlite.openDatabase({ name: 'mydatabase.db', location: 'default' });
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" >
        <Stack.Screen name="Login" component={Login} options={{ header: () => null }} />
        <Stack.Screen name="Header" component={Header} options={{ header: () => null }} />
        <Stack.Screen name="Cart" component={Cart}  />
        <Stack.Screen name="Drawerstackscreen" component={DrawerStackScreen} options={{ header: () => null }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App