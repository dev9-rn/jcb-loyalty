import React, { Component,useEffect } from 'react';
import { StatusBar, Button, BackHandler, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { Header, Left, Body, Content, Card, CardItem, Text, Title, Icon } from 'native-base';
;
import LinearGradient from 'react-native-linear-gradient';
import LoginService from '../../services/LoginService/LoginService';
import Modal from "react-native-modal";
import SplashScreen from 'react-native-splash-screen';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import { connect } from 'react-redux';
import { strings } from '../../locales/i18n';
import I18n from 'react-native-i18n';
import * as utilities from "../../Utility/utilities";
import * as app from '../../App';
import AsyncStorage from '@react-native-community/async-storage';
import VersionCheck from 'react-native-version-check';
import { bindActionCreators } from 'redux';
import { setLoginData } from '../../Redux/Actions/InstituteActions';
import { isMaintenance } from '../../services/MaintenanceService/MaintenanceService';

class LoginScreen extends Component {

  constructor(props) {
    super(props);
    console.log("Login.js");
    this.state = {
      mobileNumber: '',
      password: '',
      borderBottomColorPassword: '#757575',
      borderBottomColorUserName: '#757575',
      isModalVisible: false,
      brandCode: '',
      brandCodeError: ''
    };
    this.getUserData();
  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };
  componentDidMount() {
    console.log(this.props);
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        this.setState(this.state);
      }
    );
  }

  componentWillUnmount() {
    // this.willFocusSubscription.remove();
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
    BackHandler.exitApp();
    return true;
	}
  // componentDidMount(){
  //   // this.checkUpdateNeeded();
  // }
   async checkUpdateNeeded() {
    try{
    let updateNeeded = await VersionCheck.needUpdate();
    // const latestVersion = await VersionCheck.getLatestVersion();
    // const currentVersion = VersionCheck.getCurrentVersion()   
    if (updateNeeded && updateNeeded.isNeeded) {
        //Alert the user and direct to the app url
        Alert.alert(
          'Please Update',
          'Latest Version of the app is now available on playstore. Update the app to continue using....',
          [{
            text:'Update',
            onPress:() => {
              BackHandler.exitApp();
              Linking.openURL(updateNeeded.storeUrl);
            },
          },],
          {cancelable: false},
        );
    }
  }
  catch(error)
  { console.log("Version check error",error);}
}

  async getUserData() {
    await AsyncStorage.getItem('ISMAINTENANCE', async (err, result) => {   // USERDATA is set on VerifierLoginScreen
      var lData = JSON.parse(result);
      console.log("===========lData?.isMaintenanceEnabled" ,lData?.isMaintenanceEnabled)
      if(lData?.isMaintenanceEnabled){
        this.props.navigation.navigate('MaintenancePage');
        // return lData?.isMaintenanceEnabled;
      }else{
        await AsyncStorage.getItem('USERDATA', (err, result) => {   // USERDATA is set on VerifierLoginScreen
          var lData = JSON.parse(result);
          console.log('getuser data....',lData);
          if (lData) {
            if (lData.data.id) {
              this.props.navigation.navigate('HomeScreen');
            }
          }
        });
      }
      console.log('ISMAINTENANCE....',lData?.isMaintenanceEnabled);
    });
    
  }

  _validateMobileNumber() {
    console.log("inside1");
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

    await loginApiObj.login(formData);
    var lResponseData = await loginApiObj.getRespData();
    console.log(lResponseData);
    this.setState({ mobileNumber: '' })
    this.closeActivityIndicator();

    if (!lResponseData) {
      this.closeActivityIndicator();
      alert('Something went wrong. Please try again later');
      return true;
    }
    else if (lResponseData.status == 400 || lResponseData.status == 500 || lResponseData.status == 422 
      || lResponseData.status == 503 || lResponseData.status == 451) {
      this.closeActivityIndicator();
      alert(lResponseData.message);
    } else if (lResponseData.status == 403) {
      alert(lResponseData.message);
      this.props.navigation.navigate('LoginScreen');
      AsyncStorage.clear();
      return;
    }
    else if (lResponseData.status == 200) {
      this.closeActivityIndicator();
      // alert('OTP sent successfully');
      try {
        this.props.navigation.navigate('OTPVerification', { mobileNumber: lMobileNumber });
      } catch (error) {
        console.log("console.logh" ,error);
      }
    } else {
      this.closeActivityIndicator();
      alert('Something went wrong. Please try again later');
    }
  }

  async _onPressButton() {
    console.log(this.state.mobileNumber);
    let lMobileNumber = this.state.mobileNumber;
    var isValidMobileNumber = '';

    if (lMobileNumber == '') {
      alert('Enter mobile number');
      return;
    }
    else if (lMobileNumber) {
      isValidMobileNumber = await this._validateMobileNumber();
      if (isValidMobileNumber) {
        
        this.callForAPI();
      } else {
        alert('Wrong login credentials! Please check and try again');
      }
    } else {
      alert('Server error');
    }
  }

  verifyBrandID = () => {
    const formData = new FormData();
    formData.append('brandCode', this.state.brandCode);
    var lUrl = URL + 'validateBrand';
    fetch(lUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application\/json',
        'Content-Type': 'multipart\/form-data',
        'apikey': 'c4o_LTJIez6XfnH^r=$l&!FAN@MM]5'
      },
      body: formData,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.status == 422) {
          this.setState({ brandCodeError: responseJson.message })
        } else if (responseJson.status == 200) {
          this.setState({ brandCodeError: '' }, () => {
            AsyncStorage.setItem('BRANDCODE', JSON.stringify(responseJson.brand_id));
            this.navigateToSignUpScreen();
          })
        } else {

        }
      })
      .catch(async (error) => {
        await isMaintenance({navigation : this.props.navigation});
        console.log(error);
      });
  }
  navigateToSignUpScreen = () => {
    this.props.navigation.navigate('SignUpScreen')
  }

  closeActivityIndicator() {
    setTimeout(() => {
      this.setState({ animating: false, loading: false });
    });
  }
  render() {
    return (
      // <ScrollView keyboardShouldPersistTaps="always">
      <ScrollView contentContainerStyle={{flex: 1}} keyboardShouldPersistTaps="always" style={styles.container}>
        <View style={styles.containerLevel1}>
          <View style={{ marginTop: 30 }}>
           <Image
              style={{ width: 250, height: 200 }}
              resizeMode='contain'
              source={require('../../images/iTunesArtwork.png')}
            />
          </View>
        </View>
        <View style={styles.loginViewContainer}>
          <ScrollView keyboardShouldPersistTaps="always">
            <Card style={styles.cardContainer}>

              <CardItem header style={styles.cardHeader}>
                <Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>{strings('login.distributorLogin')}</Text>
              </CardItem>

              <View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
                <View style={styles.inputContainer}>
                {/* <Text>{strings('login.paymentOptions_screen_placeholder_mobileno')}</Text> */}
                  <TextInput
                    style={{
                      borderBottomColor: this.state.borderBottomColorUserName,
                      ...styles.inputs
                    }}
                    value={this.state.mobileNumber}
                    keyboardType='number-pad'
                    maxLength={10}
                    placeholder={strings('login.paymentOptions_screen_placeholder_mobileno')}
                    placeholderTextColor='#757575'
                    onFocus={() => { this.setState({ borderBottomColorUserName: '#D24943' }) }}
                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                    onChangeText={(mobileNumber) => this.setState({ mobileNumber })}
                  />
                </View>
              </View>

              <View>
                <Content padder>
                  <TouchableOpacity onPress={() => this._onPressButton()}>
                    <View style={styles.buttonLogin}>

                      <LinearGradient colors={['#fab032', '#fab032', '#fab032']} style={styles.linearGradient}>
                        <Text style={styles.buttonText}>
                          {strings('login.login_button')}
                        </Text>
                      </LinearGradient>

                    </View>
                  </TouchableOpacity>
                  <Modal isVisible={this.state.isModalVisible}>
                    <View style={{ height: 300 }}>
                      <Card style={styles.cardContainer}>
                        <CardItem header >
                          <Text style={{ textAlign: 'center', flex: 1, paddingLeft: 10 }}>{strings('login.brandCodeInsert')}</Text>
                          <TouchableOpacity onPress={(isModalVisible) => this.setState({ isModalVisible: false, brandCodeError: '' })}>
                            <Icon type="FontAwesome" name="times" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} />
                          </TouchableOpacity>
                        </CardItem>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
                        <View style={{ marginTop: 20 }}>
                          <Text>{strings('login.brandCode')} : </Text>
                          {/* <TextInput
                            style={{
                              borderBottomColor: this.state.borderBottomColorUserName,
                              ...styles.inputs
                            }}
                            maxLength={4}
                            placeholder={strings('login.brandCode')}
                            onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                            onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                            onChangeText={(brandCode) => this.setState({ brandCode })}
                          /> */}
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
                       {/* <Text style={{color: '#fab032', fontSize: 14}} onPress={() => this.props.navigation.navigate('SignUpScreen')}>Click here to sign up</Text> */}
                      <Text style={{ color: '#fab032', fontSize: 12 }} onPress={this.toggleModal}>{strings('login.clickHereToSignUp')}</Text>
                    </TouchableOpacity>
                  </View>
                </Content>
              </View>
            </Card>
            {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('MechanicLoginScreen')} style={{ alignItems: 'center' }}>
              <View style={styles.buttonLogin1}>
                <LinearGradient colors={['#fab032', '#fab032', '#fab032']} style={styles.linearGradient}>
                  <Text style={styles.buttonText}>
                    {strings('login.clickForMechanic')}
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity> */}
          </ScrollView>
        </View>
      </ScrollView>
      // {/* </ScrollView> */}
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
    backgroundColor: '#fab032',
    borderRadius: 5,
    flex: 1,
  },
  buttonLogin1: {
    marginTop: 30,
    backgroundColor: '#fab032',
    borderRadius: 5,
    width: 350,
    bottom: 5
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
  } else if (state.VerifierReducer.languageEnglish == "Telgu - (Telgu)") {
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