import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './config/store';
import AsyncStorage from '@react-native-community/async-storage';
import { Root } from "native-base";
import { MenuProvider } from 'react-native-popup-menu';
import * as utilities from '../src/Utility/utilities';
import Route from '../src/config/Route';
import firebase from 'react-native-firebase';
import type, { Notification, NotificationOpen } from 'react-native-firebase';
import { createStackNavigator, createAppContainer, createDrawerNavigator } from 'react-navigation';
import NotificationScreen from './components/Home/NotificationScreen';

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
    this.removeNotificationListener();
    this.removeNotificationOpenedListener();
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

  getFireBaseToken = () => {
    //Check permission
    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          console.log("has permission");

          //Get Token
          firebase.messaging().getToken()
            .then(fcmToken => {
              if (fcmToken) {
                console.log(fcmToken);
                FCMTOKEN = fcmToken;
                AsyncStorage.setItem('FCMTOKEN', JSON.stringify({ fcmToken: fcmToken }));
              } else {
                alert("No firebase token please check.")
              }
            });
        } else {
          console.log("no permission -----------------------");
          this._getPermission()
        }
      });
  }
  _getPermission = () => {
    firebase.messaging()
      .requestPermission()
      .catch(error => {
        alert("No permission for firebase")
      });
  }
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
    this.getFireBaseToken();
    this.removeNotificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
      console.log("hua open");
      this.setState({ showHideNotifyScreen: true })
      this.navigator && this.navigator.dispatch({ type: 'Navigate', routeName: "DemoNotificationScreen", pramas: "bangdu" });
      // this.props.navigation.navigate('NotificationScreen');
    });

    this.removeNotificationListener = firebase.notifications().onNotification((notification: Notification) => {
      if (notification) {
        const { title, body } = notification;
        const channelId = new firebase.notifications.Android.Channel('Default', 'Default', firebase.notifications.Android.Importance.High);
        firebase.notifications().android.createChannel(channelId);
        let notification_to_be_displayed = new firebase.notifications.Notification({
          data: notification.android._notification._data,
          sound: 'default',
          show_in_foreground: true,
          lights: true,
          title: title,
          body: body
        });
        if (Platform.OS == 'android') {
          notification_to_be_displayed
            .android.setPriority(firebase.notifications.Android.Priority.High)
            .android.setChannelId('Default')
            .android.setVibrate(1000)
        }
        firebase.notifications()
          .displayNotification(notification_to_be_displayed)
          .catch(err => console.log(err))
      }
    });
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
export const URL = "https://seqrloyalty.com/npl/api/";  //live api
// export const URL = "https://seqrloyalty.com/npl/apiv1/"; // risk mgmt tasks api

// export const URL = "https://seqrloyalty.com/developer/api/"; // npl developer api
// export const URL = "http://192.168.0.125:8080/nandan_petrochem/server/api/"
export const HEADER = {
  Accept: 'application\/json',
  'Content-Type': 'multipart\/form-data',
};
export const APIKEY = 'c4o_LTJIez6XfnH^r=$l&!FAN@MM]5';
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