import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'

//screen imports
import Login from './Login';
import DrawerStackScreen from '../DrawerStackScreens/DrawerStackScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
const Stack = createNativeStackNavigator();

const AuthenticationScreen = () => {
    <Stack.Navigator initialRouteName="Login" >
        <Stack.Screen name="Login" component={Login} options={{ header: () => null }} />
        <Stack.Screen name="Drawerstackscreen" component={DrawerStackScreen} options={{ header: () => null }} />
    </Stack.Navigator>
}

export default AuthenticationScreen;

const styles = StyleSheet.create({})