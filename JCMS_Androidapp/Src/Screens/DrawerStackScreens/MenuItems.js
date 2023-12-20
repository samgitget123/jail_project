import { StyleSheet, Text, View, Image, Button, Alert, FlatList , Dimensions } from 'react-native'
import React, { useState } from 'react'
// import Ant from 'react-native-vector-icons/Entypo'
// import { TouchableOpacity } from 'react-native-gesture-handler';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect } from 'react';

//imports 
import Header from './Header'
const MenuItems = () => {

  const data= require('./Home.js');
  //console.log(data, 'raju chary');
  const { width, height } = Dimensions.get('window');
const cardWidth = width/2;
  return (
    <View>
    {/* <View><Header/></View>*/}
      
      <View>
        <View style={{display:"flex" , justifyContent:"center" , alignItems:"center",paddingVertical:20}}><Text style={styles.menuHeading}>Menu List</Text></View>
        <FlatList
            data={data}
            keyExtractor={(item) => item.item_id}
            showsVerticalScrollIndicator={false}
            // ListEmptyComponent={renderEmptyItems}
            numColumns={3} 
            renderItem={({ item }) => {
                return (
                  <View style={{display:"flex", flexDirection:'row', flexWrap:'wrap'}}>
                    <View style={[styles.cardView , {width: width/3,}]}>
                        <View>
                            <Image
                              source={item.image}
                                style={styles.cardImage}
                            />
                        </View>
                        <View>
                            <View style={styles.itemProp}>
                                    <Text style={styles.cardText}>{item.item_name}</Text>
                                    <Text style={styles.cardText}>{item.item_price} rps/-</Text>
                                    <Text style={styles.cardText}>Aval Qty: {item.quantity}</Text>
                            </View>
                        </View>

                    </View>
                    </View>
                );
            }}
           
        />
    </View>


    </View>
  )
}

export default MenuItems


    
const styles = StyleSheet.create({
    cardView: {
        
        padding: 10,
        backgroundColor: "#fff",
        flexDirection: "row",
        borderRadius: 8,
        elevation: 3,
        marginBottom: 10,
        
    },
    cartView:{
        width: '100%',
        padding: 10,
        backgroundColor: "#fff",
        flexDirection: "row",
        borderRadius: 8,
        elevation: 3,
        marginBottom: 10,
        // display:"none"
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 50
    },
    itemProp: {
        display: "flex",
        marginLeft: 40,
        flexDirection: "column",
        alignSelf: "flex-start"
    },
    cardText: {
        color: "#000",
        fontSize: 16,
        marginBottom: 20,
    },
    buttonWidth:{
        width: 60,
    },
    selectedItemsfont:{
        fontSize:16,
        fontWeight:"bold",
        color:"#000",
        marginRight:10,

    },
    Emptycontainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:50
      },
      Emptytext: {
        fontSize: 18,
        textAlign: 'center',
      },
      menuHeading:{
        fontSize:22,
        fontWeight:"500",
        color:"#000"
      }
})

