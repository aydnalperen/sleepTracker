import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  Button,
  ToastAndroid,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeAN from 'react-native-alarm-notification';
import fservice from '../../components/ForegroundServide/ForegroundService';
const {RNAlarmNotification} = NativeModules;
const RNEmitter = new NativeEventEmitter(RNAlarmNotification);

const alarmNotifData = {
  title: 'Time to get up',
  message: 'Tap to woke up button!',
  vibrate: true,
  play_sound: true,
  repeat_interval: 'daily',
  schedule_type: 'repeat',
  channel: 'wakeup',
  data: {content: 'my notification id is 22'},
  use_big_text: true,
  loop_sound: true,
  has_button: true,
};

export default function SetupScreen({navigation}) {
  const [currenttime, setcurrent] = useState(
    ReactNativeAN.parseDate(new Date(Date.now())),
  );
  const [bedTime, setBedTime] = useState(currenttime);
  const [targetHours, setTargetHours] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(0);

  let user = {
    //user object will be saved with asynstorage later
    userbedtime: bedTime,
    usertargethours: targetHours,
    usertargetminutes: targetMinutes,
  };

  function handleTargetHours(target) {
    target = parseInt(target, 10);
    setTargetHours(target);
  }
  function handleTargetMinutes(target) {
    target = parseInt(target, 10);
    setTargetMinutes(target);
  }
  const createRecords = async () => {
    const temp = await AsyncStorage.getItem('records');
    if (temp == null) {
      let recordsArray = [];
      
      let tempdata = {date:'00/00/0000', hours:0,minutes:0,targetHour:0,targetMins:0};
      recordsArray.push(tempdata);
      const jsonValue = JSON.stringify(recordsArray);
      await AsyncStorage.setItem('records', jsonValue);
    }
  };
  const storeData = async value => {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('userInfo', jsonValue);
  };
  const setNewUser = async () => {
    try {
      await AsyncStorage.setItem('isNew', 'No');
    } catch (e) {
      // saving error
    }
  };
  //Alarm management

  let _subscribeOpen;
  let _subscribeDismiss;

  const [state, setState] = useState({
    fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
    update: [],
    futureFireDate: '1',
    alarmId: null,
  });

  const setAlarm = async () => {
    const {fireDate, update} = state;

    const details = {...alarmNotifData, fire_date: fireDate};
    console.log(`alarm set: ${fireDate}`);

    try {
      const alarm = await ReactNativeAN.scheduleAlarm(details);
      console.log(alarm);
      if (alarm) {
        setState({
          update: [...update, {date: `alarm set: ${fireDate}`, id: alarm.id}],
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const stopAlarmSound = () => {
    ReactNativeAN.stopAlarmSound();
  };

  useEffect(() => {
    _subscribeDismiss = RNEmitter.addListener(
      'OnNotificationDismissed',
      data => {
        const obj = JSON.parse(data);
        console.log(`notification id: ${obj.id} dismissed`);
      },
    );
    _subscribeOpen = RNEmitter.addListener('OnNotificationOpened', data => {
      console.log(data);
      const obj = JSON.parse(data);
      console.log(`app opened by notification: ${obj.id}`);
    });
    return () => {
      _subscribeDismiss.remove();
      _subscribeOpen.remove();
    };
  }, []);

  const viewAlarms = async () => {
    const list = await ReactNativeAN.getScheduledAlarms();

    console.log(list);
    const update = list.map(l => ({
      date: `alarm: ${l.day}-${l.month}-${l.year} ${l.hour}:${l.minute}:${l.second}`,
      id: l.id,
    }));

    setState({update});
  };

  const deleteAlarm = async () => {
    const {alarmId} = state;
    if (alarmId !== '') {
      console.log(`delete alarm: ${alarmId}`);

      const id = parseInt(alarmId, 10);
      ReactNativeAN.deleteAlarm(id);
      setState({alarmId: ''});

      ToastAndroid.show('Alarm deleted!', ToastAndroid.SHORT);

      await viewAlarms();
    }
  };

  function addHours(date, hours, minutes) {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
  }

  const {update, fireDate, futureFireDate, alarmId} = state;
  const addTime = () => {
    //increases bed time by target sleep time and obtains wake up time
    let temptime1 = ReactNativeAN.parseDateString(fireDate);
    let hour = targetHours;
    let minutes = targetMinutes;
    let finaltime = addHours(temptime1, hour, minutes);
    setState({fireDate: ReactNativeAN.parseDate(finaltime)}); //fireDate is target sleep times more than bed time
  };
  const onChange = text => {
    setState({fireDate: text});
    setBedTime(fireDate);
  };
  const removePrevAlarms = async () => {
    let alarms = [];
    alarms = await ReactNativeAN.getScheduledAlarms();
    for (let i = 0; i < alarms.length; i++) {
      ReactNativeAN.deleteRepeatingAlarm(alarms[i].id);
    }
  };
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <View style={setupstyles.container}>
        <View>
          <View style={{marginTop: 10}}>
            <Text style={{textAlign: 'center'}}>
              Please enter your bed hour in given format:
            </Text>
          </View>
          <View style={{justifyContent: 'space-around', marginTop: 20}}>
            <TextInput
              style={setupstyles.inputform}
              keyboardAppearance="dark"
              onChangeText={onChange}
              defaultValue={currenttime}
            />
            <Text style={{marginTop: 10}}>
              Please enter your target sleep time:(e.g. 8 35)
            </Text>
            <View style={{flexDirection: 'row'}}>
              <TextInput
                style={setupstyles.inputform}
                placeholder="Target sleep hours"
                keyboardType="number-pad"
                placeholderTextColor="gray"
                onChangeText={handleTargetHours}
              />
              <TextInput
                style={setupstyles.inputform}
                placeholder="Target sleep minutes"
                keyboardType="number-pad"
                placeholderTextColor="gray"
                onChangeText={handleTargetMinutes}
              />
            </View>
          </View>
          <View style={{marginTop: 10}}>
            <Button
              title="save target wake up time"
              onPress={addTime}
              color="#0d073c"
            />
          </View>
        </View>
      </View>
      <View style={{marginTop: 20}}>
        <Button
          color="#0d073c"
          title="Continue"
          onPress={() => {
            createRecords();
            removePrevAlarms();
            fservice.startservice();
            setNewUser();
            storeData(user);
            setAlarm();
            navigation.navigate('Home');
          }}
        />
      </View>
    </View>
  );
}

const setupstyles = StyleSheet.create({
  inputform: {
    borderColor: 'black',
    textAlign: 'center',
    padding: 10,
    borderWidth: 2,
    color: 'black',
  },
  container: {
    padding: 20,
    justifyContent: 'space-around',
  },
  clockinput: {},
});
