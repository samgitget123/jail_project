import { StyleSheet, Text, View, Image, Button, Alert, FlatList, Dimensions } from 'react-native'
import React, { useState } from 'react'
//icons'
import Ant from 'react-native-vector-icons/Entypo'
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import KartIcon from 'react-native-vector-icons/Feather';
import DelIcon from 'react-native-vector-icons/AntDesign';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useIsFocused } from '@react-navigation/native';
const Cards = ({ menuData, database }) => {
    const isFocused = useIsFocused();
    const [selectedName, setSelectedName] = useState([]);
    const [getCheck , setGetcheck] = useState([]);
    useEffect(() => {
        if (isFocused) {
            setSelectedName([]);
        }
      }, [isFocused]);
    const addedItem = (sno, itemName, qty, price, image, slectedQty) => {
        if (selectedName.filter(eachOne => eachOne.sno === sno).length > 0) {
            Alert.alert("Item Already Exists in the Cart!!!");
        } else {
            setSelectedName([...selectedName, { sno, itemName, qty, price, image, slectedQty }]);
        }
    }
    const deleteItem = async (sno) => {
        const SelectedItemLists = selectedName.filter(eachitem => eachitem.sno !== sno);
        setSelectedName(SelectedItemLists);
    }
    //delete all items 
  
    const deleteallItems = async () => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete all items?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  setSelectedName([]); // Clear the selected items
                },
              },
            ]
          );
    }
    const clearAllselectedItems = async () => {
        try {
            await AsyncStorage.removeItem('addeditems', JSON.stringify(selectedName));
        } catch (error) {
            console.log('Error storing cart items:', error);
        }
    }
    //if selected list empty
    const renderEmptyComponent = () => (
        <View style={{ display: "flex", justifyContent: "center" }}>
            <Text>No Item Added</Text>
        </View>
    );
    const renderEmptyItems = () => (
        <View style={styles.Emptycontainer}>
            <Text style={styles.Emptytext}>No Item Found</Text>
        </View>
    );
    
    useEffect(() => {
        // clearAllselectedItems();
        setSelectedName([])
    }, [])
    useEffect(() => {
       
        storeArray();
    }, [selectedName]);

    const storeArray = async () => {
        try {
            await AsyncStorage.setItem('addeditems', JSON.stringify(selectedName));
        } catch (error) {
            console.log('Error storing cart items:', error);
        }
    };
    
    const { width, height } = Dimensions.get('window');
    
    return (
        <View>
            <View>
                <View style={styles.cartView}>
                    <FlatList
                        data={selectedName}
                        keyExtractor={(item) => item.sno}
                        ListEmptyComponent={renderEmptyComponent}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => {
                           
                            return (
                                <View>
                                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                        <TouchableOpacity onPress={() => {
                                            deleteItem(item.sno)
                                        }}>
                                            <Text style={styles.selectedItemsfont}>{item.itemName}<Ant name='cross' color='#FF0000' size={30} /></Text>

                                        </TouchableOpacity>
                                        
                                    </View>
                                </View>
                            )
                        }}
                    />
                    <TouchableOpacity onPress={()=>{
                        deleteallItems();
                    }} style={{marginHorizontal:30}}>{selectedName.length > 1 ? (<DelIcon name='delete' color='#FF0000' size={30} />):null}</TouchableOpacity>
                </View>
            </View>
            <FlatList
                data={menuData.filter(item => item.Is_Available == 1)}
                keyExtractor={(item) => item.item_id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyItems}
                contentContainerStyle={styles.container}
                numColumns={3}
                renderItem={({ item }) => {
                    const isItemAdded = selectedName.some(cartItem => cartItem.sno === item.item_id);
                   // const cardBackgroundColor = isItemAdded ? "#E0FFE0" : "#fff";
                   const cardBackgroundColor = item.quantity == 0 ? "#FFCCCC" : isItemAdded ? "#E0FFE0" : "#fff"; 

                    return (
                        <View style={[styles.cardView, { width: width / 3, backgroundColor: cardBackgroundColor }]}>
                            <View>
                            <Image
                            source={{ uri: item.image }}
                            style={styles.cardImage}
                          />
                          
                            </View>
                            <View>
                                <View style={styles.itemProp}>
                                    <Text style={styles.cardText}>{item.item_name}</Text>
                                    <Text style={styles.cardText}>{item.item_price} rps/</Text>
                                    {item.quantity==0?<Text style={{ color: "red" }}>No Stocks Available</Text> :   <TouchableOpacity style={{ display: "flex", flexDirection: "row" }}
                                        onPress={() => {
                                            addedItem(item.item_id, item.item_name, item.quantity, item.item_price, item.image, item.slected_qty)
                                        }}
                                        >
                                  <View style={styles.buttonWidth}>
                                            <Text style={styles.btntext}>Add to Cart</Text>
                                        </View>
                                        <View><KartIcon name="shopping-cart" size={30} color='#192a53' style={styles.cartIcon} /></View>
                                    </TouchableOpacity>}
                                    <View style={styles.orderedStatus}>{isItemAdded && <Text style={styles.orderedText}>Added<AntDesign name="check" size={20} color="green" style={styles.orderedIcon} /></Text>}</View>
                                </View>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    )
}

export default Cards

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    cardView: {
        padding: 20,
        backgroundColor: "#fff",
        flexDirection: "row",
        borderRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    cartView: {
        width: '100%',
        padding: 3,
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
    buttonWidth: {
        backgroundColor: '#192a53',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    selectedItemsfont: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginRight: 10,

    },
    Emptycontainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    Emptytext: {
        fontSize: 18,
        textAlign: 'center',
    },
    buttonTouchable: {
        borderRadius: 5,
        overflow: 'hidden',
        paddingHorizontal: 10,
    },
    btntext: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    orderedText: {
        color: 'green', // Adjust color as needed
        fontSize: 14,   // Adjust font size as needed
        marginTop: 5,   // Adjust spacing as needed
    },
    orderedStatus:{
        position:"absolute",
        top:100,
        left:170
    }
})