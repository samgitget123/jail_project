import { StyleSheet, Text, TouchableOpacity, View, Alert, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ant from 'react-native-vector-icons/AntDesign'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Kart from 'react-native-vector-icons/FontAwesome';
import KartIcon  from 'react-native-vector-icons/Feather';
import { useIsFocused } from '@react-navigation/native';
const Header = ({ database }) => {
  const isFocused = useIsFocused();
  const [cart, setCart] = useState("0");
  const navigation = useNavigation();
  useEffect(() => {
    getCartArray();
  }, [cart]);
 
  const getCartArray = async () => {
    try {
      const selectedItems = await AsyncStorage.getItem('addeditems');
      const parsedItems = JSON.parse(selectedItems);
      setCart(parsedItems);
      //console.log(parsedItems, 'SELECTED CART');
    } catch (error) {
      console.log('Error retrieving cart items:', error);
    }
  };
  
  return (
    <View style={{ backgroundColor: "#fff" }}>
      <View style={styles.headersection}>
        <View><Image style={styles.logo} source={require('../../Assets/image.png')}/></View>
        <View style={{display:"flex",flexDirection:"row" , alignItems:"center" }}>
        <View>{cart?.length > 0 ?(<Text style={{color:"#000"}}>{cart.length} Items have been added</Text>):null}</View>
          <TouchableOpacity style={{marginRight:40}}  onPress={() => { cart.length > 0 ? navigation.navigate('Cart', { JCMS_DB: database }): Alert.alert('please select Items')}}>
            <KartIcon name="shopping-cart" size={50} color='#192a53' style={styles.cartIcon} />
            <Text style={styles.cartText}>{cart?.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginHorizontal:20}} onPress={() => { navigation.navigate('Login') }}><Text style={styles.logo}><Ant name='logout' size={30} color='#000' /></Text></TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  headersection: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 0,
    paddingHorizontal: 20,
    alignItems: "center",

  },
  logo: {
    fontSize: 22,
    height:50,
    width:130,
  },
  Itemcart: {
    backgroundColor: '#fff',
    padding: 20
  },
  cartIcon: {
    position: 'relative',
  },
  cartText: {
    position: 'absolute',
    top: -0,
    right: 0,
    // backgroundColor: 'red',
    color: '#000',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 18,
    marginRight: 9,
    marginTop: 5,
    fontWeight: "bold"

  },
})