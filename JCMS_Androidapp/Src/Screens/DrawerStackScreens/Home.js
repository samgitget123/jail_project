import { StyleSheet, Text, View, FlatList, Image, Button, NativeModules, Platform, Alert,ActivityIndicator, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
//imports
import RNFetchBlob from 'rn-fetch-blob'
import Header from './Header'
//sliders card
//card
import Cards from '../../CustomComponents/Cards'
import PrisonersListDetails from './PrisonersListDetails'
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
//Database
import { openDatabase } from 'react-native-sqlite-storage';


const Home = ({ navigation }) => {
  //initialise database connection
  
  const [loading, setLoading] = useState(false);
  const [db, setDb] = useState(null);
  const [data, setData] = useState([]);
  const [foodItemsdata, setFooditemsdata] = useState([]);                         //Canteen Menu Item data
  const [prisonersListdata , setPrisonerslistdata] = useState([]);                //prisoners list data
  const [prisonerRechargeActivity , setPrisonerRechargeActivity] = useState([]);  //prisoner recharge activity
  const [prisonerData, setPrisonerData] = useState([]);
  
  module.exports = data;
  //module.exports = NativeModules.MediaScanner;
 
  useEffect(() => {
    //removeItems();  //it will remove the selected items
   
    const initializeDatabase = async () => {
      openDatabase(
        {
          name: 'jcms.db',
          location: 'default',
          //createFromLocation: 'Database/jcms.db',
        },
        (database) => {
          setDb(database);  //database
          truncateTable(database);  //it must , it deletes food items
        //  truncatePrisonerdetailTable(database);
         // createFooditemstableandinsert(database); //insert and retreive
           //Create prisoner list data table
          insertPrisonersData(database);  //from server
          //Createtableforprisonersdetails(database) //prisonerdata
          getRechargeActivity(database);  //getting all recharge activities
        },
        (error) => {
          console.log('Database connection error:', error);
        }
      );
      RNFS.unlink(filePath) // Clear previous transactions by deleting the file
        .then(() => {
          console.log('Previous food items data cleared!');
          retrieveData(); // Fetch and append new data

        })
        .catch(error => {
          console.log('Error clearing previous :', error);
          retrieveData(); // Fetch and append new data even if clearing previous transactions fails

        });
      RNFS.unlink(prisonerfile) // Clear previous transactions by deleting the file
        .then(() => {
          console.log('Previous  prisoner detail data cleared!');
          retrievePrisonerData();
        })
        .catch(error => {
          console.log('Error clearing previous :', error);
          retrievePrisonerData();
        });
    };

    initializeDatabase();
   //Fetch prisoner data from api
  //  getprisonersList();
     // Fetch data from your API
     getcanteenFoodItems();
    
  }, []);
  /////Remove carts when come to home//
  const removeItems = () => {
    AsyncStorage.removeItem('addeditems');
  }
 //get prisoners details from the server
//  const getprisonersList = () => {
//   fetch('http://172.16.12.41/JCMS/api/prisoner_details.php')
//      .then((response) => response.json())
//      .then((responseData) => {
//        // Assuming the API returns an array of food items
//        setPrisonerslistdata(responseData.PrisonerLists);
//      })
//      .catch((error) => {
//        console.error('Error fetching data:', error);
//      });
//  }
  /////////////////////////////////////////////////get fetch all food items///////////////////////////////////////////////////////////////
  ///// it will get the canten menu Items from the server and display as it is on tablet/////
  const getcanteenFoodItems = () => {
    fetch('http://103.167.216.234/JCMS/api/Food_items.php')
     .then((response) => response.json())
     .then((responseData) => {
       // Assuming the API returns an array of food items
       setFooditemsdata(responseData.foodItems);
     })
     .catch((error) => {
       console.error('Error fetching data:', error);
     });
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // const createFooditemstableandinsert = async (database) => {
  //   database.transaction((tx) => {
  //     tx.executeSql(
  //       "CREATE TABLE IF NOT EXISTS dj_food_items (item_id INTEGER , item_name TEXT NOT NULL, description TEXT, category TEXT, item_price REAL NOT NULL, Is_Available INTEGER NOT NULL DEFAULT 0, quantity INTEGER NOT NULL DEFAULT 0, image TEXT NOT NULL, image_data BLOB NOT NULL, image_name TEXT NOT NULL)",
  //       [],
  //       () => {
  //         console.log('Fooditems Table created successfully');

  //         tx.executeSql(
  //           'SELECT * FROM dj_food_items',
  //           [],
  //           (_, results) => {
  //             const rows = results.rows;
  //             if (rows.length >= 0) {
  //               const initialData = [
  //                 { item_id: 1, item_name: 'Biscuit', description: 'Snacks', category: 'snacksbis', item_price: 10.00, Is_Available: 1, quantity: 20, image: require('../../Assets/biscuit.jpg'), image_data: '', image_name: '' },
  //                 { item_id: 2, item_name: 'Juice', description: 'BreakFast', category: 'snacksbis', item_price: 20.00, Is_Available: 1, quantity: 10, image: require('../../Assets/juice.jpg'), image_data: '', image_name: '' },
  //                 { item_id: 3, item_name: 'chocklate', description: 'Chocos', category: 'snacksbis', item_price: 10.00, Is_Available: 1, quantity: 10, image: require('../../Assets/chocklate.jpg'), image_data: '', image_name: '' },
  //                 { item_id: 4, item_name: 'Meals', description: 'Lunch', category: 'snacksbis', item_price: 60.00, Is_Available: 1, quantity: 9, image: require('../../Assets/meals.jpg'), image_data: '', image_name: '' },
  //                 { item_id: 5, item_name: 'snacks', description: 'Snacks', category: 'snacksbis', item_price: 20.00, Is_Available: 1, quantity: 2, image: require('../../Assets/snacks.jpg'), image_data: '', image_name: '' },
  //                 { item_id: 6, item_name: 'Rings', description: 'Snacks', category: 'snacksbis', item_price: 10.00, Is_Available: 1, quantity: 10, image: require('../../Assets/rings.jpg'), image_data: '', image_name: '' },
  //                 { item_id: 7, item_name: 'Chapatti', description: 'BreakfAST', category: 'snacksbis', item_price: 25.00, Is_Available: 1, quantity: 20, image: require('../../Assets/chappati.jpg'), image_data: '', image_name: '' },
  //                 { item_id: 8, item_name: 'CurdRice', description: 'Meal', category: 'snacksbis', item_price: 45.00, Is_Available: 1, quantity: 50, image: require('../../Assets/curdrice.jpg'), image_data: '', image_name: '' },
  //                 { item_id: 9, item_name: 'LemonRice', description: 'Meal', category: 'snacksbis', item_price: 45.00, Is_Available: 1, quantity: 10, image: require('../../Assets/lemonrice.jpg'), image_data: '', image_name: '' },
  //               ];

  //               for (let i = 0; i < initialData.length; i++) {
  //                 const { item_id, item_name, description, category, item_price, Is_Available, quantity, image, image_data, image_name } = initialData[i];
  //                 tx.executeSql(
  //                   "INSERT INTO dj_food_items (item_id, item_name, description, category, item_price, Is_Available, quantity, image, image_data, image_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  //                   [item_id, item_name, description, category, item_price, Is_Available, quantity, image, image_data, image_name],
  //                   () => {
  //                     console.log('Data inserted successfully');

  //                   },
  //                   (error) => {
  //                     console.log('Error inserting data:', error);

  //                   }
  //                 );
  //               }
  //             }
  //             // Retrieve data if table already has records
  //             retrieveData(database);
  //             //copyDatabase
  //             const destination = `${RNFS.ExternalDirectoryPath}/Jcms_database.db`;
  //             const source = '/data/data/com.jcms/databases/jcms.db';
  //             try {
  //               const exists = RNFetchBlob.fs.exists(destination);
  //               if (exists) {
  //                 RNFS.unlink(destination);
  //               }

  //               console.log(RNFS.DocumentDirectoryPath, 'SOURCE DB FILE');
  //               RNFetchBlob.fs.cp(source, destination);
  //               console.log('Database file copied successfully!');
  //               Alert.alert('Database copied');
  //             } catch (error) {
  //               console.log('Error copying database file:', error);
  //             }
  //           },
  //           (error) => {
  //             console.log('Error selecting records:', error);

  //           }
  //         );
  //       },
  //       (error) => {
  //         console.log('Error creating table:', error);
  //         // 
  //       }
  //     );
  //   });
  // };

 

  //Retrieve Data
  const retrieveData = (database) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM dj_food_items',
        [],
        (_, results) => {
          const rows = results.rows;
          
          const data = [];
          for (let i = 0; i < rows.length; i++) {
            const { item_id, item_name, description, category, item_price, Is_Available, quantity, image, image_data, image_name } = rows.item(i);
            data.push({ item_id, item_name, description, category, item_price, Is_Available, quantity, image, image_data, image_name });

          }
          setData(data);
          appendSelectQuery('SELECT * FROM dj_food_items', data) //text file
          //console.log(data, 'Food item data retrived successfully');

        },
        (error) => {
          console.log('Error retrieving data:', error);

        }
      );
    });
  };
 
  let filePath;
  let prisonerfile;
  if (Platform.OS === 'android') {
    filePath = `${RNFS.ExternalDirectoryPath}/jcms_orderedFoodItems.txt`;  //RNFS.ExternalDirectoryPath
    prisonerfile = `${RNFS.ExternalDirectoryPath}/jcms_PrisonersDetails.txt`;
  } else {
    filePath = `${RNFS.DocumentDirectoryPath}/jcms_orderedFoodItems.txt`;
    prisonerfile = `${RNFS.ExternalDirectoryPath}/jcms_PrisonersDetails.txt`;
  }
  const appendSelectQuery = (query, data) => {
    const insertQuery = `${JSON.stringify(data, null, 2)};\n`;

    RNFS.appendFile(filePath, insertQuery, 'utf8')
      .then(() => {
      })
      .catch(error => console.log('Error appending select query to text file:', error));
  };

  const appendSelectorisonerQuery = (query, data) => {
    const insertQuery = `${JSON.stringify(data, null, 2)};\n`;

    RNFS.appendFile(prisonerfile, insertQuery, 'utf8')
      .then(() => {
      })
      .catch(error => console.log('Error appending select query to text file:', error));
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //Delete table
  const truncateTable = (database) => {
    database.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM dj_food_items',
        [],
        () => {
          console.log('Table truncated successfully');

        },
        (error) => {
          console.log('Error truncating table:', error);


        }
      );
    });
  };
  
  //sample delete function
  const database = () => {
    const db = openDatabase(
      {
        name: 'jcms.db',
        location: 'default',
      },
    )
  }



  //truncate prisoner details
  // const truncatePrisonerdetailTable = (database) => {
  //   database.transaction((tx) => {
  //     tx.executeSql(
  //       'DELETE FROM dj_prisoners',
  //       [],
  //       () => {
  //         console.log('prisoner Table truncated successfully');

  //       },
  //       (error) => {
  //         console.log('Error truncating table:', error);

  //       }
  //     );
  //   });
  // };


  


//////////////////////////////////////////////////////////////Insert prisoner details///////////////////////////////////////////////////////////
/////////////////////////////// here we are taking all the prisoners info via APiz
  const insertPrisonersData = (database) => {
    // Create the table if it doesn't exist
    database.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS DJ_prisoners (sno INTEGER PRIMARY KEY AUTOINCREMENT, prisoner_name TEXT NOT NULL, prisoner_code TEXT UNIQUE NOT NULL, jail_id INTEGER NOT NULL, assign_phone_nos TEXT NOT NULL, calling_type TEXT NOT NULL, is_vip INTEGER NOT NULL, otp_number TEXT NOT NULL, code TEXT NOT NULL, fingure_print_id BIGINT NOT NULL , fingure_image BLOB);",
        [],
        () => {
          // Fetch data from the API and insert it into the table
          fetch('http://103.167.216.234/JCMS/api/prisoner_details.php')
            .then((response) => response.json())
            .then((responseData) => {
              setPrisonerslistdata(responseData.rechargeActivity);  //set state
              const prisonersList = responseData.rechargeActivity;
              if (prisonersList.length > 0) {
                database.transaction((tx) => {
                  prisonersList.forEach((prisoner) => {
                    const {
                      prisoner_name,
                      prisoner_code,
                      jail_id,
                      assign_phone_nos,
                      calling_type,
                      is_vip,
                      otp_number,
                      code,
                      fingure_print_id, 
                      fingure_image,
                    } = prisoner;
  
                    tx.executeSql(
                      'INSERT INTO DJ_prisoners (prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id, fingure_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                      [
                        prisoner_name,
                        prisoner_code,
                        parseInt(jail_id),
                        assign_phone_nos, // Assuming this is a comma-separated string
                        calling_type,
                        parseInt(is_vip),
                        otp_number,
                        code,
                        fingure_print_id,
                        fingure_image,
                      ],
                      (_, results) => {
                        console.log('Data inserted successfully into DJ_prisoners table from the server');
                      },
                      (_, error) => {
                        console.error('Error inserting data into DJ_prisoners table:', error);
                      }
                    );
                  });
                });
              } else {
                console.warn('No valid data to insert into the database.');
              }
            })
            .catch((error) => {
              console.error('Error fetching data from the API:', error);
            });
        },
        (_, error) => {
          console.error('Error creating DJ_prisoners table:', error);
        }
      );
    });
  };
  //////////////////////////////////////GET RECHARGE ACTIVITY OF PRISONERS/////////////////////////////////////////////////////////////
//////////HERE WE ARE TAKING THE RECHARGE ACTIVITY STATUS PF PRISONER/////////////////////////////////////////////////
const getRechargeActivity = (database) => {
  // Create the table if it doesn't exist
  database.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS reacharge_activity(prisoner_code TEXT NOT NULL,prisoner_name TEXT,jail_id TEXT NOT NULL,recharge_amount TEXT NOT NULL,previous_balance_amount TEXT,recharge_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,current_balance_amount TEXT NOT NULL);",
      [],
      () => {
        // Fetch data from the API and insert it into the table
        fetch('http://103.167.216.234/JCMS/api/recharge_activity.php')
          .then((response) => response.json())
          .then((responseData) => {
            setPrisonerRechargeActivity(responseData.rechargeActivity);  //set state
            const Rechargeactivities = responseData.rechargeActivity;
            if (Rechargeactivities.length > 0) {
              database.transaction((tx) => {
                Rechargeactivities.forEach((recharge) => {
                  const {
                    prisoner_code,
                    prisoner_name,
                    jail_id,
                    recharge_amount ,
                    previous_balance_amount,
                    recharge_date,
                    current_balance_amount ,
                  } = recharge;

                  tx.executeSql(
                    'INSERT INTO reacharge_activity(prisoner_code, prisoner_name, jail_id, recharge_amount, previous_balance_amount, recharge_date, current_balance_amount) VALUES (?, ?, ?, ?, ?, ?, ?);',
                    [
                      prisoner_code,
                      prisoner_name,
                      parseInt(jail_id),
                      recharge_amount, // Assuming this is a comma-separated string
                      previous_balance_amount,
                      recharge_date,
                      current_balance_amount
                    ],
                    (_, results) => {
                      console.log('Data inserted successfully into recharge_activity table from the server');
                    },
                    (_, error) => {
                      console.error('Error inserting data into recharge_activity table:', error);
                    }
                  );
                });
              });
            } else {
              console.warn('No valid data to insert into the database.');
            }
          })
          .catch((error) => {
            console.error('Error fetching data from the API:', error);
          })
          .finally(() => {
            database.close(); // Close the database connection in the finally block
          });
      },
      (_, error) => {
        console.error('Error creating recharge activity table:', error);
      }
    );
  });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  

  
  // Call the insertPrisonersData function when needed, e.g., during app initialization
  // const Createtableforprisonersdetails = (database) => {
  //   database.transaction((tx) => {
  //     tx.executeSql(
  //       "CREATE TABLE IF NOT EXISTS dj_prisoners(sno INTEGER NOT NULL,prisoner_name TEXT NOT NULL DEFAULT '',prisoner_code TEXT NOT NULL DEFAULT '',jail_id INTEGER NOT NULL DEFAULT 0,assign_phone_nos TEXT NOT NULL,calling_type TEXT CHECK(calling_type IN ('code', 'rfid')) NOT NULL DEFAULT 'code',is_vip INTEGER NOT NULL DEFAULT 0,otp_number TEXT NOT NULL DEFAULT '0',code TEXT NOT NULL DEFAULT '0',fingure_print_id INTEGER NOT NULL DEFAULT 0);",
  //       [],
  //       () => {
  //         console.log('prisoners Table created successfully----');

  //         tx.executeSql(
  //           'SELECT * FROM dj_prisoners',
  //           [],
  //           (_, results) => {
  //             const rows = results.rows;
  //             if (rows.length >= 0) {
  //               const prisonerDetails = [
  //                 //153, 'Mohibba', '12345', 39, '8125951705', 'rfid', 0, '0', 'Test Code', 0
  //                 { sno: 1, prisoner_name: 'sampath', prisoner_code: '1001', jail_id: 1400, assign_phone_nos: '849484774', calling_type: 'rfid', is_vip: 0, otp_number: 0, code: 'Test Code', fingure_print_id: 0 },
  //                 // { sno: 2, prisoner_name: 'srinivas', prisoner_code: '1001', jail_id: 1400, assign_phone_nos: '849484774', calling_type: 'rfid', is_vip: 0, otp_number: 0, code: 'Test Code', fingure_print_id: 0 },
  //               ];

  //               for (let i = 0; i < prisonerDetails.length; i++) {
  //                 const { sno, prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id } = prisonerDetails[i];
  //                 tx.executeSql(
  //                   "INSERT INTO dj_prisoners (sno, prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  //                   [sno, prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id],
  //                   () => {
  //                     console.log('prisoner Data inserted successfully');

  //                   },
  //                   (error) => {
  //                     console.log('Error inserting data:', error);

  //                   }
  //                 );
  //               }
  //             }
  //             retrievePrisonerData(database) //retrieve

  //           },
  //           (error) => {
  //             console.log('Error selecting records:', error);

  //           }
  //         );
  //       },
  //       (error) => {
  //         console.log('Error creating table:', error);

  //       }
  //     );
  //   });
  // };


  // const insertPrisonerData = (tx) => {
  //   const prisonerDetails = [
  //     { sno: 1, prisoner_name: 'sampath', prisoner_code: '1001', jail_id: 1400, assign_phone_nos: '849484774', calling_type: 'rfid', is_vip: 0, otp_number: 0, code: 'Test Code', fingure_print_id: 0 },
  //   ];

  //   for (let i = 0; i < prisonerDetails.length; i++) {
  //     const { sno, prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id } = prisonerDetails[i];
  //     tx.executeSql(
  //       "INSERT INTO dj_prisoners (sno, prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  //       [sno, prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id],
  //       () => {
  //         console.log('prisoner Data inserted successfully');
  //       },
  //       (error) => {
  //         console.log('Error inserting data:', error);
  //       }
  //     );
  //   }
  // };

  // Usage
  // Call Createtableforprisonersdetails(database) passing the database instance

  //Retrieve prisoner Data
  const retrievePrisonerData = (database) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM dj_prisoners',
        [],
        (_, results) => {
          const rows = results.rows;
          //console.log(rows, 'number of rows in prisoner table');
          const data = [];
          for (let i = 0; i < rows.length; i++) {
            const { sno, prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id, fingure_image, selectedFingureId } = rows.item(i);
            data.push({ sno, prisoner_name, prisoner_code, jail_id, assign_phone_nos, calling_type, is_vip, otp_number, code, fingure_print_id, fingure_image, selectedFingureId });

          }
          setPrisonerData(data);
          appendSelectorisonerQuery('SELECT * FROM dj_prisoners', data) //text file

        },
        (error) => {
          console.log('Error retrieving data:', error);

        }
      );
    });
  };


  const PrisonerList = [
    { item: 1, name: 'srinivas', prisonerId: 1001, baracno: 1, Jail: 'Tihar' },
  ];
  //const [prisonersNames, setPrisionersNames] = useState(PrisonerList);
  //   //statesQQQQQQQQQQ
  //   const [loadCards, setLoadCards] = useState(cardData);
  //example


  return (
    <View style={[styles.container, {
      flexDirection: 'column'
    }]}>
      {/*Header*/}
      <View style={{ flex: 1 }}><Header database={db} /></View>
      {/* cards */}
      <View style={{ flex: 8 }}>
        <Cards menuData={foodItemsdata} database={db} />
      </View>
      {/*Prisoner details*/}
      <View style={{
        flex: 3
        , paddingTop: 50
      }}>
        <PrisonersListDetails PrisonerDetails={prisonerData} database={db}/>
     

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

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  homehead: {
    fontSize: 22,
    fontWeight: "500",
    color: "#000"
  },
  //Cards styles
  cardView: {
    width: '100%',
    padding: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderRadius: 8,
    elevation: 3,
    marginBottom: 20,
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
    width: 60,
  },
  buttonWidth: {
    width: 120,
  },

})