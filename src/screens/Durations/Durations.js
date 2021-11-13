import React, {useState, useEffect, } from 'react';
import {useIsFocused} from '@react-navigation/native';
import {
  ScrollView,
  Button,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toComputedKey } from '@babel/types';

export default function Durations({navigation}) {
  const [recordsArray, setRecords] = useState([]);
  const getRecords = async () => {
    const jsonValue = await AsyncStorage.getItem('records');
    setRecords(JSON.parse(jsonValue));
  };
  const isFocused = useIsFocused();

  useEffect(() => {
    setRecords([]);
    getRecords();
  }, [isFocused]);
  const clearData = async () => {
    setRecords([]);
    const jsonValue = JSON.stringify(recordsArray);
    await AsyncStorage.setItem('records', jsonValue);
  }
  return (
    <><ScrollView>

      {recordsArray.map((item, key) => (
        <View key={key} style={styles.dataContainer}>
          <View style={styles.data}>
            <Text style={styles.datetext}>Day :{"\n"}{item.date}</Text>
          </View>
          <View style={styles.data}>
            <Text style={styles.datatext}>S.Hours :{"\n"}{item.hours}</Text>
          </View>
          <View style={styles.data}>
            <Text style={styles.datatext}>S.Mins :{"\n"}{item.minutes}</Text>
          </View>
          <View style={styles.data}>
            <Text style={styles.datatext}>T.Hours :{"\n"}{item.targetHour}</Text>
          </View>
          <View style={styles.data}>
            <Text style={styles.datatext}>T.Mins :{"\n"}{item.targetMins}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
    <View>
        <Button
          title = "Clear"
          onPress = {clearData}
        />
    </View></>
  );
}
const styles = StyleSheet.create({
  dataContainer: {
    flexDirection:'row',
  },
  data: {
    flex:1,
    borderTopWidth:1,
    borderColor: 'white',
    backgroundColor: 'black',
  },
  datetext:{
    color:'white',
    textAlign:'center',
    fontSize:12
  },
  datatext: {
    color: 'white',
    textAlign:'center',
  },

});
