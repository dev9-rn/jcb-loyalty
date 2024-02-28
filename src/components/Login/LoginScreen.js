import React, { Component } from 'react';
import { StatusBar, Button,  BackHandler, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity } from 'react-native';
import { Header, Left, Body, Content, Card, CardItem, Text, Title, Icon } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import LoginService from '../../services/LoginService/LoginService';
import { LAT, LONG, LOC_ERROR } from '../../Utility/GeoLocation';
import OfflineNotice from '../../Utility/OfflineNotice';
import Loader from '../../Utility/Loader';
import * as utilities from '../../Utility/utilities';
import * as app from '../../App';
import Modal from "react-native-modal";
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import { strings } from '../../locales/i18n';
import I18n from 'react-native-i18n';
import { setLoginData } from '../../Redux/Actions/InstituteActions';
import { bindActionCreators } from 'redux';
import MyColors from '../../Utility/Colors';
// import AsyncStorage from '@react-native-community/async-storage';

 class LoginScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isConnected: true,
      mobileNumber: '',
      password: '',
      borderBottomColorPassword: '#757575',
      borderBottomColorUserName: '#757575',
      loading: false,
      loaderText: 'Logging in...',
      isModalVisible: false,
      brandCode: '',
      brandCodeError: ''
    };
  }
  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };
  // componentWillMount() {
  //   this.setState({ isConnected: app.ISNETCONNECTED });
  //   this.getUserData();
  // }
  componentDidMount() {
    this.setState({ isConnected: app.ISNETCONNECTED });
    this.getUserData();
    // SplashScreen.hide()
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    // NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  handleBackPress = () => {
    // Alert.alert(
    //   'Exit App',
    //   'Are you sure you want to exit this app',
    //   [
    //     {text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
    //     {text: 'YES', onPress: () => { BackHandler.exitApp(); }},
    //   ],
    //   { cancelable: false }
    // );
    BackHandler.exitApp();
    return true;
  }

  handleConnectivityChange = isConnected => {
    if (isConnected) {
      alert(isConnected);
      this.setState({ isConnected });
    } else {
      alert(isConnected)
      this.setState({ isConnected });
      utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
    }
  };

  async closeActivityIndicator() {
    await setTimeout(() => {
      this.setState({ loading: false });
    });
  }

  async getUserData() {
    await AsyncStorage.getItem('USERDATA', (err, result) => {   // USERDATA is set on VerifierLoginScreen
      var lData = JSON.parse(result);
      if (lData) {
        // if(lData.hasOwnProperty('data')){
        if (lData.data.id) {
          this.props.navigation.navigate('HomeScreen');
        }
        // }

      }
    });
  }

  _validateMobileNumber() {
    let lMobileNumber = this.state.mobileNumber;
    let res = '';
    res = utilities.checkMobileNumber(lMobileNumber);
    if (!res || lMobileNumber.trim().length < 10) {
      this.setState({ phoneNumberError: "This mobile number appears to be invalid." });
    }
    return res;
  }

  async callForAPI() {
    let lMobileNumber = this.state.mobileNumber;
    const formData = new FormData();

    formData.append('mobileNo', lMobileNumber);

    var loginApiObj = new LoginService();

    this.setState({ loading: true });
    await loginApiObj.login(formData);
    var lResponseData = await loginApiObj.getRespData();
    this.setState({ mobileNumber: '' })
    this.closeActivityIndicator();
    console.log("lResponse data:", lResponseData);
    if (!lResponseData) {
      this.closeActivityIndicator();
      utilities.showToastMsg('Something went wrong. Please try again later');
      return true;
    }
    else if (lResponseData.status == 400 || lResponseData.status == 500 || lResponseData.status == 422 || lResponseData.status == 403
      || lResponseData.status == 503 || lResponseData.status == 451) {
      this.closeActivityIndicator();
      utilities.showToastMsg(lResponseData.message);
      return;
    }
    else if (lResponseData.status == 200) {
      this.closeActivityIndicator();
      utilities.showToastMsg('OTP sent successfully');
      console.log("otp data:", lResponseData);
      try {
        // await AsyncStorage.setItem('USERDATA',JSON.stringify(lResponseData));
        this.props.navigation.navigate('OTPVerification', { mobileNumber: lMobileNumber });
      } catch (error) {
        console.log(error);
      }
    } else {
      this.closeActivityIndicator();
      utilities.showToastMsg('Something went wrong. Please try again later');
    }
  }

  async _onPressButton() {

    if (!this.state.isConnected || !app.ISNETCONNECTED) {
      // alert(app.ISNETCONNECTED);
      utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
    } else {

      let lMobileNumber = this.state.mobileNumber;
      var isValidMobileNumber = '';

      if (lMobileNumber == '') {
        utilities.showToastMsg('Enter mobile number');
      }
      else if (lMobileNumber) {
        isValidMobileNumber = await this._validateMobileNumber();
        if (isValidMobileNumber) {
          this.callForAPI();
        } else {
          utilities.showToastMsg('Wrong login credentials! Please check and try again');
        }
      } else {
        alert('Server error');
      }
    }
  }

  _showOffline() {
    if (!app.ISNETCONNECTED) {
      return (
        <OfflineNotice />
      )
    }
  }

  _showHeader() {
    if (Platform.OS == 'ios') {
      return (
        <Header style={{ backgroundColor: '#0000FF' }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9 }}>
            <Title style={{ color: '#FFFFFF' }}>Sec Doc SeQR</Title>
          </Body>
        </Header>
      )
    } else {
      return (
        <Header style={{ backgroundColor: '#0000FF' }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9, alignItems: 'center' }}>
            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Sec Doc SeQR</Title>
          </Body>

        </Header>
      )
    }
  }
  verifyBrandID = () => {
    this.setState({ loading: true })
    const formData = new FormData();
    formData.append('brandCode', this.state.brandCode);
    var lUrl = URL + 'validateBrand';
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
        this.setState({ loading: false })
        console.log(responseJson);
        if (responseJson.status == 422) {
          this.setState({ brandCodeError: responseJson.message,brandCode:'' })
        } else if (responseJson.status == 200) {
          this.setState({ brandCodeError: '' }, () => {
            AsyncStorage.setItem('BRANDCODE', JSON.stringify(responseJson.brand_id));
            this.toggleModal();
            this.navigateToSignUpScreen();
          })
        } else {

        }
      })
      .catch((error) => {
        this.setState({ loading: false })
        console.log(error);
      });
  }
  navigateToSignUpScreen = () => {
    this.props.navigation.navigate('SignUpScreen')
  }
  render() {
    return (
      <View style={styles.container}>

        <OfflineNotice />

        <StatusBar
          barStyle="light-content"
        />

        <Loader
          loading={this.state.loading}
          text={this.state.loaderText}
        />

        <View style={styles.containerLevel1}>
          <View>
            <Image
              style={{ width: 350, height: 1000 }}
              resizeMode='contain'
              source={require('../../images/iTunesArtwork.png')}
            />
          </View>
        </View>
        <View style={styles.loginViewContainer}>
          <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
            <Card style={styles.cardContainer}>

              <CardItem header style={styles.cardHeader}>
                <Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>{strings('login.distributorLogin')}</Text>
              </CardItem>

              <View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
                <View style={styles.inputContainer}>

                  <TextInput
                    style={{
                      borderBottomColor: this.state.borderBottomColorUserName,
                      ...styles.inputs
                    }}
                    value={this.state.mobileNumber}
                    placeholderTextColor='#757575'
                    keyboardType='number-pad'
                    maxLength={10}
                    placeholder={strings('login.paymentOptions_screen_placeholder_mobileno')}
                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                    onChangeText={(mobileNumber) => this.setState({ mobileNumber })}
                  />
                </View>
              </View>

              <View>
                <Content padder>
                  <TouchableOpacity onPress={() => this._onPressButton()}>
                    <View style={styles.buttonLogin}>

                      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.linearGradient}>
                        <Text style={styles.buttonText}>
                        {strings('login.distributorLogin')}
                    </Text>
                      </LinearGradient>

                    </View>
                  </TouchableOpacity>
                  <Modal isVisible={this.state.isModalVisible}>
                    <View style={{ height: 300 }}>
                      <Card style={styles.cardContainer}>
                        <CardItem header >
                          <Text style={{ textAlign: 'center', flex: 1, paddingLeft: 10 }}>{strings('login.brandCodeInsert')}</Text>
                          <TouchableOpacity onPress={(isModalVisible) => this.setState({ isModalVisible: false, brandCodeError: "" })}>
                            <Icon type="FontAwesome" name="times" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} />
                          </TouchableOpacity>
                        </CardItem>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
                        <View style={{ marginTop: 20 }}>
                          <Text>{strings('login.brandCode')} : </Text>
                          <TextInput
                            style={{
                              borderBottomColor: this.state.borderBottomColorUserName,
                              ...styles.inputs
                            }}
                            maxLength={4}
                            placeholder={strings('login.brandCode')}
                            onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                            onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                            onChangeText={(brandCode) => this.setState({ brandCode })}
                          />
                          {this.state.brandCodeError ?
                            <View style={{ marginTop: 15, marginLeft: 20 }}>
                              <Text style={{ color: 'red' }}>{this.state.brandCodeError}</Text>
                            </View>
                            : <View></View>}
                          <View style={{ marginTop: 40 }}>
                            <Button title={strings('login.profileScreenSubmit')} disabled={this.state.brandCode ? false : true} onPress={this.verifyBrandID} />
                          </View>
                        </View>
                      </Card>
                    </View>
                  </Modal>
                  <View>
                    <TouchableOpacity style={{ marginTop: 15, paddingLeft: 10 }} >
                      {/* <Text style={{ color: '#1784C7', fontSize: 12}}>Click here to sign up</Text> onPress={() => this.props.navigation.navigate('SignUpScreen')}*/}
                      <Text style={{ color: '#1784C7', fontSize: 12 }} onPress={this.toggleModal}>{strings('login.clickHereToSignUp')}</Text>
                    </TouchableOpacity>
                  </View>
                </Content>
              </View>
            </Card>

          </KeyboardAwareScrollView>
        </View>
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLevel1: {
    flex: 0.7,
    justifyContent: 'space-around',
    alignItems: 'center',
    // paddingTop: Dimensions.get('window').width * 0.1,
    // paddingLeft: 50,
    // paddingRight: 50,

  },
  loginViewContainer: {
    flex: 1,
    alignItems: 'stretch',
  },
  cardContainer: {
    padding: 15,
    marginLeft: 20,
    marginRight: 20,
    flex: 1
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flex: 1
  },
  inputContainer: {
    marginTop: 25,
    marginBottom: 15,
    // backgroundColor: 'orange',
    flex: 1,
  },
  inputs: {
    height: 45,
    marginLeft: 5,
    borderBottomWidth: 1,
    color: '#000000',
    // backgroundColor: 'lightgreen'    
  },
  buttonLogin: {
    marginTop: 10,
    backgroundColor: '#0000FF',
    borderRadius: 5,
    flex: 1
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  },
  buttonText: {
    fontSize: 18,
    // fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },

})


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
    setLoginData: setLoginData
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)