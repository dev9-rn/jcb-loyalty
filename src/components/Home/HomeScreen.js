import React, { Component } from 'react';
import { Alert, Dimensions, Modal, ActivityIndicator, BackHandler, StatusBar, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Drawer from 'react-native-drawer';
import { Header, Left, Body, Right, Card, Text, Title, Button, Icon } from 'native-base';
import IconBadge from 'react-native-icon-badge';
import SideMenu from '../../config/SideMenu';
import Loader from '../../Utility/Loader';
import OfflineNotice from '../../Utility/OfflineNotice';
import * as utilities from '../../Utility/utilities';
import * as app from '../../App';
import { URL, APIKEY, ACCESSTOKEN } from '../../App';
import { Col, Grid, Row } from "react-native-easy-grid";
import { Dropdown } from 'react-native-material-dropdown';
var _ = require('lodash');
import RNRestart from 'react-native-restart';
import { strings } from '../../locales/i18n';
import I18n from 'react-native-i18n';
import { connect } from 'react-redux';

class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.distributorId;
    this.monthList = [{ id: '1', 'value': strings('login.homeScreen_january') }, { id: '2', 'value': strings('login.homeScreen_feb') }, { id: '3', 'value': strings('login.homeScreen_march') }, { id: '4', 'value': strings('login.homeScreen_april') },
    { id: '5', 'value': strings('login.homeScreen_may') }, { id: '6', 'value': strings('login.homeScreen_june') }, { id: '7', 'value': strings('login.homeScreen_july') }, { id: '8', 'value': strings('login.homeScreen_aug') }, { id: '9', 'value': strings('login.homeScreen_sep') },
    { id: '10', 'value': strings('login.homeScreen_oct') }, { id: '11', 'value': strings('login.homeScreen_nov') }, { id: '12', 'value': strings('login.homeScreen_dec') }]
    this.yearList = [];

    this.state = {
      isDrawerOpen: false,
      modalValue: '',
      isModalVisible: false,
      BadgeCount: 0,
      loaderText: 'Loading data please wait...',
      count: 0,
      distributorId: '',
      loading: false,
      selectedMonthId: JSON.stringify(new Date().getMonth() + 1),
      selectedYear: new Date().getFullYear(),
      selectedMonthName: '',
      userType: '',
      btnScanEnabled: true,
      minutes: '',
      totalNoOfCouponsScanned:'',
      totalValueOfCouponsScanned: '', 

      totalNoOfCashCouponsCredited:'',
      totalNoOfCashCouponsPending:'',
      totalNoOfCashCouponsScanned:'',

      totalValueOfCashCouponsCredited:'',
      totalValueOfCashCouponsPending: '',
      totalValueOfCashCouponsScanned: '',

      totalNoOfFOCCouponsScanned:'',
      totalValueOfFOCCouponsScanned:''

    };
  }
  componentDidMount = () => {
    console.log("=-=-=-=-===-=");
    console.log(this.props);
    console.log(this.props.navigation.state.routeName);
    // RNRestart.Restart();
    if (this.props.navigation.state.routeName === "AppJSScreen") {
      console.log("inside home prop");
      RNRestart.Restart();
    }

    if (this.state.selectedMonthId) {
      let mnth = _.filter(this.monthList, { id: this.state.selectedMonthId })[0].value
      this.setState({ selectedMonthName: mnth });
    }
    this._getYearList();
    this.countdown();
    this.getAsyncData();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        this.setState({ isDrawerOpen: true });
        this._drawer.close();
        this.getAsyncData();
        // this._getDashboardData();
      }
    );
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }
  componentWillUnmount() {
   
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    this.willFocusSubscription.remove();
    // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    // navigator.geolocation.clearWatch(this.watchId);
  }


///////////////////////

  componentWillReceiveProps(nextProps){
    console.log("inside component should mount - before- ", nextProps.navigation.getParam("minutes",''));
    // console.log("inside component should mount - before- ", this.props.navigation.state.params);
    this.mins = nextProps.navigation.getParam("minutes",'');
    if(this.mins  !== '' )
    { 
      this.setState({ btnScanEnabled: false , minutes : this.mins}, () => console.log(this.state.btnScanEnabled));
      this.setState({ minutes: nextProps.navigation.getParam("minutes", '') }, () => {
        console.log(this.state.minutes);
        this.countdown();
      });
     }
   
  }

  
  countdown() {
    console.log("inside countdown", this.state.btnScanEnabled, '-'+this.state.minutes);
		var time;
		 if (!this.state.btnScanEnabled) {
			// var timer = '1:00';
      var timer = this.state.minutes;
			timer = timer.split(':');
			var minutes = timer[0];
			var seconds = timer[1];
			interval = setInterval(() => {
				seconds -= 1;
				if (minutes < 0) return;
				else if (seconds < 0 && minutes != 0) {
					minutes -= 1;
					seconds = 59;
				}
				else if (seconds < 10 && seconds.length != 2) {
					seconds = '0' + seconds;
				}
				time = minutes + ':' + seconds;
				this.setState({ time: time });
          console.log(time);
				if (minutes == 0 && seconds == 0) {
					 this.setState({ btnScanEnabled: true });
          //this.props.navigation('HomeScreen');
					clearInterval(interval);
				}
			}, 1000);
		 }
	}
  ///////////////////////

  handleBackPress = () => {
    // return true;
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit this app',
      [
        { text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'YES', onPress: () => { BackHandler.exitApp();  } },
      ],
      { cancelable: false }
    )
    return true;
  }
  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
      app.setValue(isConnected);
    } else {
      this.setState({ isConnected });
      app.setValue(isConnected);
      utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
    }
  };

  closeActivityIndicator() {
    setTimeout(() => {
      this.setState({ animating: false, loading: false });
    });
  }

  _pushNotification = (formData) => {
    var lUrl = URL + 'getNotificationsCount';
    fetch(lUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application\/json',
        'Content-Type': 'multipart\/form-data',
        'apikey': APIKEY,
        'accesstoken': ACCESSTOKEN
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("Notification count",responseJson.notificationsCount);
        this.setState({ count: responseJson.notificationsCount });
      })
      .catch((error) => {
        console.log(error);
        alert(error)
      });

  }

  closeControlPanel = () => {
    this._drawer.close()
  };
  openControlPanel = () => {
    this._drawer.open()
  };
  toggleControlPanel = () => {
    this._drawer.toggle();
  };

  _toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  }

  async getAsyncData() {
    await AsyncStorage.multiGet(['USERDATA'], (err, result) => {
      var lData = JSON.parse(result[0][1]);
      if (lData) {
        this.distributorId = lData.data.id;
        this._getDashboardData();
      }
    });
  }

  getDashboard = (pFormData) => {
    this.setState({ loading: true })
    var lUrl = URL + 'getDashboardV1';
    fetch(lUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application\/json',
        'Content-Type': 'multipart\/form-data',
        'apikey': APIKEY,
        // 'accesstoken':'qTbNO3yDQ6CTVR6kDYg7KxoXPvnrOJ',
        'accesstoken': ACCESSTOKEN
      },
      body: pFormData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);

        this.closeActivityIndicator();
        var lResponseData = responseJson;
        if (!lResponseData) {
          utilities.showToastMsg('Something went wrong. Please try again later');
        } else if (lResponseData.status === 403) {
          utilities.showToastMsg(lResponseData.message);
          this.props.navigation.navigate('LoginScreen')
          return;
        }
        else if (lResponseData.status == 500 || lResponseData.status == 400) {
          utilities.showToastMsg(lResponseData.message);
        } else if (lResponseData.status == 200) {
          this._setDashboardData(lResponseData);
        } else {
          utilities.showToastMsg('Something went wrong. Please try again later');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  _getDashboardData = () => {
    this.setState({ loading: true })
    const formData = new FormData();
    formData.append('distributorId', this.distributorId);
    // formData.append('distributorId', 18);
    formData.append('month', JSON.parse(this.state.selectedMonthId));
    formData.append('year', this.state.selectedYear);
    this.getDashboard(formData)
    this._pushNotification(formData);
  }

  _onPressNotificationIcon() {
    this.setState({ count: 0 });
    this.props.navigation.navigate('NotificationScreen');
  }

  _setDashboardData(lResponseData) {
    this.setState(
      {
        // totalAmountRedeemed: lResponseData.totalAmountRedeemed,
        // totalCouponsRedeemed: lResponseData.totalCouponsRedeemed,
        // totalCouponsRedeemedCash: lResponseData.totalCouponsRedeemedCash,
        // totalCouponsRedeemedFOC: lResponseData.totalCouponsRedeemedFOC
        totalNoOfCouponsScanned:lResponseData.totalNoOfCouponsScanned,
        totalValueOfCouponsScanned: lResponseData.totalValueOfCouponsScanned, 
  
        totalNoOfCashCouponsCredited:lResponseData.totalNoOfCashCouponsCredited,
        totalNoOfCashCouponsPending:lResponseData.totalNoOfCashCouponsPending,
        totalNoOfCashCouponsScanned:lResponseData.totalNoOfCashCouponsScanned,
  
        totalValueOfCashCouponsCredited:lResponseData.totalValueOfCashCouponsCredited,
        totalValueOfCashCouponsPending: lResponseData.totalValueOfCashCouponsPending,
        totalValueOfCashCouponsScanned: lResponseData.totalValueOfCashCouponsScanned,
  
        totalNoOfFOCCouponsScanned:lResponseData.totalNoOfFOCCouponsScanned,
        totalValueOfFOCCouponsScanned:lResponseData.totalValueOfFOCCouponsScanned
      });
  }
  _onPressScanButton = () => {
    this.props.navigation.navigate('ScanScreen');
  }
  _setMonth(month, monthList) {
    if (monthList) {
      let idForMonth = _.filter(monthList, { value: month })[0].id
      console.log(idForMonth);
      this.setState({ selectedMonthId: idForMonth }, () => this._getDashboardData());
    } else {
    }
  }
  _setYear(year, yearList) {
    if (yearList) {
      let removedYear = _.filter(yearList, { value: year })[0].value
      this.setState({ selectedYear: removedYear }, () => {
        this._getDashboardData()
      });
    }
  }
  _getYearList = () => {
    let currentYear = new Date().getFullYear();
    var j = 0
    for (var i = 0; i < 5; i++) {
      var dataObj = {};
      dataObj.id = j++;
      dataObj.value = currentYear--;
      this.yearList.push(dataObj)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <OfflineNotice />
        <Header style={{ backgroundColor: '#fff' }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => { this.toggleControlPanel() }}>
              <Icon type="FontAwesome" name="bars" style={{ fontSize: 25, color: '#fab032', paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.8, alignItems: 'center' }}>
            <Title style={{ color: '#fab032', fontSize: 16 }}>{strings('login.dashboard_title')}</Title>
          </Body>
          <Right style={{ flex: 0.1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => { this._onPressNotificationIcon() }}>
                <IconBadge
                  MainElement={
                    <Icon type="FontAwesome" name="bell" style={{ fontSize: 30, height: 35, width: 40, color: '#fab032', margin: 7, marginBottom: 0 }} />
                  }
                  BadgeElement={
                    <Text style={{ color: '#fab032', fontSize: 10 }}>{this.state.count}</Text>
                  }
                  IconBadgeStyle={
                    {
                      width: 25,
                      height: 25,
                      backgroundColor: '#FF00EE',
                      marginRight: 5
                    }
                  }
                // Hidden={this.state.BadgeCount == 0}
                />
              </TouchableOpacity>
            </View>
          </Right>
        </Header>
        <StatusBar
          backgroundColor="#ffffff"
          barStyle="dark-content"
        />
        {/* <Loader
          loading={this.state.loading}
          text={this.state.loaderText}
        /> */}
        <Drawer
          ref={(ref) => this._drawer = ref}
          content={<SideMenu prop={this.props} drawerObj={this._drawer} />}
          tapToClose={true}
          openDrawerOffset={0.3}
          panCloseMask={0.2}
          closedDrawerOffset={-3}
          styles={drawerStyles}
        >
            <ScrollView maximumZoomScale={1} keyboardShouldPersistTaps="handled">
             <View style={{ flex: 1, padding: 5, marginTop: 5 }}>
          

              {/* <View style={{ alignContent: 'center', alignItems: 'center' }}>
                <Grid>
                  <Col style={{ width: '40%', margin: 10 }}>
                    <Dropdown
                      label={(this.state.selectedMonthName == 'January' || this.state.selectedMonthName == 'जनवरी' || this.state.selectedMonthName == 'Janvier' || this.state.selectedMonthName == 'जानेवारी' || this.state.selectedMonthName == 'ਜਨਵਰੀ' || this.state.selectedMonthName == 'જાન્યુઆરી' || this.state.selectedMonthName == 'జనవరి' || this.state.selectedMonthName == 'ஜனவரி' || this.state.selectedMonthName == 'জানুয়ারী' || this.state.selectedMonthName == 'جنوری' || this.state.selectedMonthName == 'ಜನವರಿ' || this.state.selectedMonthName == 'ଜାନୁଆରୀ' || this.state.selectedMonthName == 'Januari') ? strings('login.homeScreen_january') :
                      (this.state.selectedMonthName == 'February' || this.state.selectedMonthName == 'फरवरी' || this.state.selectedMonthName == 'février' || this.state.selectedMonthName == 'फेब्रुवारी' || this.state.selectedMonthName == 'ਫਰਵਰੀ' || this.state.selectedMonthName == 'ફેબ્રુઆરી' || this.state.selectedMonthName == 'ఫిబ్రవరి' || this.state.selectedMonthName == 'பிப்ரவரி' || this.state.selectedMonthName == 'ফেব্রুয়ারির' || this.state.selectedMonthName == 'فروری' || this.state.selectedMonthName == 'ಫೆಬ್ರವರಿ' || this.state.selectedMonthName == 'ଫେବୃଆରୀ' || this.state.selectedMonthName == 'Februari') ? strings('login.homeScreen_feb') :
                        (this.state.selectedMonthName == 'March' || this.state.selectedMonthName == 'मार्च' || this.state.selectedMonthName == 'Mars' || this.state.selectedMonthName == 'मार्च' || this.state.selectedMonthName == 'ਮਾਰਚ' || this.state.selectedMonthName == 'માર્ચ' || this.state.selectedMonthName == 'మార్చి' || this.state.selectedMonthName == 'மார்ச்' || this.state.selectedMonthName == 'মার্চ' || this.state.selectedMonthName == 'مارچ' || this.state.selectedMonthName == 'ಮಾರ್ಚ್' || this.state.selectedMonthName == 'ମାର୍ଚ୍ଚ' || this.state.selectedMonthName == 'Machi') ? strings('login.homeScreen_march') :
                          (this.state.selectedMonthName == 'April' || this.state.selectedMonthName == 'अप्रैल' || this.state.selectedMonthName == 'Avril' || this.state.selectedMonthName == 'एप्रिल' || this.state.selectedMonthName == 'ਅਪ੍ਰੈਲ' || this.state.selectedMonthName == 'એપ્રિલ' || this.state.selectedMonthName == 'ఏప్రిల్' || this.state.selectedMonthName == 'ஏப்ரல்' || this.state.selectedMonthName == 'এপ্রিল' || this.state.selectedMonthName == 'اپریل' || this.state.selectedMonthName == 'ಏಪ್ರಿಲ್' || this.state.selectedMonthName == 'ଏପ୍ରିଲ୍' || this.state.selectedMonthName == 'Aprili') ? strings('login.homeScreen_april') :
                            (this.state.selectedMonthName == 'May' || this.state.selectedMonthName == 'मई' || this.state.selectedMonthName == 'Mai' || this.state.selectedMonthName == 'मे' || this.state.selectedMonthName == 'ਮਈ' || this.state.selectedMonthName == 'મે' || this.state.selectedMonthName == 'మే' || this.state.selectedMonthName == 'மே' || this.state.selectedMonthName == 'মে' || this.state.selectedMonthName == 'مے' || this.state.selectedMonthName == 'ಮೇ' || this.state.selectedMonthName == 'ମେ' || this.state.selectedMonthName == 'Mei') ? strings('login.homeScreen_may') :
                              (this.state.selectedMonthName == 'June' || this.state.selectedMonthName == 'जून' || this.state.selectedMonthName == 'Juin' || this.state.selectedMonthName == 'जून' || this.state.selectedMonthName == 'ਜੂਨ' || this.state.selectedMonthName == 'જૂન' || this.state.selectedMonthName == 'జూన్' || this.state.selectedMonthName == 'ஜூன்' || this.state.selectedMonthName == 'জুন' || this.state.selectedMonthName == 'جون' || this.state.selectedMonthName == 'ಜೂನ್' || this.state.selectedMonthName == 'ଜୁନ୍' || this.state.selectedMonthName == 'Juni') ? strings('login.homeScreen_june') :
                                (this.state.selectedMonthName == 'July' || this.state.selectedMonthName == 'जुलाई' || this.state.selectedMonthName == 'Juillet' || this.state.selectedMonthName == 'जुलै' || this.state.selectedMonthName == 'ਜੁਲਾਈ' || this.state.selectedMonthName == 'જુલાઈ' || this.state.selectedMonthName == 'జూలై' || this.state.selectedMonthName == 'ஜூலை' || this.state.selectedMonthName == 'জুলাই' || this.state.selectedMonthName == 'جولیو' || this.state.selectedMonthName == 'ಜುಲೈ' || this.state.selectedMonthName == 'ଜୁଲାଇ' || this.state.selectedMonthName == 'Julai') ? strings('login.homeScreen_july') :
                                  (this.state.selectedMonthName == 'August' || this.state.selectedMonthName == 'अगस्त' || this.state.selectedMonthName == 'Août' || this.state.selectedMonthName == 'ऑगस्ट' || this.state.selectedMonthName == 'ਅਗੱਸਤ' || this.state.selectedMonthName == 'ઓગસ્ટ' || this.state.selectedMonthName == 'ఆగస్టు' || this.state.selectedMonthName == 'ஆகஸ்ட்' || this.state.selectedMonthName == 'অগাস্ট' || this.state.selectedMonthName == 'اگست' || this.state.selectedMonthName == 'ಆಗಸ್ಟ್' || this.state.selectedMonthName == 'ଅଗଷ୍ଟ' || this.state.selectedMonthName == 'Agosti') ? strings('login.homeScreen_aug') :
                                    (this.state.selectedMonthName == 'September' || this.state.selectedMonthName == 'सितंबर' || this.state.selectedMonthName == 'Septembre' || this.state.selectedMonthName == 'सप्टेंबर' || this.state.selectedMonthName == 'ਸਤੰਬਰ' || this.state.selectedMonthName == 'સપ્ટેમ્બર' || this.state.selectedMonthName == 'సెప్టెంబర్' || this.state.selectedMonthName == 'செப்டம்பர்' || this.state.selectedMonthName == 'সেপ্টেম্বর' || this.state.selectedMonthName == 'ستمبر' || this.state.selectedMonthName == 'ಸೆಪ್ಟೆಂಬರ್' || this.state.selectedMonthName == 'সেপ্টেম্বর' || this.state.selectedMonthName == 'Septemba') ? strings('login.homeScreen_sep') :
                                      (this.state.selectedMonthName == 'October' || this.state.selectedMonthName == 'अक्टूबर' || this.state.selectedMonthName == 'Octobre' || this.state.selectedMonthName == 'ऑक्टोबर' || this.state.selectedMonthName == 'ਅਕਤੂਬਰ' || this.state.selectedMonthName == 'ઓક્ટોબર' || this.state.selectedMonthName == 'అక్టోబర్' || this.state.selectedMonthName == 'அக்டோபர்' || this.state.selectedMonthName == 'অক্টোবর' || this.state.selectedMonthName == 'اکتوبر' || this.state.selectedMonthName == 'ಅಕ್ಟೋಬರ್' || this.state.selectedMonthName == 'ଅକ୍ଟୋବର' || this.state.selectedMonthName == 'Oktoba') ? strings('login.homeScreen_oct') :
                                        (this.state.selectedMonthName == 'November' || this.state.selectedMonthName == 'नवंबर' || this.state.selectedMonthName == 'Novembre' || this.state.selectedMonthName == 'नोव्हेंबर' || this.state.selectedMonthName == 'ਨਵੰਬਰ' || this.state.selectedMonthName == 'નવેમ્બર' || this.state.selectedMonthName == 'నవంబర్' || this.state.selectedMonthName == 'நவம்பர்' || this.state.selectedMonthName == 'নভেম্বর' || this.state.selectedMonthName == 'نومبر' || this.state.selectedMonthName == 'ನವೆಂಬರ್' || this.state.selectedMonthName == 'ନଭେମ୍ବର' || this.state.selectedMonthName == 'Novemba') ? strings('login.homeScreen_nov') :
                                          (this.state.selectedMonthName == 'December' || this.state.selectedMonthName == 'दिसंबर' || this.state.selectedMonthName == 'Décembre' || this.state.selectedMonthName == 'डिसेंबर' || this.state.selectedMonthName == 'ਡੀਜ਼ਬਰ' || this.state.selectedMonthName == 'ડિસેમ્બર' || this.state.selectedMonthName == 'డిసెంబర్' || this.state.selectedMonthName == 'டிசம்பர்' || this.state.selectedMonthName == 'ডিসেম্বর' || this.state.selectedMonthName == 'فیصلہ کریں' || this.state.selectedMonthName == 'ಡಿಸೆಂಬರ್' || this.state.selectedMonthName == 'ଡିସେମ୍ବର' || this.state.selectedMonthName == 'Desemba') ? strings('login.homeScreen_dec') : ""}
                      rippleCentered={true}
                      data={this.monthList}
                      baseColor="(default: rgba(0, 0, 0, 5))"
                      onChangeText={(month) => this._setMonth(month, this.monthList)}
                    />
                  </Col>
                  <Col style={{ width: '40%', margin: 10 }}>
                    <Dropdown
                      label={new Date().getFullYear()}
                      data={this.yearList.reverse()}
                      baseColor="(default: rgba(0, 0, 0, 5))"
                      onChangeText={(year) => this._setYear(year, this.yearList)}
                    />
                  </Col>
                </Grid>
              </View>  */}

              <View style={{ flex: 1, flexDirection: 'column' }}>
                <Card style={{ flex: 0.5, marginRight: 5, padding: 5 ,borderRadius:10}}>
                  <View style={{ flexDirection:'row',marginBottom:5,}}>
                  <Text style={{ textAlign:'left', fontWeight:'bold',fontSize:18,marginLeft:2 }}>{strings('login.Overall_Information')}</Text>
                  <Text style={{  textAlign: 'right',fontSize:18, flex:1, marginRight:8,color:'darkgray'}}>Total</Text>
                  </View>
                  {/* <Text style={{ height: this.props.languageControl == "Tamil - (தமிழ்)" ? 40 : 35, textAlign: 'left',fontSize:16,marginLeft:5  }}>{strings('login.total_coupon_scan')}</Text> */}
                  <View style={{ backgroundColor:'#EBF5FB',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14 ,flex:3,marginLeft:2, }}>{strings('login.No_of_Coupons_Scanned')}</Text>
                    {/* <Text style={{ padding:8, textAlign: 'right',fontSize:16,marginLeft:5,  marginRight:5}}>: </Text> */}
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.totalNoOfCouponsScanned}</Text>
                  </View>
                  <View style={{ backgroundColor:'#EBF5FB',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2  }}>{strings('login.Value_of_Coupons_Scanned')}</Text>
                    {/* <Text style={{ padding:8, textAlign: 'right',fontSize:16,marginLeft:5,  marginRight:5}}>: </Text> */}
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>Rs.{this.state.totalValueOfCouponsScanned}</Text>
                  </View>
                  {/* <Text style={{ padding: 20, textAlign: 'center', fontSize: 24 }}>{this.state.totalCouponsRedeemed}</Text> */}
                </Card>

                <Card style={{ flex: 0.5, marginRight: 5, padding: 5 ,borderRadius:10,}}>
                <View style={{ flexDirection:'row',marginBottom:5,}}>
                  <Text style={{ textAlign:'left', fontWeight:'bold',fontSize:18,marginLeft:2 }}>{strings('login.Cash_Coupons')}</Text>
                  <Text style={{  textAlign: 'right',fontSize:18,marginLeft:2, flex:1, marginRight:8,color:'darkgray'}}>Total</Text>
                  </View>
                  {/* <Text style={{ height: this.props.languageControl == "Tamil - (தமிழ்)" ? 40 : 35, textAlign:'left', fontWeight:'bold',fontSize:18,marginLeft:5 }}>Cash Coupons</Text> */}
                  {/* <Text style={{ height: this.props.languageControl == "Tamil - (தமிழ்)" ? 40 : 35, textAlign: 'left',fontSize:16,marginLeft:5  }}>{strings('login.total_coupon_scan')}</Text> */}
                  <View style={{ backgroundColor:'#f5eef8',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2, }}>{strings('login.No_of_Coupons_Scanned')}</Text>
                    {/* <Text style={{ padding:8, textAlign: 'right',fontSize:16,marginLeft:5,  marginRight:5}}>: </Text> */}
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.totalNoOfCashCouponsScanned}</Text>
                  </View>
                  <View style={{ backgroundColor:'#f5eef8',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2  }}>{strings('login.Value_of_Coupons_Scanned')}</Text>
                    {/* <Text style={{ padding:8, textAlign: 'right',fontSize:16,marginLeft:5,  marginRight:5}}>: </Text> */}
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>Rs.{this.state.totalValueOfCashCouponsScanned}</Text>
                  </View>
                  <View style={{ backgroundColor:'#f5eef8',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2,color:'green' }}>{strings('login.No_of_Coupons_Credited')}</Text>
                    {/* <Text style={{ padding:8, textAlign: 'right',fontSize:16,marginLeft:5,  marginRight:5}}>: </Text> */}
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.totalNoOfCashCouponsCredited}</Text>
                  </View>
                  <View style={{ backgroundColor:'#f5eef8',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2,color:'green'  }}>{strings('login.Value_of_Coupons_Credited')}</Text>
                    {/* <Text style={{ padding:8, textAlign: 'right',fontSize:16,marginLeft:5,  marginRight:5}}>: </Text> */}
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>Rs.{this.state.totalValueOfCashCouponsCredited}</Text>
                  </View>
                  <View style={{ backgroundColor:'#f5eef8',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2,color:'orange' }}>{strings('login.No_of_Coupons_Pending')}</Text>
                    {/* <Text style={{ padding:8, textAlign: 'right',fontSize:16,marginLeft:5,  marginRight:5}}>: </Text> */}
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.totalNoOfCashCouponsPending}</Text>
                  </View>
                  <View style={{ backgroundColor:'#f5eef8',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2 ,color:'orange' }}>{strings('login.Value_of_Coupons_Pending')}</Text>
                    {/* <Text style={{ padding:8, textAlign: 'right',fontSize:16,marginLeft:5,  marginRight:5}}>: </Text> */}
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>Rs.{this.state.totalValueOfCashCouponsPending}</Text>
                  </View>
                  {/* <Text style={{ padding: 20, textAlign: 'center', fontSize: 24 }}>{this.state.totalCouponsRedeemed}</Text> */}
                </Card>

                {/* <Card style={{ flex: 0.5, marginRight: 5, padding: 5 ,borderRadius:10}}>
                <View style={{ flexDirection:'row',marginBottom:5,}}>
                  <Text style={{ textAlign:'left', fontWeight:'bold',fontSize:18,marginLeft:2 }}>{strings('login.foc_Coupons')}</Text>
                  <Text style={{  textAlign: 'right',fontSize:18,marginLeft:2, flex:1, marginRight:8,color:'darkgray'}}>Total</Text>
                  </View>
                  <View style={{ backgroundColor:'#eafaf1',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2, }}>{strings('login.No_of_Coupons_Scanned')}</Text>
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.totalNoOfFOCCouponsScanned}</Text>
                  </View>
                  <View style={{ backgroundColor:'#eafaf1',margin:2,borderRadius:5,flexDirection:'row'}}>
                    <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2  }}>{strings('login.Value_of_Coupons_Scanned')}</Text>
                    <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>Rs.{this.state.totalValueOfFOCCouponsScanned}</Text>
                  </View>
                </Card> */}
              </View>

              {/* {this.state.loading ? <View style={{ justifyContent: 'center' }}>
                <ActivityIndicator
                  animating={this.state.loading}
                  style={styles.activityIndicator}
                  size="large"
                />
              </View> : <View />} */}

              {/* <View style={{ flex: 1, flexDirection: 'column' }}>
                

                <Card style={{ flex: 0.5, marginLeft: 5, padding: 5 }}>
                  <Text style={{ height: this.props.languageControl == "Tamil - (தமிழ்)" ? 80 : 75, textAlign: 'center' }}>{strings('login.total_coupons_scanned_for_scheme')}</Text>
                  <Text style={{ padding: 20, textAlign: 'center', fontSize: 24 }}>{this.state.totalCouponsRedeemedFOC}</Text>
                </Card>
              </View> */}

              {/* <View style={{ marginTop: 20 }}>
                <Button
                  onPress={this._onPressScanButton}
                  title="SCAN"
                />
              </View> */}
              <View style={{ marginTop: 30, width: 150, justifyContent: 'center', flex: 1, alignSelf: 'center' }}>
                <Button style={{ backgroundColor: 'blue', borderRadius: 15 }} onPress={this._onPressScanButton}>
                  <Icon type="FontAwesome" name="qrcode" style={{ fontSize: 25, color: 'white',}} /> 
                  <Text style={{ textAlign: 'left', flex: 1, fontWeight: 'bold', fontSize: 18 }}>{strings('login.scan_button')}</Text></Button>
              </View>
              </View>
            </ScrollView>
         

        </Drawer>
      </View>
    );
  }
}

const drawerStyles = {
  drawer: {
    // opacity: 1,
    // shadowOpacity: 1,

    // shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3
  },
  main: { paddingLeft: 3 },
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#fff"
  },
  btnReadMore: {
    marginTop: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF1E58',
    borderRadius: 2,

    flexDirection: 'row'
  },
  btnTextReadMore: {
    padding: 7,
    color: '#FF1E58',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
    position: 'absolute'
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 60,
    // width: 100,
    width: Dimensions.get('window').width * 0.8,
    borderRadius: 8,
    // display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'space-around'

    // flex: 1,
    flexDirection: 'row',
    // alignItems: 'stretch', 
    // backgroundColor: 'yellow'
  },
  activityIndicator: {
    flex: 0.2,
    color:'blue'
    // backgroundColor: 'skyblue'
  },
  text1: {
    marginTop: 18,
    marginLeft: 5,
    // backgroundColor: 'orange',
    flex: 0.8
  }
});

const mapStateToProps = (state) => {
  if (state.VerifierReducer.languageEnglish == "English - (English)") {
    I18n.locale = 'en'
  } else if (state.VerifierReducer.languageEnglish == "French - (Française)") {
    I18n.locale = 'fr'
  } else if (state.VerifierReducer.languageEnglish == "Hindi - (हिन्दी)") {
    I18n.locale = 'hi'
  } else if (state.VerifierReducer.languageEnglish == "Punjabi - (ਪੰਜਾਬੀ)") {
    I18n.locale = 'pa'
  } else if (state.VerifierReducer.languageEnglish == "Marathi - (मराठी)") {
    I18n.locale = 'ma'
  } else if (state.VerifierReducer.languageEnglish == "Gujarati - (ગુજરાતી)") {
    I18n.locale = 'gu'
  } else if (state.VerifierReducer.languageEnglish == "Telugu - (తెలుగు)"){
    I18n.locale = 'tl'
  } else if (state.VerifierReducer.languageEnglish == "Tamil - (தமிழ்)") {
    I18n.locale = 'ta'
  } else if (state.VerifierReducer.languageEnglish == "Bengali - (বাংলা)") {
    I18n.locale = 'ben'
  } else if (state.VerifierReducer.languageEnglish == "Urdu - (اردو)") {
    I18n.locale = 'ur'
  } else if (state.VerifierReducer.languageEnglish == "Kannada - (ಕನ್ನಡ)") {
    I18n.locale = 'kan'
  } else if (state.VerifierReducer.languageEnglish == "Odia - (ଓଡିଆ)") {
    I18n.locale = 'od'
  } else if (state.VerifierReducer.languageEnglish == "Swahili - (Kiswahili)") {
    I18n.locale = 'swa'
  } else {
    I18n.locale = 'en'
  }
  return {
    languageControl: state.VerifierReducer.languageEnglish,
    enableDarkTheme: state.VerifierReducer.enableDarkTheme,
    fingerPrintEnable: state.VerifierReducer.enableFingerPrint
  }
}
export default connect(mapStateToProps, null)(HomeScreen)