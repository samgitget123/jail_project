import { StyleSheet, Text, View, FlatList, Image, Button, Alert, ActivityIndicator, Modal, TouchableOpacity, Vibration } from 'react-native'
import React, { useState } from 'react'
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import Sync from 'react-native-vector-icons/FontAwesome5';
import Autosync from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
const PrisonersListDetails = ({ PrisonerDetails, database }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  console.log(PrisonerDetails, '++++++++++++++++++PRISONERDETAILS++++++++++++++++++++++++')
  const copyDatabase = async () => {
    const destination = `${RNFS.ExternalDirectoryPath}/Jcms_database.db`;
    const source = '/data/data/com.jcms/databases/jcms.db';
    try {
      setLoading(true); // Start showing the loading indicator

      const exists = await RNFetchBlob.fs.exists(destination);
      if (exists) {
        await RNFS.unlink(destination);
      }

      //console.log(RNFS.DocumentDirectoryPath, 'SOURCE DB FILE');
      await RNFetchBlob.fs.cp(source, destination);
      //console.log('Database file copied successfully!');

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
  }

  return (
    <View>
      <FlatList
        data={PrisonerDetails}
        keyExtractor={(item) => item.item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <View style={{ padding: 20 }}>
              <View><Text style={styles.prisonerHead}>Prisoner Details</Text></View>
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', padding: 20 }}>
                <Text style={styles.name}>Name: {item.prisoner_name}</Text>
                <Text style={styles.bio}>Code: {item.prisoner_code}</Text>
                <Text style={styles.bio}>Jail ID: {item.jail_id}</Text>
                <Text style={styles.bio}>Assign Mobile: {item.assign_phone_nos}</Text>
                <View style={{ marginLeft: 50, display: "flex", flexDirection: "row" }}>

                  <TouchableOpacity
                    activeOpacity={0.6}
                    underlayColor="#DDDDDD"
                    style={styles.buttonTouchable}
                    onPress={() => {
                      navigation.navigate('Enroll', { database: database });
                      Vibration.vibrate(100);
                    }}
                  >
                    <View style={styles.buttonWidth}><Text style={styles.btntext}>ENROLL</Text></View>

                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={
                      () => {
                        copyDatabase();
                        Vibration.vibrate(100);
                      }
                    }
                    style={{ marginHorizontal: 50 }}
                  >
                    <View>
                      <Autosync name='sync' color='#000' size={30} />
                    </View>
                  </TouchableOpacity>

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


          );
        }}
      />
      <View style={{display:"flex", flexDirection:"row", justifyContent:"center"}}>
      <TouchableOpacity
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        style={styles.buttonTouchable}
        onPress={() => {
          navigation.navigate('Enroll', { database: database });
          Vibration.vibrate(100);
        }}
      >
        <View style={styles.buttonWidth}><Text style={styles.btntext}>ENROLL</Text></View>

      </TouchableOpacity>
      <TouchableOpacity
        onPress={
          () => {
            copyDatabase();
            Vibration.vibrate(100);
          }
        }
        style={{ marginHorizontal: 50 }}
      >
        <View>
          <Autosync name='sync' color='#000' size={30} />
        </View>
      </TouchableOpacity>
      </View>
    </View>
  )
}

export default PrisonersListDetails

const styles = StyleSheet.create({
  prisonernames: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  prisonerListview: {
    width: '100%',
    padding: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  prisonCard: {
    marginTop: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  prisonerscard: {
    width: '100%',
    backgroundColor: "#fff",
  },
  prisonerHeading: {
    fontSize: 22,
    fontWeight: "500",
    color: "#000",
  },
  profileCard: {
    backgroundColor: "#fff",
    flexDirection: "column",
    justifyContent: "center"
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    width: "50%",
    padding: 25
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: "#000",

  },
  prisonerHead: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#000",
    margin: 5
  },
  bio: {
    fontSize: 14,
    color: '#000',
    marginLeft: 20
  },
  bios: {
    fontSize: 14,
    color: '#000',
    marginBottom: 20
  },
  buttonTouchable: {
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 10,
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
})