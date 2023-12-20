import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
//Draewr stack
import { createDrawerNavigator } from '@react-navigation/drawer'
import CustomDrawer from './CustomDrawer';
import Home from './Home';
import MenuItems from './MenuItems';
import Enroll from './Enroll';
const Drawer = createDrawerNavigator();

const DrawerStackScreen = (props) => {

  return (
    <Drawer.Navigator
      initialRouteName='Home'
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions=
      {{
        headershown: false,
        drawerActiveBackgroundColor: 'grey',
        drawerInactiveTintColor: '#192a53',
        drawerActiveTintColor: '#fff',
        drawerLabelStyle: {
          fontSize: 22
        },

      }}
    >
      <Drawer.Screen name="Food Orders" component={Home} options={{ headerShown: false }} />
      <Drawer.Screen name="Menu Items" component={MenuItems} options={{ headerShown: false }} />
      <Drawer.Screen name="Enroll" component={Enroll} options={{ headerShown: false }} />
    </Drawer.Navigator>
  )
}

export default DrawerStackScreen

const styles = StyleSheet.create({})