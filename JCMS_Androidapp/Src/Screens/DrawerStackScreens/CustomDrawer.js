import { Alert, StyleSheet, Text, View , TouchableOpacity } from 'react-native'
import React from 'react'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
const CustomDrawer = (props) => {
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: "#fff" }}
      >
        <View style={{ flexDirection: 'row', justifyContent:"center" , paddingVertical:20 }}>
          <Text style={styles.logofont}>JCMS</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View
      style={{
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
      }}
    >  
    </View>
    </View>
  )
}

export default CustomDrawer

const styles = StyleSheet.create({
  logofont: {
    fontSize: 22,
    fontWeight:"500",
    color :"#000"
   
  }
})