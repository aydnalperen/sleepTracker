import React, {useState, useEffect, componentDidMount} from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fservice from '../../components/ForegroundServide/ForegroundService';
import ReactNativeAN from 'react-native-alarm-notification';
import {useIsFocused} from '@react-navigation/native';

function Home({navigation}) {
  const isFocused = useIsFocused();

  useEffect(() => {
    getData();
    getRecords();
  }, [isFocused]);
  const [user, setUser] = useState({});
  const [sleepTimeData, setSleepTime] = useState({
    date: ' ',
    hour: 0,
    minutes: 0,
    targetHour: 0,
    targetMins: 0,
  });
  const getData = async () => {
    const jsonValue = await AsyncStorage.getItem('userInfo');
    if (jsonValue == null) {
      console.warn('please log in');
      navigation.navigate('Setup');
    } else {
      const value = JSON.parse(jsonValue);
      setUser(value);
    }
  };
  const [recordsArray, setRecords] = useState([]);
  const getRecords = async () => {
    const jsonValue = await AsyncStorage.getItem('records');

    setRecords(JSON.parse(jsonValue));
  }; //first need to obtain records array, then add new record in userWokeUp, then save array again
  const saveRecords = async () => {
    const jsonValue = JSON.stringify(recordsArray);
    await AsyncStorage.setItem('records', jsonValue);
  };
  const userWokeUp = () => {
    ReactNativeAN.stopAlarmSound();
    ReactNativeAN.removeAllFiredNotifications();
    let bedtimestring = user.userbedtime; //bedtime is string, needs to be converted to time object

    let currentTime = new Date(Date.now());

    let bedtime = ReactNativeAN.parseDateString(bedtimestring);

    let diffMs = currentTime - bedtime;

    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let m = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    let todaystring = m + '/' + dd + '/' + yyyy;
    if (todaystring === recordsArray[recordsArray.length - 1].date) {
      return;
    }
    setSleepTime({
      date: todaystring,
      hours: diffHrs,
      minutes: diffMins,
      targetHour: user.usertargethours,
      targetMins: user.usertargetminutes,
    });
    recordsArray.push(sleepTimeData); //add new record to records array
    saveRecords(); //save records
  };
  return (
    <View>
      <View>
        <TouchableOpacity style={styles.wakeupbutton} onPress={userWokeUp}>
          <Text
            style={{
              textAlign: 'center',
              marginTop: 80,
              color: 'white',
              fontSize: 30,
            }}>
            Wake up button
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <TouchableOpacity
          onPress={fservice.stopService}
          style={styles.services}>
          <Text style={styles.serviceText}>Stop Tracking</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          style={styles.changebutton}
          onPress={() => {
            navigation.navigate('Setup');
          }}>
          <Text style={styles.changetext}>Change bed or target times</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pastdurations}
          onPress={() => {
            navigation.navigate('Durations');
          }}>
          <Text style={styles.durationstext}>Past Durations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wakeupbutton: {
    height: 200,
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: 'white',
  },
  services: {
    height: 100,
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: 'black',
  },
  serviceText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
  },
  changebutton: {
    height: 100,
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: 'white',
  },
  changetext: {
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  pastdurations: {
    height: 160,
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: 'white',
  },
  durationstext: {
    color: 'white',
    textAlign: 'center',
    marginTop: 55,
    fontSize: 20,
  },
});
export default Home;
