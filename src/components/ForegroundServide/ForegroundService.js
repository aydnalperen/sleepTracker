import React, {Component, useEffect} from 'react';
import {Platform, StyleSheet, Text, View, Button} from 'react-native';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
class ForegroundService extends Component {
  async startservice() {
    if (Platform.OS !== 'android') {
      console.log('Only Android platform is supported');
      return;
    }
    if (Platform.Version >= 26) {
      const channelConfig = {
        id: 'ForegroundServiceChannel',
        name: 'Notification Channel',
        description: 'Notification Channel for Foreground Service',
        enableVibration: false,
        importance: 2,
      };
      await VIForegroundService.createNotificationChannel(channelConfig);
    }
    /*setInterval(myMethod, 1000);

    function myMethod() {
      console.log('1');
    }*/
    const notificationConfig = {
      id: 3456,
      title: 'Sleep Tracker is tracking your sleep',
      text: 'Tap here to acces wake up button quickly',
      icon: 'logo',
      priority: 0,
    };
    if (Platform.Version >= 26) {
      notificationConfig.channelId = 'ForegroundServiceChannel';
    }

    await VIForegroundService.startService(notificationConfig);
  };
  async stopService() {
    await VIForegroundService.stopService();
  };

}
const fservice = new ForegroundService();
export default fservice;
