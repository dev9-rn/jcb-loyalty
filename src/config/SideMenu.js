import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { NavigationActions, DrawerActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Alert, ScrollView, Modal , View, StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Icon, Accordion, Text,Card } from "native-base";
import LoginService from '../services/LoginService/LoginService';
import { Picker } from 'native-base';
// import * as app from '../../App';
import * as utilities from '../Utility/utilities';
import { Grid, Col, Row } from 'react-native-easy-grid';
import RNFS from 'react-native-fs';
import { APIKEY, FCMTOKEN } from '../App'
import FileViewer from 'react-native-file-viewer';
import Loader from '../Utility/Loader';
import { strings } from '../locales/i18n';
import I18n from 'react-native-i18n';
import moment from 'moment';
import { Dropdown } from 'react-native-material-dropdown-v2';
import SwitchToggle from "react-native-switch-toggle";
import { setLanguage, setCounterValue, setCounter1Value, enableDarkTheme, fingerPrintEnableAuth, setMechanicData } from '../Redux/Actions/VerifierActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { clearInsti } from '../Redux/Actions/InstituteActions';
import RNPicker from "rn-modal-picker";
import { color } from 'react-native-reanimated';
var pkg = require("../../package.json");

class SideMenu extends Component {
  constructor(props) {
    super(props);
    this.distributorId;
    // this.fcmToken;
    this.state = {
      isDrawerOpen: true,
      imageURL: '',
      loaderText: 'Please wait...',
      loading: false,
      menuList: [],
      changeThemeEnable: '',
      accesstoken:'',
      selectedLanguage: this.props.languageControl, // Store the selected language
      modalVisible: false, // Track the modal visibility
    };
    this._renderContent = this._renderContent.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
    // props = this.prop;
    // menuList = [
    //   { title: strings('login.profile'), nav1: 'ProfileScreen' },
    //   { title: strings('login.sdemenu_scan'), nav1: 'ScanScreen' },
    //   { title: strings('login.sidemenu_couponhistory'), nav1: 'HistoryScreen' },
    //   { title: strings('login.sidemenu_report'), nav1: 'ReportScreen' },
    //   { title: strings('login.sidemenu_reporthistory'), nav1: 'ReportHistory' },
    //   { title: strings('login.Manual') },
    //   { title: strings('login.logout') },
    // ];
  }

  updateMenuList = () => {
    this.setState({
      menuList: [
        { title: strings('login.profile'), nav1: 'ProfileScreen' },
        { title: strings('login.sdemenu_scan'), nav1: 'ScanScreen' },
        { title: strings('login.sidemenu_couponhistory'), nav1: 'HistoryScreen' },
        { title: strings('login.cashbash'), nav1: 'CashBatchesScreen' },
        { title: strings('login.sidemenu_report'), nav1: 'ReportScreen' },
        { title: strings('login.sidemenu_reporthistory'), nav1: 'ReportHistory' },
        { title: strings('login.Manual') },
        { title: strings('login.logout') },
        { title: "LANGUAGE" },
      ],
    });
  };

  

  // Open the language selection modal
  openLanguageModal = () => {
    this.setState({ modalVisible: true });
  };

  // Close the language selection modal
  closeLanguageModal = () => {
    this.setState({ modalVisible: false });
  };

  // Handle language selection
  onSelectLanguage = (language) => {
    this.props.setLanguage(language);
    I18n.locale = this.getLocale(language);
    this.setState({ selectedLanguage: language, modalVisible: false });
    this.updateMenuList(); // Update menu list with new translations
    // this.getAsyncData()
  };

  // Map selected language to the I18n locale
  getLocale = (language) => {
    switch (language) {
      case 'English - (English)':
        return 'en';
      case 'Hindi - (हिन्दी)':
        return 'hi';
      case 'French - (Française)':
        return 'fr';
      case 'Punjabi - (ਪੰਜਾਬੀ)':
        return 'pa';
      case 'Marathi - (मराठी)':
        return 'ma';
      case 'Gujarati - (ગુજરાતી)':
        return 'gu';
      case 'Telugu - (తెలుగు)':
        return 'tl';
      case 'Bengali - (বাংলা)':
        return 'ben';
      case 'Urdu - (اردو)':
        return 'ur';
      case 'Kannada - (ಕನ್ನಡ)':
        return 'kan';
      case 'Odia - (ଓଡିଆ)':
        return 'od';
      case 'Swahili - (Kiswahili)':
        return 'swa';
      // Add other languages as needed
      default:
        return 'en';
    }
  };

  navigateToScreen = (route) => () => {
    const navigateAction = NavigationActions.navigate({
      routeName: route,
      params: {},
      action: DrawerActions.toggleDrawer()
    });

    this.props.prop.navigation.dispatch(navigateAction);
    // this.props.prop.navigation.dispatch(DrawerActions.toggleDrawer());
  }

  componentDidUpdate = () => {
    require('moment/locale/hi.js');
    require('moment/locale/fr.js');
    require('moment/locale/mr.js');
    // require('moment/locale/pa-in.js');
    require('moment/locale/gu.js');
    require('moment/locale/te.js');
    require('moment/locale/ta.js');
    require('moment/locale/bn.js');
    require('moment/locale/ur.js');
    require('moment/locale/kn.js');
    require('moment/locale/sw.js');

    console.log("------------" , I18n.currentLocale())

    if (I18n.currentLocale() == 'hi') {
      moment.locale('hi');
    } else if (I18n.currentLocale() == 'fr') {
      moment.locale('fr');
    } else if (I18n.currentLocale() == 'en') {
      moment.locale('en');
    } else if (I18n.currentLocale() == 'pn') {
      moment.locale('pa');
    } else if (I18n.currentLocale() == 'mr') {
      moment.locale('mr');
    } else if (I18n.currentLocale() == 'gu') {
      moment.locale('gu');
    } else if (I18n.currentLocale() == 'tl') {
      moment.locale('te');
    } else if (I18n.currentLocale() == 'ta') {
      moment.locale('ta');
    } else if (I18n.currentLocale() == 'ben') {
      moment.locale('bn');
    } else if (I18n.currentLocale() == 'ur') {
      moment.locale('ur');
    } else if (I18n.currentLocale() == 'kan') {
      moment.locale('kn');
    } else if (I18n.currentLocale() == 'od') {
      moment.locale('od');
    } else if (I18n.currentLocale() == 'swa') {
      moment.locale('sw');
    }
    else {
      moment.locale('en');
    }

    // this.updateMenuList();

    

    
  }

  componentDidMount() {
    this.getAsyncData();
    this.willFocusSubscription = this.props.prop.navigation.addListener(
      'willFocus',
      payload => {
        this.getAsyncData()
      }
    );
    // setTimeout(() => { this.getAsyncData() }, 500);
  }

  async closeActivityIndicator() {
    await setTimeout(() => {
      this.setState({ loading: false });
    });
  }
  async getAsyncData() {
    await AsyncStorage.multiGet(['USERDATA', 'FCMTOKEN'], (err, result) => {    // FCMTOKEN is set on App.js
      var lData = JSON.parse(result[0][1]);
      var lDataFcmToken = JSON.parse(result[1][1]);
      if (lData) {
        ;
        this.setState({ name: lData.data.name, imageURL: lData.data.brand_logo });
        console.log("sidemenu data",lData);

        this.setState({
         name: lData.data.company_name ? lData.data.company_name : lData.data.shop_name, imageURL: lData.data.brand_logo, userType: lData.data.userType,
          menuList: [
        { title: strings('login.profile'), nav1:  'ProfileScreen' },
        { title: strings('login.sdemenu_scan'), nav1: 'ScanScreen' },
        { title: strings('login.sidemenu_couponhistory'), nav1: 'HistoryScreen' },
        { title : strings('login.cashbash'),nav1:'CashBatchesScreen'},
        { title: strings('login.sidemenu_report'), nav1: 'ReportScreen' } ,
        { title: strings('login.sidemenu_reporthistory'), nav1: 'ReportHistory' } ,
        { title: strings('login.Manual')},
        { title: strings('login.logout') },
        { title: "LANGUAGE" },
         ],
       
       });
      //  this.setState({ isLoaded: true });
        this.distributorId = lData.data.id;
        this.updateMenuList(); // Update menu list with translations
        // this.fcmToken = lDataFcmToken.fcmToken;
      }
    });
  }

  async _callForLogoutAPI() {
    ;
    const formData = new FormData();
    formData.append('distributorId', this.distributorId);
    formData.append('deviceToken', FCMTOKEN);
    // formData.append('deviceToken', app.FCMTOKEN);
    // console.log("========logout",JSON.stringify(formData,null,2))
    var loginApiObj = new LoginService();
    this.setState({ loading: true });
    await loginApiObj.logOut(formData);
    var lResponseData = loginApiObj.getRespData();
    
    this.closeActivityIndicator();
    console.log(lResponseData);

    if (!lResponseData) {
      utilities.showToastMsg('Something went wrong. Please try again later');
    } else if (lResponseData.status == 200) {
      this.props.prop.navigation.navigate('LoginScreen');
      AsyncStorage.clear();
      this.props.setLanguage('English - (English)');
      utilities.showToastMsg(lResponseData.message);
      
    } else {
      utilities.showToastMsg('Something went wrong. Please try again later');
    }

  }

  _logOut() {
    Alert.alert(
      strings('login.logoutMsg_title'),
      strings('login.logoutMsg'),
      [
        { text: strings('login.alertNo'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: strings('login.alertYes'), onPress: () => {
            this._callForLogoutAPI();
          }
        },
      ],
      { cancelable: false }
    );
  }

  _renderHeader(item, expanded) {
    if (item.title == 'MANUAL' || item.title == "ম্যানুয়াল" || item.title == "મેન્યુઅલ" || item.title == "मैनुअल" || item.title == "ಹಸ್ತಚಾಲಿತ" || item.title == "मॅन्युअल"
    || item.title == "ମାନୁଆଲ" || item.title == "ਮੈਨੁਅਲ"  | item.title == "Mwongozo" | item.title == "கையேடு" | item.title == "మాన్యువల్" | item.title == "دستی") {
      return (
        <TouchableOpacity onPress={() => { this.openPdf() }}>
          <View style={{
            flexDirection: "row",
            padding: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: '#FF1E58',
          }}
          >
            {/* <Text style={{ fontWeight: "600", paddingLeft: 25, textAlign: 'justify' }}>
              {" "}{item.title}
            </Text> */}
            <Grid>
              <Row>
                <Col size={10} style={{ justifyContent: 'center' }}>
                  <Text style={{ fontWeight: "bold", paddingLeft: 25, textAlign: 'justify' }}>
                    <Icon type="FontAwesome" name="file-pdf-o" style={{ fontSize: 18, color: 'black' }} />
                    {"   "}{item.title}
                  </Text>
                </Col>
                <Col size={2} style={{ justifyContent: 'center' }}>
                  <Icon type="FontAwesome" name="download" style={{ fontSize: 20 }} />
                </Col>
              </Row>
            </Grid>
          </View>
        </TouchableOpacity>
      );
    } else if (item.title == 'LOGOUT' || item.title == 'लॉग आउट' || item.title == 'প্রস্থান' || item.title == 'લૉગ આઉટ' || item.title == 'ಲಾಗ್ ಔಟ್' || item.title == 'बाहेर पडणे' || item.title == 'ପ୍ରସ୍ଥାନ କର' || item.title == 'ਲਾੱਗ ਆਊਟ' || item.title == 'வெளியேறு' || item.title == 'లాగ్అవుట్' || item.title == 'لاگ آوٹ' || item.title == 'Déconnecter' || item.title == 'Njia kutoka') {
      return (
        <TouchableOpacity onPress={() => { this._logOut() }}>
          <View style={{
            flexDirection: "row",
            padding: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: '#FF1E58',
          }}
          >
            {/* <Text style={{ fontWeight: "bold", paddingLeft: 25, textAlign: 'justify' }}>
              {" "}{item.title}
            </Text> */}
            <Text style={{ fontWeight: "bold", paddingLeft: 25, textAlign: 'justify', color: 'black' }}>
              <Icon type="FontAwesome" name="power-off" style={{ fontSize: 18, color: 'black' }} />
              {"   "}{item.title}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } 
    //if (item.title == 'SCAN' || item.title == 'HISTORY' || item.title == 'PROFILE' || item.title == 'REPORT' || item.title == 'REPORT HISTORY' || item.title == 'COUPON HISTORY') {
      if (
        item.title == 'SCAN' || item.title == 'স্ক্যান' || item.title == "Analyse" || item.title == "સ્કેન" || item.title == "स्कैन" || item.title == "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ" || item.title == "स्कॅन" || item.title == "ସ୍କାନ୍ କରନ୍ତୁ |" || item.title == "ਸਕੈਨ" || item.title == "ஊடுகதிர்" || item.title == "స్కాన్" || item.title == "اسکین" || item.title == 'Kanuni' ||
        item.title == 'PROFILE' || item.title == 'प्रोफ़ाइल' || item.title == 'Profil' || item.title == 'प्रोफाइल' || item.title == 'ਪ੍ਰੋਫਾਈਲ' || item.title == 'પ્રોફાઇલ' || item.title == 'ప్రొఫైల్' || item.title == 'சுயவிவரம்' || item.title == 'নথিপত্র' || item.title == 'پروفائل' || item.title == 'ಪ್ರೊಫೈಲ್' || item.title == 'ପ୍ରୋଫାଇଲ୍ |' || item.title == 'MWANDISHI' ||
        item.title == 'COUPON HISTORY' || item.title == 'कूपन इतिहास' || item.title == 'Historique des coupons' || item.title == 'कूपन इतिहास' || item.title == 'ਕੂਪਨ ਇਤਿਹਾਸ' || item.title == 'કૂપન ઇતિહાસ' || item.title == 'కూపన్ చరిత్ర' || item.title == 'கூப்பன் வரலாறு' || item.title == 'কুপন ইতিহাস' || item.title == 'کوپن کی تاریخ' || item.title == 'ಕೂಪನ್ ಇತಿಹಾಸ' || item.title == 'କୁପନ୍ ଇତିହାସ |' || item.title == 'Historia ya coupon' ||
        item.title == 'CASH-BATCH REPORT' || item.title == "कैश-बैच रिपोर्ट" || item.title == "নগদ-ব্যাচের প্রতিবেদন" || item.title == "Rapport Cash-Batch" || item.title == "કેશ-બેચ રિપોર્ટ" || item.title == "ನಗದು-ಬ್ಯಾಚ್ ವರದಿ" || item.title == "रोख-बॅच अहवाल" || item.title == "ନଗଦ-ବ୍ୟାଚ୍ ରିପୋର୍ଟ" || item.title == "ਨਕਦ-ਬੈਚ ਦੀ ਰਿਪੋਰਟ" || item.title == "Cash-Batch-rapport" || item.title == "பண-தொகுதி அறிக்கை" || item.title == "నగదు-బ్యాచ్ నివేదిక" || item.title == "کیش بیچ کی رپورٹ" ||
        item.title == 'PAYMENT OPTIONS' || item.title == 'भुगतान विकल्प' || item.title == 'Options de paiement' || item.title == 'पैसे भरणासाठीचे पर्याय' || item.title == 'ਭੁਗਤਾਨ ਵਿਕਲਪ' || item.title == 'ચુકવણી વિકલ્પો' || item.title == 'చెల్లింపు పద్ధతులు' || item.title == 'கட்டண விருப்பங்கள்' || item.title == 'অর্থ প্রদানের বিকল্পগুলি' || item.title == 'آدائیگی کے طریقے' || item.title == 'ಪಾವತಿಯ ವಿಧ' || item.title == 'ଦେୟ ବିକଳ୍ପ' || item.title == 'Malengo ya utoaji' ||
        item.title == 'REPORT' || item.title == 'रिपोर्ट' || item.title == 'Rapport' || item.title == 'अहवाल' || item.title == 'ਪ੍ਰੋਫਾਈਲ' || item.title == 'અહેવાલ' || item.title == 'నివేదిక' || item.title == 'அறிக்கை' || item.title == 'প্রতিবেদন' || item.title == 'رپورٹ کریں' || item.title == 'ವರದಿ' || item.title == 'ରିପୋର୍ଟ' || item.title == 'Ripoti' ||
        item.title == 'PASSBOOK' || item.title == 'पासवृक' || item.title == 'PASSBOOK' || item.title == 'পাসবুক' || item.title == 'પાસબુક' || item.title == 'ಪಾಸ್‌ಬುಕ್' || item.title == 'पासबुक' || item.title == 'ପାସ୍ବୁକ୍ |' || item.title == 'ਪਾਸਬੁਕ' || item.title == 'பாஸ்புக்' || item.title == 'లావాదేవీల' || item.title == 'پاس بک' || item.title == 'PISANI' ||
        item.title == 'PRODUCTS' || item.title == 'उत्पादों' || item.title == 'DES PRODUITS' || item.title == 'পণ্য' || item.title == 'પ્રૉડક્ટ્સ' || item.title == 'ಪ್ರಾಡಕ್ಟ್ಸ್' || item.title == 'प्रॉडक्ट्स' || item.title == 'ଉତ୍ପାଦଗୁଡିକ' || item.title == 'ਪ੍ਰਾਡਕ੍ਟ੍ਸ' || item.title == 'தயாரிப்புகள்' || item.title == 'ఉత్పత్తులు' || item.title == 'مصنوعات' || item.title == 'Bidhaa' ||
        item.title == 'REPORT HISTORY' || item.title == 'रिपोर्ट इतिहास' || item.title == 'Historique du rapport' || item.title == 'ইতিহাসের প্রতিবেদন করুন' || item.title == 'ઇતિહાસની જાણ કરો' || item.title == 'ಇತಿಹಾಸವನ್ನು ವರದಿ ಮಾಡಿ' || item.title == 'इतिहास नोंदवा' || item.title == 'ରିପୋର୍ଟ ଇତିହାସ' || item.title == 'ਇਤਿਹਾਸ ਦੀ ਰਿਪੋਰਟ ਕਰੋ' || item.title == 'வரலாற்றைப் புகாரளிக்கவும்' || item.title == 'చరిత్రను నివేదించండి' || item.title == 'تاریخ(ہسٹری ) کی اطلاع دیں' || item.title == 'Ripoti ya historia' ||
        item.title == 'PRODUCTS HISTORY' || item.title == 'उत्पाद इतिहास' || item.title == 'HISTOIRE DES PRODUITS' || item.title == 'পণ্য ইতিহাস' || item.title == 'પ્રૉડક્ટ્સ હિસ્ટરી' || item.title == 'ಪ್ರಾಡಕ್ಟ್ಸ್ ಹಿಸ್ಟರೀ' || item.title == 'प्रॉडक्ट्स हिस्टरी' || item.title == 'ଉତ୍ପାଦ ଇତିହାସ |' || item.title == 'ਪ੍ਰਾਡਕ੍ਟ੍ਸ ਹਿਸ੍ਟਰੀ' || item.title == 'தயாரிப்புகள் வரலாறு' || item.title == 'ఉత్పత్తుల చరిత్ర' || item.title == 'مصنوعات کی تاریخ' || item.title == 'Historia ya Bidhaa'
        // item.title == 'DEALERS' || item.title == 'डीलरों' || item.title == 'ব্যবসায়ীরা' || item.title == 'Concessionnaires' || item.title == 'વેપારીઓ' || item.title == 'ವಿತರಕರು' || item.title == 'विक्रेते' || item.title == 'ଡିଲରମାନେ' || item.title == 'ਡੀਲਰ' || item.title == 'Återförsäljare' || item.title == 'விநியோகஸ்தர்கள்' || item.title == 'డీలర్లు' || item.title == 'ڈیلر'
      ){
      return (
        <TouchableOpacity onPress={this.navigateToScreen(item.nav1)}>
          <View style={{
            flexDirection: "row",
            padding: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: '#FF1E58',
          }}
          >
            {/* <Text style={{ fontWeight: "bold", paddingLeft: 25, textAlign: 'justify' }}>
              {" "}{item.title}
            </Text> */}
            <Text style={{ fontWeight: "bold", paddingLeft: 25, textAlign: 'justify', color: 'black' }}>
            {item.title == 'SCAN' || item.title == 'স্ক্যান' || item.title == "Analyse" || item.title == "સ્કેન" || item.title == "स्कैन" || item.title == "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ" || item.title == "स्कॅन" || item.title == "ସ୍କାନ୍ କରନ୍ତୁ |" || item.title == "ਸਕੈਨ" || item.title == "ஊடுகதிர்" || item.title == "స్కాన్" || item.title == "اسکین" || item.title == 'Kanuni' ?
                <Icon type="FontAwesome" name="qrcode" style={{ fontSize: 18, color: 'black' }} />
                :
                (
                  item.title == 'PROFILE' || item.title == 'प्रोफ़ाइल' || item.title == 'Profil' || item.title == 'प्रोफाइल' || item.title == 'ਪ੍ਰੋਫਾਈਲ' || item.title == 'પ્રોફાઇલ' || item.title == 'ప్రొఫైల్' || item.title == 'சுயவிவரம்' || item.title == 'নথিপত্র' || item.title == 'پروفائل' || item.title == 'ಪ್ರೊಫೈಲ್' || item.title == 'ପ୍ରୋଫାଇଲ୍ |' || item.title == 'MWANDISHI' ?
                  <Icon type="FontAwesome" name="user" style={{ fontSize: 18, color: 'black' }} />
                    :
                    (
                      item.title == 'COUPON HISTORY' || item.title == 'कूपन इतिहास' || item.title == 'Historique des coupons' || item.title == 'कूपन इतिहास' || item.title == 'ਕੂਪਨ ਇਤਿਹਾਸ' || item.title == 'કૂપન ઇતિહાસ' || item.title == 'కూపన్ చరిత్ర' || item.title == 'கூப்பன் வரலாறு' || item.title == 'কুপন ইতিহাস' || item.title == 'کوپن کی تاریخ' || item.title == 'ಕೂಪನ್ ಇತಿಹಾಸ' || item.title == 'କୁପନ୍ ଇତିହାସ |' || item.title == 'Historia ya coupon' ?
                      <Icon type="FontAwesome" name="book" style={{ fontSize: 18, color: 'black' }} />
                        :
                        (
                        item.title == 'CASH-BATCH REPORT' || item.title == "कैश-बैच रिपोर्ट" || item.title == "নগদ-ব্যাচের প্রতিবেদন" || item.title == "Rapport Cash-Batch" || item.title == "કેશ-બેચ રિપોર્ટ" || item.title == "ನಗದು-ಬ್ಯಾಚ್ ವರದಿ" || item.title == "रोख-बॅच अहवाल" || item.title == "ନଗଦ-ବ୍ୟାଚ୍ ରିପୋର୍ଟ" || item.title == "ਨਕਦ-ਬੈਚ ਦੀ ਰਿਪੋਰਟ" || item.title == "Cash-Batch-rapport" || item.title == "பண-தொகுதி அறிக்கை" || item.title == "నగదు-బ్యాచ్ నివేదిక" || item.title == "کیش بیچ کی رپورٹ" ?
                        <Icon type="FontAwesome" name="money" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                        :
                        (
                          item.title == 'PAYMENT OPTIONS' || item.title == 'भुगतान विकल्प' || item.title == 'Options de paiement' || item.title == 'पैसे भरणासाठीचे पर्याय' || item.title == 'ਭੁਗਤਾਨ ਵਿਕਲਪ' || item.title == 'ચુકવણી વિકલ્પો' || item.title == 'చెల్లింపు పద్ధతులు' || item.title == 'கட்டண விருப்பங்கள்' || item.title == 'অর্থ প্রদানের বিকল্পগুলি' || item.title == 'آدائیگی کے طریقے' || item.title == 'ಪಾವತಿಯ ವಿಧ' || item.title == 'ଦେୟ ବିକଳ୍ପ' || item.title == 'Malengo ya utoaji' ?
                          <Icon type="FontAwesome" name="credit-card" style={{ fontSize: 18, color: 'black' }} />
                            :
                            (
                              item.title == 'REPORT' || item.title == 'रिपोर्ट' || item.title == 'Rapport' || item.title == 'अहवाल' || item.title == 'ਪ੍ਰੋਫਾਈਲ' || item.title == 'અહેવાલ' || item.title == 'నివేదిక' || item.title == 'அறிக்கை' || item.title == 'প্রতিবেদন' || item.title == 'رپورٹ کریں' || item.title == 'ವರದಿ' || item.title == 'ରିପୋର୍ଟ' || item.title == 'Ripoti' ?
                              <Icon type="FontAwesome" name="flag" style={{ fontSize: 18, color: 'black' }} />
                                :
                                (
                                  item.title == 'REPORT HISTORY' || item.title == 'रिपोर्ट इतिहास' || item.title == 'Historique du rapport' || item.title == 'ইতিহাসের প্রতিবেদন করুন' || item.title == 'ઇતિહાસની જાણ કરો' || item.title == 'ಇತಿಹಾಸವನ್ನು ವರದಿ ಮಾಡಿ' || item.title == 'इतिहास नोंदवा' || item.title == 'ରିପୋର୍ଟ ଇତିହାସ' || item.title == 'ਇਤਿਹਾਸ ਦੀ ਰਿਪੋਰਟ ਕਰੋ' || item.title == 'வரலாற்றைப் புகாரளிக்கவும்' || item.title == 'చరిత్రను నివేదించండి' || item.title == 'تاریخ(ہسٹری ) کی اطلاع دیں' || item.title == 'Ripoti ya historia' ?
                                  <Icon type="FontAwesome" name="history" style={{ fontSize: 18, color: 'black' }} />
                                    :
                                    <Icon type="FontAwesome" name="ban" style={{ fontSize: 18, color: 'black' }} />
                                )
                            )
                        )
                    )
                    )
                )
              }
              {"   "}{item.title}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }

  _renderContent(item) {

    if (item.title == 'HISTORY') {
      return (
        <View>
          <TouchableWithoutFeedback onPress={this.navigateToScreen(item.nav1)} >
            <View style={styles.subMenu}>
              <Text>{item.subMenu1} </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.navigateToScreen(item.nav2)} >
            <View style={styles.subMenu}>
              <Text>{item.subMenu2} </Text>
            </View>
          </TouchableWithoutFeedback>

        </View>
      );
    } else if (item.title == 'LOGOUT') {
      this._logout();
    }
  }
  downloadManual = () => {
    alert(1)
    fetch(`https://seqrloyalty.com/jcb/usermanual/Coupon_Management_System_User_Manual_(Velvex).pdf`, {
    // fetch(`https://seqrloyalty.com/developer/usermanual/Coupon_Management_System_User_Manual_(Velvex).pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart\/form-data',
        'Accept': 'application/json',
        'apikey': APIKEY,
      },
      body: {},
    }).then(res => res.json())
      .then(response => {
        this.setState({ loading: false })
        console.log(response);
        if (response.status == 200) {
          utilities.showToastMsg(response.message);
          // this.openPdf();
        } else if (response.status == 409) { utilities.showToastMsg(response.message); }
        else if (response.status == 422) { utilities.showToastMsg(response.message); }
        else if (response.status == 400) { utilities.showToastMsg(response.message); }
        else if (response.status == 403) { utilities.showToastMsg(response.message); }
        else if (response.status == 405) { utilities.showToastMsg(response.message); }
      })
      .catch(error => {
        this.setState({ loading: false })
        console.log(error);
      });
  }
  getLocalPath = (url) => {
    const filename = url.split('/').pop();
    return `${RNFS.DocumentDirectoryPath}/${filename}`;
  }
  openPdf = async () => {
    this.setState({ loading: true });
    const url = 'https://seqrloyalty.com/jcb/usermanual/JCB_mobile%20user_doc_28.11.2024.pdf';
    // const url = 'https://seqrloyalty.com/developer/usermanual/Coupon_Management_System_User_Manual_(Velvex).pdf';
    // const url = 'https://www.adobe.com/content/dam/Adobe/en/devnet/pdf/pdfs/PDF32000_2008.pdf';
    const localFile = this.getLocalPath(url);
    const options = {
      fromUrl: url,
      toFile: localFile
    };
    RNFS.downloadFile(options).promise
      .then(async (data) => {
        this.setState({ loading: false });
        setTimeout(() => {
          FileViewer.open(localFile);
        }, 500);
        console.log(data);
      })
      .catch(error => {
        this.setState({ loading: false });
        console.warn("Error in downloading file" + error);
      });
  }

  onPress2 = (lang) => {
    if (lang == "English") {
      this.props.setLanguage(lang)
      I18n.locale = 'en';
    } else if (lang == "Hindi") {
      this.props.setLanguage(lang)
      I18n.locale = 'hi';
    } else {
      this.props.setLanguage(lang)
    }
     console.log("selected lang",lang);
    // this.props.setLanguage(lang)

    this.setState({
      menuList: [
        { title: strings('login.profile'), nav1:  'ProfileScreen' },
        { title: strings('login.sdemenu_scan'), nav1: 'ScanScreen' },
        { title: strings('login.sidemenu_couponhistory'), nav1: 'HistoryScreen' },
        { title : strings('login.cashbash'),nav1:'CashBatchesScreen'},
        { title: strings('login.sidemenu_report'), nav1: 'ReportScreen' } ,
        { title: strings('login.sidemenu_reporthistory'), nav1: 'ReportHistory' } ,
        { title: strings('login.Manual')},
        { title: strings('login.logout') },
        { title: "LANGUAGE" },
      ]
    });
  }


  render() {
    const { enableDarkTheme } = this.props;
    const languageOptions = [
      { label: 'English - (English)', value: 'English - (English)' },
      { label: 'Hindi - (हिन्दी)', value: 'Hindi - (हिन्दी)' },
      { label: 'French - (Française)', value: 'French - (Française)' },
      { label: 'Punjabi - (ਪੰਜਾਬੀ)', value: 'Punjabi - (ਪੰਜਾਬੀ)' },
      { label: 'Marathi - (मराठी)', value: 'Marathi - (मराठी)' },
      { label: 'Gujarati - (ગુજરાતી)', value: 'Gujarati - (ગુજરાતી)' },
      { label: 'Telugu - (తెలుగు)', value: 'Telugu - (తెలుగు)' },
      { label: 'Tamil - (தமிழ்)', value: 'Tamil - (தமிழ்)' },
      { label: 'Bengali - (বাংলা)', value: 'Bengali - (বাংলা)' },
      { label: 'Urdu - (اردو)', value: 'Urdu - (اردو)' },
      { label: 'Kannada - (ಕನ್ನಡ)', value: 'Kannada - (ಕನ್ನಡ)' },
      // { label: 'Odia - (ଓଡିଆ)', value: 'Odia - (ଓଡିଆ)' },
      // Add other languages here
    ];

    return (
      <View style={styles.container}>
        <ScrollView>

        <Loader
            loading={this.state.loading}
            text={this.state.loaderText}
          />

        <View style={{ flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 10 }} resizeMode="contain">
              <Image source={{ uri: this.state.imageURL }} style={{ width: 100, height: 100, flex: 1 }} resizeMode="contain" />
            {/* <Text style={{ paddingTop: 10, color: 'grey' }}>{strings('login.welcome')}</Text> */}
            <Text style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{this.state.name}</Text>
          </View>

          <View style={{ alignItems: 'stretch', paddingTop: 0, marginTop: 10 }}>
            <Accordion
              dataArray={this.state.menuList}
              animation={true}
              expanded={[]}
              renderHeader={this._renderHeader}
              style={{ borderTopWidth: 0.5, borderTopColor: '#FF1E58' }}
            />
          </View>

          <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.choose_lang')} :</Text>

          {/* Language Selection Button */}
          <TouchableOpacity onPress={this.openLanguageModal} style={{marginBottom:10, paddingLeft:10, paddingRight:10}}>
            <Text style={[styles.languageButton, { color: enableDarkTheme ? 'white' : 'black' }]}>
              {this.state.selectedLanguage}
            </Text>
          </TouchableOpacity>

           <Text style={{ marginTop: 10, marginLeft: 10, textAlign:'center', color: this.props.enableDarkTheme ? 'white' : 'black' }}>Version 1.3</Text>

          {/* Modal for Language Selection */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={this.closeLanguageModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalHeader}>Select Language</Text>

                {/* Render the language options */}
                <ScrollView style={styles.languageList}>
                  {languageOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.languageOption}
                      onPress={() => this.onSelectLanguage(option.value)}
                    >
                      <Text style={[styles.languageOptionText, { color: enableDarkTheme ? 'white' : 'black' }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Close Button */}
                <TouchableOpacity onPress={this.closeLanguageModal}>
                  <Text style={styles.closeButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // or based on dark mode
  },
  languageButton: {
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  languageList: {
    maxHeight: 300,
    width: '100%',
  },
  languageOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  languageOptionText: {
    fontSize: 16,
  },
  closeButton: {
    fontSize: 16,
    color: '#fab032',
    marginTop: 20,
  },
});

const mapStateToProps = (state) => {
  // console.log(state.VerifierReducer);
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
  } else if (state.VerifierReducer.languageEnglish == "Telugu - (తెలుగు)") {
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

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setLanguage: setLanguage, setCounterValue: setCounterValue,
    setCounter1Value: setCounter1Value, enableDarkThemeCall: enableDarkTheme, fingerPrintEnableAuth: fingerPrintEnableAuth, clearInsti: clearInsti, setMechanicData: setMechanicData
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SideMenu);