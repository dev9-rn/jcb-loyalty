import React from 'react';
import { AppRegistry, PermissionsAndroid, Platform } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './config/store';
import AsyncStorage from '@react-native-community/async-storage';
import { Root } from "native-base";
import { MenuProvider } from 'react-native-popup-menu';
import * as utilities from '../src/Utility/utilities';
import Route from '../src/config/Route';
// import firebase from 'react-native-firebase';
import messaging from '@react-native-firebase/messaging';
// import type, { Notification, NotificationOpen } from 'react-native-firebase';
import { createStackNavigator, createAppContainer, createDrawerNavigator } from 'react-navigation';
import NotificationScreen from './components/Home/NotificationScreen';
import { RESULTS, checkNotifications, requestNotifications } from 'react-native-permissions';

const AppNavigator = createStackNavigator({
  DemoNotificationScreen: { screen: NotificationScreen, navigationOptions: { header: null } },
});
const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showHideNotifyScreen: false,
    }
  }
  componentWillUnmount() {
    // this.removeNotificationListener();
    // this.removeNotificationOpenedListener();
    // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  }
  // componentWillMount() {
  //   // NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  // }
  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
      ISNETCONNECTED = isConnected;
    } else {
      this.setState({ isConnected });
      ISNETCONNECTED = isConnected;
      utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
    }
  };

  getFireBaseToken = async () => {
    await messaging().getToken()
    .then(fcmToken => {
      FCMTOKEN = fcmToken;
      console.log('------fcmToken' ,fcmToken)
      AsyncStorage.setItem('FCMTOKEN', JSON.stringify({ fcmToken: fcmToken }));
    });
    
    await checkNotifications().then(async ({status, settings}) => {
      if (status !== RESULTS.GRANTED) {
        if(Platform.OS === 'android'){
          await PermissionsAndroid.request(
            android.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }else{
          requestNotifications(['alert', 'sound']).then(({status, settings}) => {
            console.log("====requestNotifications",status)
          });
        }
      }
    });
  }
  // _getPermission = () => {
  //   firebase.messaging()
  //     .requestPermission()
  //     .catch(error => {
  //       alert("No permission for firebase")
  //     });
  // }
  async getAsyncData() {
    await AsyncStorage.multiGet(['ACCESSTOKEN'], (err, result) => {
      var lData = JSON.parse(result[0][1]);
      console.log("App.js ldata",lData);
      if (lData) {
        ACCESSTOKEN = lData.ACCESSTOKEN;
      }
    });
  }
  componentDidMount = () => {
    this.getAsyncData();
    
    // this.removeNotificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
    //   console.log("hua open");
    //   this.setState({ showHideNotifyScreen: true })
    //   this.navigator && this.navigator.dispatch({ type: 'Navigate', routeName: "DemoNotificationScreen", pramas: "bangdu" });
    //   // this.props.navigation.navigate('NotificationScreen');
    // });

    // this.removeNotificationListener = firebase.notifications().onNotification((notification: Notification) => {
    //   if (notification) {
    //     const { title, body } = notification;
    //     const channelId = new firebase.notifications.Android.Channel('Default', 'Default', firebase.notifications.Android.Importance.High);
    //     firebase.notifications().android.createChannel(channelId);
    //     let notification_to_be_displayed = new firebase.notifications.Notification({
    //       data: notification.android._notification._data,
    //       sound: 'default',
    //       show_in_foreground: true,
    //       lights: true,
    //       title: title,
    //       body: body
    //     });
    //     if (Platform.OS == 'android') {
    //       notification_to_be_displayed
    //         .android.setPriority(firebase.notifications.Android.Priority.High)
    //         .android.setChannelId('Default')
    //         .android.setVibrate(1000)
    //     }
    //     firebase.notifications()
    //       .displayNotification(notification_to_be_displayed)
    //       .catch(err => console.log(err))
    //   }
    // });
    this.getFireBaseToken();
  }
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
      <Root>
        <MenuProvider>
          {/* {this.state.showHideNotifyScreen ?
            <AppContainer ref={nav => { this.navigator = nav; }} />
            : */}
            <Route />
          {/* } */}
        </MenuProvider>
      </Root>
      </PersistGate>
      </Provider>
    );
  }
};

// export const URL = "https:\/\/scube.net.in\/seqr_doc\/gen\/services\/";
// export const URL = "http://192.168.0.5:808/nandan_petrochem/api/";
export const URL = "https://seqrloyalty.com/jcb/api/";  //live api
// export const URL = "https://seqrloyalty.com/npl/apiv1/"; // risk mgmt tasks api

// export const URL = "https://seqrloyalty.com/developer/api/"; // npl developer api
// export const URL = "http://192.168.0.125:8080/nandan_petrochem/server/api/"
export const HEADER = {
  Accept: 'application\/json',
  'Content-Type': 'multipart\/form-data',
};
export const APIKEY = 'eIrJLF5;&B:cVh30WDlh1}Ww_BtId@';
export var ACCESSTOKEN = '';
export var FCMTOKEN = '';
export var scanQRData = [];
export var scanSeQRData = [];
export var redeemHistoryCash = [];
export var redeemHistoryScheme = [];
export var ISNETCONNECTED = true;
export var BADGECOUNT = 0;
export var notificationData = [];
export function setValue(newValue: Boolean) {
  ISNETCONNECTED = newValue;
}