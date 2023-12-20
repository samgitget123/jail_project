import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TextInput, View, Image, Dimensions, Button, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal, Vibration } from 'react-native';
//import Fw from 'react-native-vector-icons/FontAwesome'
import Ant from 'react-native-vector-icons/AntDesign'
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import Spin from 'react-native-vector-icons/FontAwesome'
//import { initialize, openDevice, captureRawData, verify  } from '../../utils/trustFinger';
import { initialize, openDevice, captureRawData, verifyFinger, verifyFin } from '../../utils/trustFinger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import { NativeModules, NativeEventEmitter} from 'react-native';
import DelIcon from 'react-native-vector-icons/AntDesign';
import Icons from 'react-native-vector-icons/MaterialIcons'
import Octo from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
//usb connection
//name

const emitter = new NativeEventEmitter(NativeModules.captureRawData);
const emitterVerify = new NativeEventEmitter(NativeModules.verify);  //verify   verifyFinger

const UsbModule = NativeModules.UsbModule;
const Cart = ({ route }) => {

 // let finalBal;
const [finalBal,setFinalBal] = useState("");
  // let balanceAmount;
  const [showOrderStatus, setShowOrderStatus] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balanceamount , setBalanceAmount] = useState('');
  //const [loadingVerify, setLoadingVerify] = useState(false);
  const [isDeviceSupportive, setIsDeviceSupportive] = useState(null)
  //const [imagePath, setImagePath] = useState('');
  //const [capturedImagepath, setCapturedImagePath] = useState('');
  const [prisonerName, setPrisonername] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('Enter Verify Button for Authentication'); // Default status
  // const [fingureImagePath, setFingureImagePath] = useState('');
  // const [selectedFingureId, setSelectedFingureId] = useState('');
  const [isMatchedFingure, setIsMatchedfingure] = useState('');
  //const [iscapturedImage, setIscapturedImage] = useState(false);
  //const [matchedPrisonerDetails, setIsMatchedprisonerDetails] = useState('');
  const [prisonerDetails, setIsprisonerDetails] = useState('');
  const [capturedImage, setCapturedImage] = useState('');
  const [prisonerCode , setPrisonerCode] = useState('');
  const [data, setData] = useState([]);
  console.log(data, "data");
  const { JCMS_DB } = route.params;
  //prisoner states
  const [prisonername , setPrisonerName] = useState('');
  const [prisonerFingureId , setPrisonerFingureId] = useState('');
  //const [Verified, setVerified] = useState('')
  //usb detection



  emitter.addListener('capturedImage', (response) => {
    if (capturedImage === '') {
      setCapturedImage(response.capturedImagePath)
      handleQuery(response.capturedImagePath)
    }

  });


  const handleQuery = async (capturedImage) => {
    JCMS_DB.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS DJ_prisoners (sno INTEGER PRIMARY KEY AUTOINCREMENT, prisoner_name TEXT NOT NULL, prisoner_code TEXT UNIQUE NOT NULL, jail_id INTEGER NOT NULL, assign_phone_nos TEXT NOT NULL, calling_type TEXT NOT NULL, is_vip INTEGER NOT NULL, otp_number TEXT NOT NULL, code TEXT NOT NULL, fingure_print_id BIGINT NOT NULL , fingure_image BLOB);",
        [],
        () => {
          tx.executeSql(
            'SELECT * FROM DJ_prisoners',
            [],
            async (_, results) => {
              const rows = results.rows;
              console.log('NUMBER OF FINGURE ENROLLS: ', rows)
              let foundMatch = false;
              for (let i = 0; i < rows.length; i++) {
                const matchedPrisoner = rows.item(i);
                const fingureImage = matchedPrisoner.fingure_image;
                const prisonerName = matchedPrisoner.prisoner_name;
                setPrisonerName(prisonerName);
                const FingureId = matchedPrisoner.fingure_print_id;  //fingureprintid
                setPrisonerFingureId(FingureId);
                const Prisonercodes = matchedPrisoner.prisoner_code; //prisoner code 
                setPrisonerCode(Prisonercodes);
                if(fingureImage != null){
                  const isMatch = await verifyFin(capturedImage, fingureImage);  //capturedimage , dbimagepath
                  setIsMatchedfingure(isMatch)
                  if (isMatch) {
                    console.log(matchedPrisoner.prisoner_code,'matchedPrisoner');
                    setIsprisonerDetails(matchedPrisoner);
                    setVerificationStatus('VERIFIED');    
                    foundMatch = true;
                      getBalanceAmount(matchedPrisoner.prisoner_code);
                    break;
                  }
                }
              }
              if (!foundMatch) {
                setIsprisonerDetails(''); // Reset prisoner details if no match
                setVerificationStatus('NOT VERIFIED');
              }
            }
          );
        }
      );
    });

  }

////////spare//////

// useEffect(()=>{
//   getBalanceAmount();
// }, [prisonerDetails]);


  useEffect(async () => {
    isSupportive();
    getCartArray();
    //getPrisonerName();
    createPrisonerHistoryTable()
    RNFS.unlink(prisonercartfile) // Clear previous transactions by deleting the file
      .then(() => {
        retrieveData(); // Fetch and append new data

      })
      .catch(error => {
        console.log('Error clearing previous :', error);
        retrieveData(); // Fetch and append new data even if clearing previous transactions fails

      });
    //unlink prisoner json orders format
    RNFS.unlink(prisonerJsonordercartlist) // Clear previous transactions by deleting the file
      .then(() => {
        retrieveData(); // Fetch and append new data

      })
      .catch(error => {
        console.log('Error clearing previous :', error);
        retrieveData(); // Fetch and append new data even if clearing previous transactions fails

      });
  }, []);
  //crete table
  const createPrisonerHistoryTable = async () => {
    JCMS_DB.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS DJ_food_order_history (id INTEGER PRIMARY KEY AUTOINCREMENT, prisoner_name TEXT NOT NULL,prisoner_code TEXT NOT NULL,order_time DATETIME NOT NULL DEFAULT'0000-00-00 00:00:00',item_id INTEGER NOT NULL,item_name TEXT NOT NULL,item_price NUMERIC NOT NULL,quantity TEXT NOT NULL, slected_qty TEXT NOT NULL, active_status INTEGER NOT NULL DEFAULT 0,order_id INTEGER NOT NULL,order_status TEXT NOT NULL DEFAULT '-1',served_time DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',item_total_amount NUMERIC NOT NULL DEFAULT 0.00,previous_balance_amount TEXT NOT NULL DEFAULT '0',deducted_amount TEXT NOT NULL DEFAULT '0',current_balance_amount TEXT NOT NULL DEFAULT '0')",
        [],
        () => {
          console.log('DJ_food_order_history Table created successfully');
        }
      )
    }
    )
  }
  const getCartArray = async () => {
    try {
      const selectedItems = await AsyncStorage.getItem('addeditems');
      const parsedItems = JSON.parse(selectedItems);
      setCart(parsedItems);
      // console.log(parsedItems, 'SELECTED CART');
    } catch (error) {
      console.log('Error retrieving cart items:', error);
    }
  };

  const removeItem = (id) => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this item from the cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const filteredItems = cart.filter(eachItem => eachItem.sno !== id);
            setCart(filteredItems);
          },
        },
      ]
    );
  }
  const handleIncrement = (id, qty, slectedQty) => {
    if(slectedQty<qty){
    const updatedItems = cart.map(eachItem => {
      if (eachItem.sno === id) {
        return {
          ...eachItem, slectedQty: parseInt(eachItem.slectedQty) + 1
        };

      }

      return eachItem;
    })
    setCart(updatedItems);
  }else{
    Alert.alert("No stock Available!");
  }
  }

  const handleDecrement = (id, decrement) => {
    if (decrement > 1) {
      const updatedItems = cart.map(eachItem => {
        if (eachItem.sno === id) {
          return {
            ...eachItem, slectedQty: eachItem.slectedQty - 1
          };

        }

        return eachItem;
      })

      setCart(updatedItems);
    
    }
  }

  const calculateItemTotal = (item) => {
    return item.slectedQty * item.price;
  };

  const calculateGrandTotal = () => {
    let grandTotal = 0;
    for (const item of cart) {
      const itemTotal = calculateItemTotal(item);
      grandTotal += itemTotal;
    }
    return grandTotal;
  };
  ////////submit cart///////////////////////
  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
 


  //it will copy json file as txt format
  let prisonercartfile;
  if (Platform.OS === 'android') {
    prisonercartfile = `${RNFS.ExternalDirectoryPath}/jcms_prisonerCartDetails.txt`;
  } else {
    prisonercartfile = `${RNFS.DocumentDirectoryPath}/jcms_prisonerCartDetails.txt`;
  }

  const appendSelectQuery = (query, data) => {
    const insertQuery = `${data}\n`;

    RNFS.writeFile(prisonercartfile, insertQuery, 'utf8')
      .then(() => {
        // const shareOptions = {
        //   url: `file://${prisonercartfile}`,
        //   type: 'text/plain',
        //   failOnCancel: false,
        // };
        // Share.open(shareOptions)
        //   .then(() => {
        //     console.log('File shared successfully!');
        //   })
        //   .catch(error => {
        //     console.log('Error sharing file:', error);
        //   });

      })
      .catch(error => console.log('Error writing select query to text file:', error));
  };


  const getBalanceAmount = async (pcd) => {
    try {
      const url = `http://103.167.216.234/JCMS/api/recharge_activity.php?prisoner_code='${pcd}'`;
      console.log(url , 'getbalanceurl');
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data , '==============balanceAmountdata===============')
      if(data){
       
        setBalanceAmount(data.rechargeActivity[0]?.current_balance_amount);
      }
     
      // You can return the data or use it in your application logic
      return data;
    } catch (error) {
      console.error('Error fetching balance amount:', error);
      // Handle the error appropriately
    }
  };

  const getBalanceAmount2 = async (pcd) => {
    try {
      const url = `http://103.167.216.234/JCMS/api/recharge_activity.php?prisoner_code='${pcd}'`;
      console.log(url , 'getbalanceurl');
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data , '==============balanceAmountdata===============')
      if(data){
       
        setFinalBal(data.rechargeActivity[0]?.current_balance_amount);
      }
    // console.log(finalBal, "finalBal");
      // You can return the data or use it in your application logic
      return data;
    } catch (error) {
      console.error('Error fetching balance amount:', error);
      // Handle the error appropriately
    }
  };
  //console.log(finalBal, "finalBal*****");
 

  //spare/////
  const prisonerOrederCartDetails = async(cart) => {
   await getBalanceAmount(prisonerDetails.prisoner_code);
    setShowOrderStatus(3);
    JCMS_DB.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS DJ_food_order_history (id INTEGER PRIMARY KEY AUTOINCREMENT, prisoner_name TEXT NOT NULL,prisoner_code TEXT NOT NULL,order_time DATETIME NOT NULL DEFAULT'0000-00-00 00:00:00',item_id INTEGER NOT NULL,item_name TEXT NOT NULL,item_price NUMERIC NOT NULL,quantity TEXT NOT NULL, slected_qty TEXT NOT NULL, active_status INTEGER NOT NULL DEFAULT 0,order_id INTEGER NOT NULL,order_status TEXT NOT NULL DEFAULT '-1',served_time DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',item_total_amount NUMERIC NOT NULL DEFAULT 0.00,previous_balance_amount TEXT NOT NULL DEFAULT '0',deducted_amount TEXT NOT NULL DEFAULT '0',current_balance_amount TEXT NOT NULL DEFAULT '0')",
        [],
        () => {
          tx.executeSql(
            'SELECT * FROM  DJ_food_order_history',
            [],
            (_, results) => {
              const rows = results.rows;
              if (rows.length >= 0) {
                for (let i = 0; i < cart?.length; i++) {  
                  const { itemName, price, qty, slectedQty } = cart[i];
                  const order_time = getCurrentDateTime(); // Replace with actual order time, if available
                  const served_time = getCurrentDateTime(); // Replace with actual served time, if available
                  const order_id = 456; // Replace with actual order ID, if available
                  const prisonername = prisonerDetails.prisoner_name; // Replace this with the actual prisoner name
                  const prisonercode = prisonerDetails.prisoner_code;
                  const item_total_amount = qty * price;
                  tx.executeSql(
                    "INSERT INTO DJ_food_order_history (prisoner_name, prisoner_code, order_time, item_id, item_name, item_price, quantity, slected_qty, active_status, order_id, order_status, served_time, item_total_amount, previous_balance_amount, deducted_amount, current_balance_amount) VALUES (?, ?, ?, 100, ?, ?, ?, ?, 'ORDERED', ?, '-1', '0000-00-00 00:00:00', ?, '0', '0', '0')",
                    [prisonername, prisonercode, order_time, itemName, price, qty, slectedQty, order_id, item_total_amount],
                    () => {
                    },
                    (error) => {
                      console.log('Error inserting data:', error);
                    }
                  );
                }
              }
              retrieveData(JCMS_DB, setData);

            },
            (error) => {
              console.log('Error selecting records:', error);
            }
          );
        },
        (error) => {
          console.log('Error creating table:', error);
        }
      );
    });
  };

  
//spare
  const sendData = async (updated_data, database) => {
    try {
      const response = await fetch('http://103.167.216.234/JCMS/api/Post_data.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers as needed
        },
        body: JSON.stringify(updated_data),
      });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! Status: ${response.status}`);
      // }
  
      const responseData = await response.json();
      if(responseData){
        getBalanceAmount2(prisonerDetails.prisoner_code);
        setBalanceAmount("");
        setShowOrderStatus(1);
        truncateordersTable(database);
        
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

//jcms_prisonerJsonordercartlist

//   const sendData = async () => {
//     try {
//       const filePath = RNFS.DocumentDirectoryPath + '/jcms_orderedFoodItems.txt';


// const fileContent = await RNFS.readFile(filePath, 'utf8');

//       // Read the content of the .txt file
//    //   const fileContent = await RNFS.readFile('jcms_orderedFoodItems.txt', 'utf8');
  
//       // Parse the content as JSON
//       const jsonData = JSON.parse(fileContent);
  
//       // Make the POST request
//       const response = await fetch('http://172.16.12.41/JCMS/api/Post_data.php', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           // Add any other headers as needed
//         },
//         body: JSON.stringify(jsonData), // Use the parsed JSON as the body
//       });
  
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
  
//       const responseData = await response.json();
//       console.log('Response Data:', responseData);
//     } catch (error) {
//       console.error('Error:', error.message);
//     }
//   };`

const updatejson=(json, balance, database)=>{
  const jsons = JSON.parse(json);
  console.log(jsons);

 //sendData(json);
//Calculate the total of "total_amount" values
const totalAmount = jsons.reduce((total, entry) => {
  const foodOrders = entry.food_orders;

  // Use reduce on the 'food_orders' array to calculate the total_amount for each entry
  const totalAmountForEntry = foodOrders.reduce((orderTotal, order) => orderTotal + order.total_amount, 0);

  return total + totalAmountForEntry;
}, 0);

if(balance > totalAmount ){
  jsons[0]["updated_bal"]=balance - totalAmount;
  sendData(jsons, database);
}else{
  Alert.alert("Insufficient balance!");
  setShowOrderStatus(2);
  truncateordersTable(database);
}
}
  const retrieveData = (database, setData) => {
    let consolidatedJson;
    let currentBalanceAmount;
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM DJ_food_order_history',
        [],
        (_, results) => {
          const rows = results.rows;
         
          const consolidatedData = {}; // Create an object to hold consolidated data
          
          for (let i = 0; i < rows.length; i++) {
            const {
              id,
              prisoner_name,
              prisoner_code,
              order_time,
              item_id,
              item_name,
              item_price,
              quantity,
              slected_qty,
              active_status,
              order_id,
              order_status,
              served_time,
              item_total_amount,
              previous_balance_amount,
              deducted_amount,
              current_balance_amount
            } = rows.item(i);
            data.push({
              id,
              prisoner_name,
              prisoner_code,
              order_time,
              item_id,
              item_name,
              item_price,
              quantity,
              slected_qty,
              active_status,
              order_id,
              order_status,
              served_time,
              item_total_amount,
              previous_balance_amount,
              deducted_amount,
              current_balance_amount,
              total_amount: item_price * slected_qty, 
            });
            const key = `${prisoner_name}-${prisoner_code}`;
            if (!consolidatedData[key]) {
              consolidatedData[key] = {
                "priosner_name":prisoner_name,
                "Prisoner_code": prisoner_code,
                food_orders: [
                  {
                    itemName: item_name,
                    price: item_price,
                    ordered_qty: slected_qty,
                    total_amount: item_price * slected_qty,
                  },
                ],
              };
            } else {
              consolidatedData[key].food_orders.push({
                itemName: item_name,
                price: item_price,
                ordered_qty: slected_qty,
                total_amount: item_price * slected_qty,
              });
            }
          }

          setData(Object.values(consolidatedData));

          // Convert consolidatedData to JSON format
           consolidatedJson = JSON.stringify(Object.values(consolidatedData), null, 2);
      

          // Append consolidated data to text file
          appendSelectQuery('Consolidated_Food_Orders', consolidatedJson);
          console.log(consolidatedJson, "consolidated json");
          updatejson(consolidatedJson, balanceamount, database);

          // Perform further processing if needed
          const transformedData = transformData(consolidatedData);
         
          appendSelectprisonerorderQuery('Transformed_Food_Orders', consolidatedJson);
        },
        (error) => {
          console.log('Error retrieving data:', error);
        }
      );
    });
    

    // database.transaction(
    //   (tx) => {
    //     tx.executeSql(
    //       'SELECT current_balance_amount FROM reacharge_activity WHERE prisoner_code = ?',
    //       [prisonerDetails.prisoner_code],
    //       (_, results) => {
    //         try {
    //           const rows = results.rows;
    //           const firstRow = rows.item(rows.length - 1);
    //           const firstR = rows.item(0);
    //           console.log(firstR , 'firstR');
    //           const firstR2 = rows.item(1);
    //           console.log(firstR2 , 'firstR2');
    //           const firstR3 = rows.item(2);
    //           console.log(firstR3 , 'firstR3');
    //           const firstR4 = rows.item(3);
    //           console.log(firstR4 , 'firstR4');
    //           const firstR5 = rows.item(4);
    //           console.log(firstR5 , 'firstR5');
    //           console.log(rows , 'rows');
    //           console.log(firstRow , 'firstRow');
    //            currentBalanceAmount = firstRow.current_balance_amount;
    //           console.log('Current Balance Amount from the first row:', currentBalanceAmount);
              
    //           updatejson(consolidatedJson, balanceAmount, database);

    //         } catch (error) {
              
    //           console.error('Error processing SQL results:', error);
    //         }
    //       },
    //       (error) => {
    //         console.error('Error executing SQL query:', error);
    //       }
    //     );
    //   },
    //   (error) => {
    //     console.error('Transaction error:', error);
    //   },
    //   () => {
    //     console.log('Transaction completed successfully.');
       
    //   }
      
    // );  
  };


  const truncateordersTable = async (database) => {
    database.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM DJ_food_order_history',
        [],
        () => {
          console.log('orders Table truncated successfully');

        },
        (error) => {
          console.log('Error truncating table:', error);


        }
      );
    });
  };



  const transformData = (data) => {
    const transformedData = [];

    // Create a map to group food orders by prisoner code
    const prisonerMap = new Map();

    // Loop through the data
    data.forEach((order) => {
      const { prisoner_name, prisoner_code, item_name, item_price, quantity } = order;

      // Create a unique key for each prisoner
      const key = `${prisoner_code}`;

      // Check if the prisoner entry already exists in the map
      if (!prisonerMap.has(key)) {
        // If not, create a new prisoner entry
        prisonerMap.set(key, {
          prisoner_name,
          prisoner_code,
          barac_id: "YOUR_ACTUAL_BARAC_ID_VALUE", // Replace this with the actual barac_id value
          food_orders: [{
            itemName: item_name,
            price: item_price,
            ordered_qty: parseInt(quantity, 10)
          }]
        });
      } else {
        // If the prisoner entry exists, add the item to the existing prisoner's food_orders array
        const existingPrisoner = prisonerMap.get(key);
        existingPrisoner.food_orders.push({
          itemName: item_name,
          price: item_price,
          ordered_qty: parseInt(quantity, 10)
        });
      }
    });

    // Convert the prisoner map to an array and push it to the transformedData array
    prisonerMap.forEach((prisonerData) => {
      transformedData.push(prisonerData);
    });

    return transformedData;
  };

  //convert as json file
  let prisonerJsonordercartlist;
  if (Platform.OS === 'android') {
    prisonerJsonordercartlist = `${RNFS.ExternalDirectoryPath}/jcms_prisonerJsonordercartlist.txt`;  //RNFS.ExternalDirectoryPath
  } else {
    prisonerJsonordercartlist = `${RNFS.DocumentDirectoryPath}/jcms_prisonerJsonordercartlist.txt`;
  }
  const appendSelectprisonerorderQuery = (query, data) => {
    const insertQuery = `${JSON.stringify(data, null, 2)};\n`;

    RNFS.appendFile(prisonerJsonordercartlist, insertQuery, 'utf8')
      .then(() => {
        // const shareOptions = {
        //   url: `file://${prisonerJsonordercartlist}`,
        //   type: 'text/plain',
        //   failOnCancel: false,
        // };
        // Share.open(shareOptions)
        //   .then(() => {
        //     console.log('File shared successfully!');
        //   })
        //   .catch(error => {
        //     console.log('Error sharing file:', error);
        //   });

      })
      .catch(error => console.log('Error appending select query to text file:', error));
  };

  ///////////////////////////////////////////////////////////////////////////////////////////
  // const copyDatabase = async () => {
  //   const destination = `${RNFS.ExternalDirectoryPath}/Jcms_database.db`;
  //   const source = '/data/data/com.jcms/databases/jcms.db';
  //   try {
  //     setLoading(true); // Start showing the loading indicator

  //     const exists = await RNFetchBlob.fs.exists(destination);
  //     if (exists) {
  //       await RNFS.unlink(destination);
  //     }
  //     await RNFetchBlob.fs.cp(source, destination);

  //   } catch (error) {
  //     console.log('Error copying database file:', error);
  //   } finally {
  //     // Hide the loading indicator after 3 seconds, regardless of success or error
  //     setTimeout(() => {
  //       setLoading(false);
  //       // Show alert after 3 seconds
  //       setTimeout(() => {
  //         Alert.alert('Database sychronised');
  //       }, 1000);
  //     }, 1000);
  //   }
  // };
  const isSupportive = async () => {
    const isSupported = await initialize();
    setIsDeviceSupportive(isSupported);
  };

  ///conflict code started

  const prisonerNameToVerify = 'Deepija';

  const { width, height } = Dimensions.get('window'); //window width

  //base64 to image

  // Convert base64 to image URI
  const imageUri = `data:image/jpeg;base64,${capturedImage.replace(/[\r\n]+/g, '').replace(/\s/g, '')}`;
  //////
const getOrderStatus=(showOrderStatus)=>{
  switch(showOrderStatus){
    case 1:
     return <View style={{ marginHorizontal: 50, display: "flex", flexDirection: "row" }}>
     <View style={{ marginHorizontal: 10 }}>
       <Text style={{ color: "green", fontSize: 16, fontWeight: "500" }}>ORDER PLACED <AntDesign name="check" size={40} color="green" /></Text>

     </View>
     <View style={[
       styles.card,
       {
         width: width * 0.4, // Decrease the width as needed
       },
     ]}>
       <View style={styles.tableRow}>
         <Text style={styles.label}>Prisoner Details</Text>
       </View>
       <View style={styles.tableRow}>
         <Text style={styles.label}>Prisoner Name:</Text>
         <Text style={styles.value}>{prisonerDetails.prisoner_name}</Text>
       </View>
       <View style={styles.tableRow}>
         <Text style={styles.label}>Prisoner ID:</Text>
         <Text style={styles.value}>{prisonerDetails.fingure_print_id}</Text>
       </View>
       <View style={styles.tableRow}>
       <Text style={styles.label}>Available Balance:</Text>
       <Text style={styles.value}>{finalBal}</Text>
     </View>
       <View style={styles.tableRow}>
         <Text style={styles.label}>IsValidate:</Text>
         <Text style={styles.value}>
           {prisonerDetails.fingure_image ? 'Validate' : 'Not Validate'}
         </Text>
       </View>
     </View>
   </View>

      break;
      case 2:
    return  <View><Text style={{color:"red"}}>Please Recharge for placing order!</Text></View>
    break
    case 3:
      return  <View><Text style={{color:"green"}}>Placing Order...</Text></View>
default:
  return null;
  }

}

  return (
    <View
      style={[
        styles.container,
        {
          // Try setting `flexDirection` to `"row"`.
          flexDirection: 'column',
        },
      ]}>
      <View style={{ flex: 0.2 }} >
        <View>
          <Text style={styles.carttext}>Your Cart Details!</Text>
        </View>
      </View>
      <ScrollView style={{ flex: 10 }}>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.snoStyle}>S.No</Text>
            <Text style={styles.cell}>Item</Text>
            <Text style={styles.cell}>Name</Text>
            <Text style={styles.cell}>Price</Text>
            <Text style={styles.cell}>Quantity</Text>
            <Text style={styles.cell}>Total</Text>
            <Text style={styles.cell}>Action</Text>
          </View>
          {cart.map((eachItem, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.snoStyle}>{index + 1}</Text>
              <Image style={styles.avtar} source={eachItem.image} />
              <Text style={styles.cell1}>{eachItem.itemName}</Text>
              <Text style={styles.cell1}>{eachItem.price}</Text>
              <Text style={styles.cell1}>
                <TouchableOpacity onPress={() => {
                  handleDecrement(eachItem.sno, eachItem.slectedQty)
                  Vibration.vibrate(100)
                }}>
                  <Ant name="minussquare" size={22} color="#000" />
                </TouchableOpacity>
                <View style={styles.quantityContainer}>
                  <Text style={{ fontSize: 22 }}>{eachItem.slectedQty}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  handleIncrement(eachItem.sno, eachItem.qty, eachItem.slectedQty)
                  Vibration.vibrate(100)
                }}>
                  <Ant name="plussquare" size={22} color="#000" />
                </TouchableOpacity>
              </Text>
              <Text style={styles.cell1}>{eachItem.slectedQty * eachItem.price}</Text>
              <Text onPress={() => removeItem(eachItem.sno)} style={styles.removeText}>
                <DelIcon name="delete" size={30} color="#FF0000" />
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ flex: 1.5, marginTop: 20 }}>
        <View style={styles.row}>
          <Text style={styles.cell2}>Grand Total Rs.</Text>
          <Text style={styles.grandTotal}>{calculateGrandTotal()}/-</Text>
        </View>

        <View style={styles.bottonButtons}>
          <TouchableOpacity
            activeOpacity={0.6}
            underlayColor="#DDDDDD"
            style={styles.buttonTouchable}
            onPress={
              () => {
                prisonerOrederCartDetails(cart);
                Vibration.vibrate(100);
              }
            }
          >
            <View style={styles.buttonWidth}><Text style={styles.btntext}>PLACE ORDER</Text></View>

          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.6}
            underlayColor="#DDDDDD"
            style={styles.buttonTouchable}
            onPress={
              () => {
                setIsprisonerDetails('')
                captureRawData(true);
                setVerificationStatus('VERIFYING...')
                Vibration.vibrate(100)
              }
            }
          >
            <View style={styles.buttonWidth}><Text style={styles.btntext}>VERIFY</Text></View>
          </TouchableOpacity>
        </View>
        <View style={{ display: "flex", flexDirection: "row", marginTop: 10 }}>
          <View><Text style={{ color: "#000", fontSize: 16, fontWeight: "500" }}>{isDeviceSupportive ? 'Device Detected' : <View style={{ display: "flex", flexDirection: "row" }}><View><Text style={{ color: "red", fontSize: 16, fontWeight: "500", marginHorizontal: 30 }}>Device Not Dectected</Text></View><TouchableOpacity onPress={() => { isSupportive() }}><Text style={{ color: "#000", fontSize: 16, fontWeight: "500", marginHorizontal: 30 }}>Open Device</Text></TouchableOpacity></View>}</Text></View>
         
        </View>
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <View>

            <View style={{ display: "flex", flexDirection: "row" }}>
              <View>
                <Text style={{ fontSize: 16, color: verificationStatus === 'NOT VERIFIED' ? "red" : verificationStatus === 'VERIFIED' ? "green" : verificationStatus === 'VERIFYING...' ? "grey" : "black" }}>{verificationStatus}</Text>
              </View>
              <View>
                {verificationStatus === 'VERIFYING...' ? (
                  <ActivityIndicator size="small" color="grey" />
                ) : verificationStatus === 'VERIFIED' ? (
                  <Icons name="verified" size={50} color="green" />
                ) : verificationStatus === 'NOT VERIFIED' ? (
                  <Octo name="unverified" size={50} color="red" />
                ) : null}
              </View>
            </View>
          </View>
          {getOrderStatus(showOrderStatus)}
          {(verificationStatus === 'VERIFIED' && balanceamount) &&
  
          <View style={[
            styles.card,
            {
              width: width * 0.4, // Decrease the width as needed
            },
          ]}>
            <View style={styles.tableRow}>
              <Text style={styles.label}>Prisoner Details</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.label}>Prisoner Name:</Text>
              <Text style={styles.value}>{prisonerDetails.prisoner_name}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.label}>Prisoner ID:</Text>
              <Text style={styles.value}>{prisonerDetails.fingure_print_id}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.label}>Previous Balance:</Text>
              <Text style={styles.value}>{balanceamount}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.label}>IsValidate:</Text>
              <Text style={styles.value}>
                {prisonerDetails.fingure_image ? 'Validate' : 'Not Validate'}
              </Text>
            </View>
          </View>}
        </View>

      </View>

      {/* Loading Modal  // <Sync name="sync"  size={40} color='#192a53' style={styles.cartIcon} />*/}
      <Modal visible={loading} transparent>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Copying Database...</Text>
        </View>
      </Modal>
    </View>
  )
}

export default Cart

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    display: 'flex',
    flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'center',

  },
  cell: {
    flex: 1,
    padding: 10,
    fontSize: 15,
    fontWeight: 'bold',
    // width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    color: "#000"
  },
  cell1: {
    flex: 1,
    padding: 5,
    fontSize: 14,
    color: 'grey',
    fontFamily: 'roboto',
    // width: 100,
    textAlign: 'center',
    justifyContent: 'center',
    color: "#000",
    alignItems: "center"
  },
  cell2: {
    flex: 1,
    padding: 5,
    fontSize: 18,
    color: 'blue',
    fontFamily: 'roboto',
    width: 100,
    textAlign: 'center',
    color: "#000"
  },
  grandTotal: {
    flex: 1,
    padding: 10,
    fontSize: 20,
    color: '#000',
    fontFamily: 'roboto',
    width: 100,
    textAlign: 'center',
    marginLeft: 55,
    fontWeight: 'bold',

  },
  removeText: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: 'red',
    fontFamily: 'roboto',
    width: 100,
    textAlign: "center"
  },

  carttext: {
    color: '#000',
    fontFamily: 'roboto',
    fontSize: 18,
    textAlign: 'center',
  },
  avtar: {
    height: 60,
    width: 60,
    borderRadius: 50,
    marginLeft: 0,
    textAlign: "center"
  },
  snoStyle: {
    width: 10,
    flex: 1,
    padding: 10,
    fontSize: 15,
    fontWeight: 500,
    marginRight: 0,
    color: "#000",
    textAlign: "center"

  },
  button: {
    backgroundColor: 'blue',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  fingerStyles: {
    marginTop: 10,
    backgroundColor: '#D3D3D3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10
  },
  buttonWidth: {
    width: 180,
    marginHorizontal: 40,
    display: "flex",
    flexDirection: 'row'
  },
  openDevicebtn: {
    width: 300,
    marginHorizontal: 40,
    display: "flex",
    flexDirection: 'row'
  },
  container: {
    flex: 1,
    padding: 20,
  },
  bottonButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20

  },
  buttonWidth: {
    width: 150,
    marginHorizontal: 40,
    display: "flex",
    justifyContent: "center",
    marginTop: 0

  },
  capturebtn: {
    width: 160,
    marginHorizontal: 40,
    display: "flex",
    justifyContent: "center",
    marginTop: 0
  },
  //verify
  card: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 10,
  },
  icon: {
    fontSize: 40,
    color: 'red',
  },
  iconVerified: {
    fontSize: 40,
    color: 'green',
  },
  text: {
    fontSize: 18,
  },
  cardCenter: {
    display: "flex",
    justifyContent: "center"
  },
  centeredCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonTouchable: {
    borderRadius: 5,
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  stripedRow: {
    backgroundColor: 'grey', // Define your desired background color here
  },
  quantityContainer: {
    width: 50, // Adjust the width as needed
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: '30%', // Adjust the width as needed
  },
  value: {
    width: '30%', // Adjust the width as needed
  },
  buttonWidth: {
    backgroundColor: '#192a53',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  btntext: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  }
});
