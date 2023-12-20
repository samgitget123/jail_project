import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions, Alert, Button, Image, ActivityIndicator, Modal, Vibration } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeModules, NativeEventEmitter } from 'react-native';
import { isSameFinger, initialize, captureRawData } from '../../utils/trustFinger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Autosync from 'react-native-vector-icons/FontAwesome5';
import Fingureprint from 'react-native-vector-icons/Ionicons';
import Enrolldone from 'react-native-vector-icons/MaterialIcons'
import RNFetchBlob from 'rn-fetch-blob'
//import name 
import { NameProvider } from '../../CustomComponents/NameContext';
const emitter = new NativeEventEmitter(NativeModules.captureRawData);
const screenWidth = Dimensions.get('window').width;

const Enroll = ({ route }) => {
  const [prisonerRechargeActivity , setPrisonerRechargeActivity] = useState([]);  //prisoner recharge activity
  const navigation = useNavigation();
  const directoryPath = RNFS.DocumentDirectoryPath;
  console.log('Internal Storage Path:', RNFS.DocumentDirectoryPath);
  const { database } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedFingerId, setSelectedFingerId] = useState(null);
  const [isDeviceSupportive, setIsDeviceSupportive] = useState();
  const [imagePath, setImagePath] = useState('');
 // const [enrollmentStatus, setEnrollmentStatus] = useState('Tab Your Fingure for Enrollment'); // Default status
  const [name, setName] = useState('');
  const [EnrolledStatus, setEnrolledStatus] = useState('')
  const [fingerId, setFingerId] = useState('');
  //capturing raw data
  const [captureStatus, setCaptureStatus] = useState(false);
  //name set
  const handleFingerTabPress = (fingerId) => {
    setSelectedFingerId(fingerId);
  };
  //emiiter  

  emitter.addListener('capturedImage', (response) => {
    setCaptureStatus(true)
    setImagePath(response.capturedImagePath);
  });
  const isSupportive = async () => {
    const isSupported = await initialize();
    // console.log('isSupported:' + JSON.stringify(isSupported))
    Alert, alert('device Detected');
    setIsDeviceSupportive(isSupported);
  };

  const renderFingerTabs = () => {
    const fingerTabs = [];
    const totalFingers = 10; // Change this number as per your requirement

    for (let i = 1; i <= totalFingers; i++) {
      const fingerTabStyle =
        i === 5 ? styles.fifthFingerTab :
          i === 6 ? styles.sixthFingerTab :
            selectedFingerId === i ? styles.selectedFingerTab : styles.fingerTab;
      fingerTabs.push(
        <TouchableOpacity key={i} onPress={() => handleFingerTabPress(i)}>
          <View style={fingerTabStyle}></View>
          <Text style={styles.fingerText}>{`Fing ${i}`}</Text>
        </TouchableOpacity>
      );
    }

    return fingerTabs;
  };
  //useeffect
  useEffect(async () => {
    isSupportive();
    captureRawData(false);
    setImagePath('')
    createFingureEnrollment();
    setName('')
    setFingerId('')
    setSelectedFingerId('')
    setCaptureStatus(''); // Reset the capture status when the component mounts
    setEnrolledStatus('');
  }, []);

  const storeName = async () => {
    try {
      await AsyncStorage.setItem('prisonerDetails', name);
      //console.log('prisoner name stored in asyncstorage');
    } catch (error) {
      //console.log('Error storing cart items:', error);
    }
  };
  //crete table
  const createFingureEnrollment = async () => {
    database.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS dj_fingureEnroll (FingureId INTEGER PRIMARY KEY AUTOINCREMENT,prisoner_code TEXT NOT NULL , prisoner_name TEXT NOT NULL DEFAULT '',fingure_print_id INTEGER NOT NULL DEFAULT 0 , fingure_image BLOB NOT NULL , selectedFingureId INTEGER NOT NULL DEFAULT 0);",
        [],
        () => {
          console.log('Fingure enroll Table created successfully');
        },
        (error) => {
          console.log('Error creating table:', error);

        }
      )
    });
  }

  //////////////////
  const FingureEnrollment = () => {
      console.log(database, 'DATABASE==============>');
    if(imagePath === null){
      Alert.alert('please scan to imagePath')
    } 
    else if (name == '' || fingerId == '') {
      Alert.alert('please Enter required fields')
    } else if (imagePath === '') {
      Alert.alert('Fingure must be scanned for enrollment')
    } else {
      database.transaction((tx) => {
        tx.executeSql(
          'UPDATE DJ_prisoners SET fingure_print_id = ?, fingure_image = ? WHERE prisoner_code = ?',
          [fingerId, imagePath, name],  //name----> prisonercode
          () => {
            // Handle the success of the update
           // console.log('Update successful');
            Alert.alert('Enrollment Details inserted successfully');
           // console.log(imagePath, "imagePath");
                        setName('');
                        setFingerId('');
                        setImagePath('');
                        setSelectedFingerId('');
          },
          (error) => {
            // Handle errors during the update
            console.error('Error updating data:', error);
          }
        );     
      });
      captureRawData(false); 
    }
  }
  /////////////////
// Function to generate a 6-digit random code
function generateRandomCode() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}
  //save image
  const savefingureprintImage = async () => {
    console.log(imagePath, 'IMAGEPATHfromenroll');
    if (imagePath) {
      const folderName = 'Fingureprints';
      const fileName = 'img_1'; // You can provide a dynamic or unique name here
      const savedFilePath = await saveImageToInternalStorage(imagePath, folderName, fileName);
      if (savedFilePath) {
        console.log('Image saved to internal storage!!!!!!!!!:', savedFilePath);
        Alert.alert('Image saved');
      } else {
        console.log('NOT SAVED IMAGE/////////');
      }
    } else {
      //console.log('IMAGE NOT RECEIVED');
      Alert.alert('Image not saved');
    }
  };

  const copyDatabase = async () => {
    const destination = `${RNFS.ExternalDirectoryPath}/Jcms_database.db`;
    const source = '/data/data/com.jcms/databases/jcms.db';
    try {
      setLoading(true); // Start showing the loading indicator

      const exists = await RNFetchBlob.fs.exists(destination);
      if (exists) {
        await RNFS.unlink(destination);
      }

      console.log(RNFS.DocumentDirectoryPath, 'SOURCE DB FILE');
      await RNFetchBlob.fs.cp(source, destination);
      console.log('Database file copied successfully!');

    } catch (error) {
      console.log('Error copying database file:', error);
    } finally {
      // Hide the loading indicator after 3 seconds, regardless of success or error
      setTimeout(() => {
        setLoading(false);
        // Show alert after 3 seconds
        setTimeout(() => {
          Alert.alert('Database sychronised');
        }, 1000);
      }, 1000);
    }
  };

  const saveImageToInternalStorage = async (base64Data, folderName, fileName) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${folderName}`;
      const dirExists = await RNFS.exists(path);
      console.log('Directory Exists:', dirExists);
      if (!dirExists) {
        await RNFS.mkdir(path);
        console.log('Directory created:', path);
      }
      const filePath = `${path}/${fileName}.jpg`;
      console.log('File Path:', filePath);
      await RNFS.writeFile(filePath, base64Data, 'base64');
      console.log('Image saved successfully!');
      return filePath;
    } catch (error) {
      console.error('Error saving image to internal storage:', error); // Add this line to log the error
      return null;
    }
  };

  //export name to cart screen 
  return (
    <View
      style={[
        styles.container,
        {
          // Try setting `flexDirection` to `"row"`.
          flexDirection: 'column',
        },
      ]}>
      <View style={{ flex: 1, backgroundColor: '#192a53' }}></View>
      <View style={{ flex: 10, backgroundColor: '#fff', padding: 20 }} >
        <ScrollView>
          <View>
            <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 22, color: '#000' }}>Enroll With your FingerDetails</Text>
          </View>
          {/*form*/}
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}><Text>Enter Your details</Text></View>
          <View style={styles.form}>
            <View style={[styles.inputContainer, { width: screenWidth / 2 - 20 }]}>
              <TextInput
                style={styles.input}
                placeholder="PrisonerCode"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={[styles.inputContainer, { width: screenWidth / 2 - 20 }]}>
              <TextInput
                style={styles.input}
                placeholder="Finger ID Number"
                value={fingerId}
                onChangeText={setFingerId}
                keyboardType="numeric"
              />
            </View>
          </View>
          {/******* */}
          <View style={{ marginHorizontal: 10, marginBottom: 10 }}><Text>Choose Fingure</Text></View>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: "center" }}>
            {renderFingerTabs()}
          </View>
          <View style={{ marginTop: 10 }}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={{marginHorizontal:20}}>
                <Text style={{ color: "#000", fontSize: 16, fontWeight: "500" }}>
                  {isDeviceSupportive ? 'Device Detected' : <View style={{ display: "flex", flexDirection: "row" }}><View><Text style={{ color: "red", fontSize: 16, fontWeight: "500", marginHorizontal: 30 }}>Device Not Dectected</Text></View><TouchableOpacity onPress={() => { isSupportive() }}><Text style={{ color: "#000", fontSize: 16, fontWeight: "500", marginHorizontal: 30 }}>Open Device</Text></TouchableOpacity></View>}
                </Text>
              </View>
              <View>
                <Text style={{ color: "#000", fontSize: 16, fontWeight: "500" }}>
                  {captureStatus === true ? 'Capturing ON' : (<View style={{ display: "flex", flexDirection: "row" }}><View><Text style={{ color: "red", fontSize: 16, fontWeight: "500", marginHorizontal: 30 }}>Not yet Captured</Text></View></View>)}
                </Text>
              </View>
            </View>
          </View>
          <View>
            {imagePath === ''  ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Fingureprint name='finger-print' size={60} color='black' />
                <Text style={{ color: 'green', marginLeft: 5 }}>Scan your fingure on scan tab</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Enrolldone name='done-outline' size={60} color='green' />
                <Text style={{ color: 'green', marginLeft: 5 }}>Fingerprint Scanned</Text>
              </View>
            )}
          </View>
          {console.log(imagePath, 'IMAGEPATH==123====')}
        </ScrollView>
        <View style={{ display: "flex", flexDirection: "row" }}>

          {/*  <View style={styles.capturebtn}>
            <Button Fingureprint
              onPress={
                () => {
                  isSupportive()
                }
              }
              title="Open Device"
              color="#192a53"
            />
          </View>
          <View style={styles.capturebtn}>
            <Button
              onPress={
                () => {
                  captureRawData(false)
                }
              }
              title="CaptureData"
              color="#192a53"
            />
            </View> */}
          <View style={styles.buttonWidth}>
            <View>
              <Button
                onPress={
                  () => {
                    FingureEnrollment();
                    Vibration.vibrate(100)
                    //savefingureprintImage()
                  }
                }
                title="Submit"
                color="#192a53"
              />
            </View>
          </View>
          <View style={styles.buttonWidth}>
            <View>
              <Button
                onPress={
                  () => {
                    navigation.goBack()
                    Vibration.vibrate(100)
                  }
                }
                title="Back"
                color="#192a53"
              />
            </View>
          </View>
          <View style={styles.buttonWidth}>
            <TouchableOpacity
              onPress={
                () => {
                  copyDatabase();
                  Vibration.vibrate(100);
                }
              }
            >
              <View style={styles.buttonWidth}>
                <Autosync name='sync' color='#000' size={30} />
              </View>
            </TouchableOpacity>
          </View>



        </View>
      </View>
      <View style={{ flex: 1, backgroundColor: '#192a53' }} ></View>
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


export default Enroll

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fingerTab: {
    width: 60,
    height: 80,
    backgroundColor: '#A9A9A9',
    marginHorizontal: 20,

    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden', // Clip the bottom corners
  },
  fifthFingerTab: {
    width: 80,
    height: 80,
    backgroundColor: '#A9A9A9',
    marginHorizontal: 20,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden', // Clip the bottom corners
  },
  sixthFingerTab: {
    width: 80,
    height: 80,
    backgroundColor: '#A9A9A9',
    marginHorizontal: 20,

    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden', // Clip the bottom corners
  },
  selectedFingerTab: {
    width: 60,
    height: 80,
    backgroundColor: '#192a53', // Add a different color for the selected fingerTab
    marginHorizontal: 20,

    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden', // Clip the bottom corners
  },
  fingerText: {
    textAlign: 'center',
    marginTop: 5,
  },
  //form
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  heading: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 22,
    color: '#000',
  },
  form: {
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 10
  },
  buttonWidth: {
    width: 120,
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
  buttonTouchable: {
    borderRadius: 5,
    overflow: 'hidden',
    paddingHorizontal: 10,
  },

})