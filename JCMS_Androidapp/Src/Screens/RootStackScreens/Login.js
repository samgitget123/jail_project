import React, { useEffect, useState } from 'react';
import * as RootNavigation from '../../../Src/RootNavigation';
import { View, Text, Button, StyleSheet, TextInput, Image, Alert , Permission} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// export const navigationRef = createNavigationContainerRef()
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
//import Permissions from 'react-native-permissions';
//Database
import { openDatabase } from 'react-native-sqlite-storage';
// const db = openDatabase({name:'jcms.db' , location:'default'})

const Login = () => {
  const [stationId, setStationId] = useState("");
  const [password, setPassword] = useState("");
  const navigation =   useNavigation();
    useEffect(() => {
        createJailUsersTable(); //call create table function here
        insertJailUser();  //this will insert user details
    },[])
    
    const createJailUsersTable = () => {
        const db = openDatabase(
          {
            name: 'jcms.db',
            location: 'default'
          },
          () => {
            console.log("Database connected!");
          },
          error => console.log("Database error", error)
        );
      
        db.transaction((tx) => {
          try {
            tx.executeSql(
              "CREATE TABLE IF NOT EXISTS jail_users (station_id INTEGER NOT NULL, user_name TEXT NOT NULL, password TEXT NOT NULL)",
              [],
              () => {
                console.log("jail_users Table created successfully");
                insertJailUser();
              },
              (error) => {
                console.log("Create table error", error);
              }
            );
      
            // Mark the transaction as successful
            tx.setTransactionSuccessful();
          } catch (error) {
            console.log("Transaction error", error);
          } finally {
            // End the transaction
            tx.endTransaction();
          }
        });
      
       // truncateTableLogin(db); // delete login table
      };
      

    //create dummy user

    useEffect(() => {
       //createUser();
        //requestWritePermission(); //taking permission
        RNFS.unlink(filePath) // Clear previous transactions by deleting the file
            .then(() => {
                console.log('Previous transactions cleared!');
                fetchUserData(); // Fetch and append new data
            })
            .catch(error => {
                console.log('Error clearing previous transactions:', error);
                fetchUserData(); // Fetch and append new data even if clearing previous transactions fails
            });
        // createTextFile(filePath, fileContent);  //creting text file
    }, [])
    //crete text file
    // const createTextFile = async (filePath, content) => {
    //     try {
    //         await RNFS.writeFile(filePath, content, 'utf8');
    //         console.log('Text file created successfully!');
    //     } catch (error) {
    //         console.log('Error creating text file:', error);
    //     }
    // };

    let filePath;
    if (Platform.OS === 'android') {
      filePath = `${RNFS.ExternalDirectoryPath}/jcms_userlogin.txt`;
    } else {
      filePath = `${RNFS.DocumentDirectoryPath}/jcms_userlogin.txt`;
    }
    // const requestWritePermission = async () => {
    //     try {
    //       const granted = await Permissions.request(
    //         Platform.OS === 'android'
    //           ? 'android.permission.WRITE_EXTERNAL_STORAGE'
    //           : 'ios.permission.WRITE_EXTERNAL_STORAGE'
    //       );
      
    //       if (granted === 'authorized') {
    //         RNFS.writeFile(filePath, 'File content', 'utf8')
    //           .then(() => {
    //             console.log('File saved successfully');
    //           })
    //           .catch(error => {
    //             console.log('Error saving file:', error);
    //           });
    //       } else {
    //         console.log('Write permission denied');
    //       }
    //     } catch (error) {
    //       console.log('Error requesting permission:', error);
    //     }
    //   };

   
    const insertJailUser = () => {
        const db = openDatabase(
          {
            name: 'jcms.db',
            location: 'default'
          },
          () => {
            console.log("Database connected!");
          },
          error => console.log("Database error", error)
        );
      
        const insertQuery = "INSERT INTO jail_users (station_id, user_name, password) VALUES (?, ?, ?)";
        const values = [1001, 'barac1', 'dtel12345'];
      
        db.transaction((tx) => {
          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS jail_users (station_id INTEGER NOT NULL, user_name TEXT NOT NULL, password TEXT NOT NULL)",
            [],
            () => {
              console.log("jail_users Table created successfully");
              tx.executeSql(insertQuery, values, (_, { insertId }) => {
                console.log(`Row inserted with ID: ${insertId}`);
                db.close()
              });
            },
            (error) => {
              console.log("Create table error", error);
              db.close()
            }
          );
        });
      };
      

    //append query
    // Append select query and data as JSON to the text file
    const appendSelectQuery = (query, data) => {
        const insertQuery = `${JSON.stringify(data, null, 2)};\n`;

        RNFS.appendFile(filePath, insertQuery, 'utf8')
            .then(() => {
               
    
            })
            .catch(error => console.log('Error appending select query to text file:', error));
    };
    // Fetch user data info and append to the text file
    const fetchUserData = () => {
        const db = openDatabase({
            name: 'jcms.db',
            location: 'default'
        });

        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM jail_users',
                [],
                (_, result) => {
                    const userData = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        userData.push(result.rows.item(i));
                    }
                    appendSelectQuery('SELECT * FROM jail_users', userData);
                    
                },
                (_, error) => {
                    console.log('Error fetching user data:', error);
                    
                }
            );
        });
    };
    //////////

    //check users and validation and get login
    //list all the users
    console.log(stationId , 'stationId');
    console.log(password , 'Password');
    const loginUser = (stationId, password) => {

        return new Promise((resolve, reject) => {
            const db = openDatabase(
                {
                    name: 'jcms.db',
                    location: 'default'
                },
                () => {
                    db.transaction(tx => {
                        tx.executeSql(
                            'SELECT * FROM jail_users WHERE station_id = ? AND password = ?',
                            [stationId, password],
                            (_, { rows }) => {
                                resolve(rows.length > 0);
                            },
                            (_, error) => {
                                reject(error);
                            },
                        );
                        
                    });
                },
                error => {
                    reject(error);
                    
                },
            );
        });
    };
    //navigation
    const gotoHome = async () => {
      navigation.navigate('Drawerstackscreen');
    }

    //Handle login
    const handleSubmit = async () => {
        try {
        
            const UserLogin = await loginUser(stationId, password);
            // navigation.navigate('Drawerstackscreen');
            if (UserLogin) {
              Alert.alert('Logged in')
              navigation.navigate('Drawerstackscreen');
                setStationId('');
                setPassword('');
            } else {
                Alert.alert('Not Logged In');
            }
        } catch (error) {
            console.log('Error during login:', error);
            // Handle the error case
        }
    };

    // const [stationId, setStationId] = useState("");
    // const [password, setPassword] = useState("");

    //console.log(stationId);
    const onChangeStationId = (text) => {
      setStationId(text);
  }
  
  const onChangePassword = (text) => {
      setPassword(text);
  }
  

  //Delete table login
  // const truncateTableLogin = (database) => {
  //   database.transaction((tx) => {
  //     tx.executeSql(
  //       'DELETE FROM jail_users',
  //       [],
  //       () => {
  //         console.log('Table truncated successfully');
  //         db.close();
  //       },
  //       (error) => {
  //         console.log('Error truncating table:', error);
  //         db.close();
         
  //       }
  //     );
  //   });
  // };
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.imageAlign}>
                    <Image style={styles.avatar}
                        source={require('../../Assets/avtar.png')}
                    />
                </View>
                <Text style={styles.textStyling}>TIHAR JAIL LOGIN</Text>
                <View style={styles.inputWidth}>
                <TextInput onChangeText={onChangeStationId} value={stationId} style={styles.input} placeholder="Station Id" />
                <TextInput onChangeText={onChangePassword} value={password} secureTextEntry={true} style={styles.input} placeholder="Password" />                
                <View style={styles.buttonStyle} >
                    <Button style={styles.insideButton} title="Login" onPress={() => {
                        handleSubmit()
                    }} />
                </View>
            </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        width: 320,
        height: 320,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        padding: 16,
    },
    textStyling: {
        fontSize: 20,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: 'rgb(67,67,67)',
        textAlign: 'center',
        marginBottom: 5,
    },
    input: {
        width: 280,

        borderWidth: 2,
        borderColor: '#CED4DA',
        marginTop: 10,
        paddingHorizontal: 10,
        fontSize: 20,
    },
    inputWidth: {
        width: 300,
        textAlign: 'center',
        marginLeft: 5,



    },
    buttonStyle: {
        width: 280,
        marginTop: 10,
        fontSize: 80,

    },
    insideButton: {
        color: 'red',
        fontSize: 85,
    },
    avatar: {
        width: 50,
        height: 50,
        marginTop: 5,
        marginLeft: 5,

    },

    imageAlign: {
        //backgroundColor: '#3E9FFA',

        borderRadius: 200,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },


});

export default Login;
