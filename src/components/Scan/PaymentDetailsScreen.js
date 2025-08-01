import React, { Component } from 'react';
import { Alert, Dimensions, Platform, StyleSheet, View, AppState, TextInput, TouchableOpacity } from 'react-native';
import { Header, Left, Body, Right, Card, Text, Title, Icon, Label } from 'native-base';
import CircleCheckBox, { LABEL_POSITION } from 'react-native-circle-checkbox';
import { Col, Grid, Row } from "react-native-easy-grid";
import * as utilities from '../../Utility/utilities';
import { ScrollView } from 'react-native-gesture-handler';
import { strings } from '../../locales/i18n';
import { URL, APIKEY, ACCESSTOKEN } from '../../App';
import Loader from '../../Utility/Loader';
import { setMechanicData, setCounterValue, setCounter1Value } from '../../Redux/Actions/VerifierActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import * as utilities from "../../Utility/utilities";
import AsyncStorage from '@react-native-community/async-storage';
import { isMaintenance } from '../../services/MaintenanceService/MaintenanceService';

class PaymentDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentWallet: '',
      bankTransfer: '',
      phoneNoError: '',
      phoneNo: '',
      beneficiaryName: '',
      acNo: '',
      ifscCode: '',
      beneficiaryNameError: '',
      acNoError: '',
      ifscCodeError: '',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      loading: false,
      loaderText: 'Loading',
      mechanicID: "",
      showHideVerifyForWallet: "",
      showHideVerifyForBank: "",
      pymOpn: '',
      showRefreshButton: '',
      disableFields: true,
      showHideUpdate: true,
      showHideUpdateForPhoneNo: true,
      appState: AppState.currentState,
      inValidIfsc: false,
      showHideVerifyButtonForWallet: false,
      showHideVerifyButton: false,
      showHideErrorMSg: false,
      showPayOtp1: '',
      showPayOtp2: '',
      callApiOrNo1: false,
      callApiOrNo2: false,
    };
  }
  componentDidMount = () => {
    if (this.props.fingerPrintEnable) {
      console.log("payment screen");
      this.props.navigation.navigate('FingerPrintScannerDemo')
      // this.authCurrent();
    }
    AppState.addEventListener('change', this._handleAppStateChange);
    this.setState({
      callApiOrNo1: this.props.callApiOrNo1, callApiOrNo2: this.props.callApiOrNo2, showPayOtp1: this.props.showPayOtp1, showPayOtp2: this.props.showPayOtp2, showHideErrorMSg: this.props.showHideErrorMSg, showHideVerifyButton: this.props.showHideVerifyButton, showHideVerifyButtonForWallet: this.props.showHideVerifyButtonForWallet, inValidIfsc: this.props.inValidIfsc, showHideUpdate: this.props.showHideUpdate == '' ? false : true, mechanicID: this.props.mechanicID, showHideUpdateForPhoneNo: this.props.showHideVerifyForWallet == '1' ? false : true, phoneNo: this.props.showHideVerifyForWallet == '1' ? this.props.phoneNo : '', showHideVerifyForWallet: this.props.showHideVerifyForWallet, pymOpn: this.props.pymOpn,
      showHideVerifyForBank: this.props.showHideVerifyForBank, beneficiaryName: this.props.beneficiaryName, acNo: this.props.acNo, ifscCode: this.props.ifscCode
    }, () => {
      if (this.props.pymOpn == '1' && this.props.showHideVerifyForWallet == '1' && this.props.counter < 1) {
        this.paymentApi("Paytm Wallet");
      } if (this.props.pymOpn == '2' && this.props.showHideVerifyForBank == '1' && this.props.counter1 < 1) {
        this.paymentApi("Bank Transfer");
      }
    })
    if (this.props.pymOpn == '0') {
      this.setState({ paymentWallet: true, bankTransfer: false })
      return;
    } else if (this.props.pymOpn == '1') {
      this.setState({ paymentWallet: true, bankTransfer: false })
    } else {
      this.setState({ paymentWallet: false, bankTransfer: true })
    }
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange = (nextAppState) => {
    this.setState({ appState: nextAppState });
    if (nextAppState === 'active') {
      if (this.props.fingerPrintEnable) {
        this.props.navigation.navigate('FingerPrintScannerDemo')
        // this.authCurrent();
      }
    }
  };
  _showHeader() {
    if (Platform.OS == 'ios') {
      return (
        <Header style={{ backgroundColor: '#fab032' }} hasTabs>
          <Left style={{ flex: 0.2 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.6, alignItems: 'center' }}>
            <Title style={{ textAlign: 'center', color: '#FFFFFF' }}>{strings('login.paymentOptions_screen_title')}</Title>
          </Body>
          <Right style={{ flex: 0.2 }}>
          </Right>
        </Header>
      )
    } else {
      return (
        <Header style={{ backgroundColor: '#fab032' }} >
          <Left style={{ flex: 0.2 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.6, alignItems: 'center' }}>
            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.paymentOptions_screen_title')}</Title>
          </Body>
          <Right style={{ flex: 0.2 }}>
          </Right>
        </Header>
      )
    }
  }
  recuriterDataChange = phoneNo => { this.setState({ phoneNo: phoneNo, phoneNoError: '' }) }
  _onPressButton = methodForMoney => {
    if (methodForMoney === 'Wallet') {
      this.setState({ loaderText: 'Verifying mobile number...' })
      if (!this.state.phoneNo || this.state.phoneNo === 'null') {
        this.setState({ phoneNoError: "Phone no is required." });
        return;
      } else if (!utilities.checkMobileNumber(this.state.phoneNo)) {
        this.setState({ phoneNoError: "This phone number appears to be invalid." });
        return;
      } else {
        this.paymentApi("Paytm Wallet");
      }
    } else if (methodForMoney === 'Bank') {
      this.setState({ loaderText: 'Loading...' })
      if (!this.state.beneficiaryName || this.state.beneficiaryName === 'null') {
        this.setState({ beneficiaryNameError: "Beneficiary name is required." });
        return;
      } else if (!this.state.acNo || this.state.acNo === 'null') {
        this.setState({ acNoError: "A/C no is required." });
        return;
      } else if (!this.state.ifscCode || this.state.ifscCode === 'null') {
        this.setState({ ifscCodeError: "IFSC code is required." });
        return;
      } else if (!utilities.checkIFSC(this.state.ifscCode)) {
        this.setState({ ifscCodeError: "IFSC code appears to be invalid." });
        return;
      } else {
        this.paymentApi("Bank Transfer");
      }
    }
  }
  paymentApi = paymentOptions => {
    this.setState({ loading: true })
    const formData = new FormData();
    formData.append('mechanicId', this.state.mechanicID);
    if (paymentOptions === "Paytm Wallet") {
      formData.append('paymentOption', 1);
      formData.append('paytmRegNo', this.state.phoneNo);
      if (this.props.languageControl) {
        formData.append('language', 'en');
      } else {
        formData.append('language', 'hi');
      }
    } else {
      formData.append('paymentOption', 2);
      formData.append('beneficiaryName', this.state.beneficiaryName);
      formData.append('accountNo', this.state.acNo);
      formData.append('ifscCode', this.state.ifscCode);
      if (this.props.languageControl) {
        formData.append('language', 'en');
      } else {
        formData.append('language', 'hi');
      }
    }
    console.log(formData);
    console.log(ACCESSTOKEN);

    var lUrl = URL + 'updatePaymentOption';
    fetch(lUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application\/json',
        'Content-Type': 'multipart\/form-data',
        'apikey': APIKEY,
        "accesstoken": ACCESSTOKEN
      },
      body: formData,
    }).then((response) => response.json())
      .then((responseJson) => {
        this.setState({ loading: false })
        console.log(responseJson);
        if (responseJson.status == 200) {
          Alert.alert(
            strings('login.paymentScreen_alertTitle'),
            `${responseJson.message}`,
            [
              { text: strings('login.OK'), onPress: () => { } },
            ],
            { cancelable: false }
          );
          if (responseJson.data.payment_option == '1') {
            responseJson.data.showHideVerifyButton = this.state.showHideVerifyButton
            responseJson.data.showHideUpdate = this.state.showHideUpdate
            responseJson.data.inValidIfsc = this.state.inValidIfsc
            responseJson.data.showHideVerifyButtonForWallet = true
            responseJson.data.showHideErrorMSg = this.state.showHideErrorMSg
            responseJson.data.showPayOtp1 = '1'
            responseJson.data.showPayOtp2 = this.state.showPayOtp2
            responseJson.data.callApiOrNo1 = true
            responseJson.data.callApiOrNo2 = this.state.callApiOrNo2
            this.setState({ showHideVerifyButtonForWallet: true, showHideUpdateForPhoneNo: false, showPayOtp1: '1', callApiOrNo1: true })
            console.log("111");

            this.props.setCounterValue(1)
          } else {
            responseJson.data.showHideVerifyButtonForWallet = this.state.showHideVerifyButtonForWallet
            responseJson.data.showHideVerifyButton = true
            responseJson.data.showHideUpdate = false
            responseJson.data.inValidIfsc = false
            responseJson.data.showHideErrorMSg = false
            responseJson.data.showPayOtp1 = this.state.showPayOtp1
            responseJson.data.showPayOtp2 = '2'
            responseJson.data.callApiOrNo1 = this.state.callApiOrNo1
            responseJson.data.callApiOrNo2 = true
            this.setState({ showHideUpdate: false, inValidIfsc: false, showHideErrorMSg: false, showHideVerifyButton: true, showPayOtp2: '2', callApiOrNo2: true })
            console.log("123");

            this.props.setCounter1Value(1)
          }
          this.props.setMechanicData(responseJson.data);
        } else if (responseJson.status == 202) {
          if (responseJson.data.payment_option == '1') {
            responseJson.data.showHideVerifyButtonForWallet = this.state.showHideVerifyButtonForWallet
            responseJson.data.showHideVerifyButton = this.state.showHideVerifyButton
            responseJson.data.showHideUpdate = this.state.showHideUpdate
            responseJson.data.inValidIfsc = this.state.inValidIfsc
            responseJson.data.showPayOtp1 = ''
            responseJson.data.showPayOtp2 = this.state.showPayOtp2
            responseJson.data.callApiOrNo1 = this.state.callApiOrNo1
            responseJson.data.callApiOrNo2 = this.state.callApiOrNo2
            this.setState({ showPayOtp1: '' })
          } else {
            responseJson.data.showHideVerifyButtonForWallet = this.state.showHideVerifyButtonForWallet
            responseJson.data.showHideVerifyButton = false
            responseJson.data.showHideUpdate = true
            responseJson.data.inValidIfsc = false
            responseJson.data.showHideErrorMSg = true
            responseJson.data.showPayOtp1 = this.state.showPayOtp1
            responseJson.data.showPayOtp2 = ''
            responseJson.data.callApiOrNo1 = this.state.callApiOrNo1
            responseJson.data.callApiOrNo2 = this.state.callApiOrNo2
            this.setState({ showHideUpdate: true, inValidIfsc: false, showHideErrorMSg: true, showPayOtp2: '' })
          }
          this.props.setMechanicData(responseJson.data);
          Alert.alert(
            strings('login.paymentScreen_alertTitle2'),
            `${responseJson.message}`,
            [
              { text: strings('login.OK'), onPress: () => { } },
            ],
            { cancelable: false }
          );
        }
        else if (responseJson.status == 449) {
          Alert.alert(
            strings('login.paymentScreen_alertTitle1'),
            `${responseJson.data.payment_resp_msg}.`,
            [
              { text: strings('login.OK'), onPress: () => { } },
            ],
            { cancelable: false }
          );
          responseJson.data.showHideVerifyButton = false
          responseJson.data.showHideUpdate = true
          responseJson.data.inValidIfsc = true
          responseJson.data.showPayOtp1 = this.state.showPayOtp1
          responseJson.data.showPayOtp2 = ''
          responseJson.data.callApiOrNo1 = this.state.callApiOrNo1
          responseJson.data.callApiOrNo2 = this.state.callApiOrNo2
          this.props.setMechanicData(responseJson.data);
          this.setState({ ifscCodeError: `${responseJson.data.payment_resp_msg}.`, showHideUpdate: true, inValidIfsc: true, showPayOtp2: '' });
          return;
        }
        else if (responseJson.status == 422) {
          Alert.alert(
            strings('login.paymentScreen_alertTitle1'),
            `${responseJson.data.payment_resp_msg}`,
            [
              { text: strings('login.OK'), onPress: () => { } },
            ],
            { cancelable: false }
          );

          if (responseJson.data.payment_resp_msg == 'This mobile number is not registered with paytm.') {
            this.setState({ phoneNoError: "This mobile number is not registered with paytm." })
          }

          if (responseJson.data.payment_option == '1') {
            responseJson.data.showHideVerifyButtonForWallet = false
            responseJson.data.showPayOtp1 = ''
            responseJson.data.showPayOtp2 = this.state.showPayOtp2
            responseJson.data.showHideVerifyButton = this.state.showHideVerifyButton
            responseJson.data.showHideUpdate = this.state.showHideUpdate
            responseJson.data.showHideErrorMSg = this.state.showHideErrorMSg
            responseJson.data.inValidIfsc = this.state.inValidIfsc
            responseJson.data.callApiOrNo1 = this.state.callApiOrNo1
            responseJson.data.callApiOrNo2 = this.state.callApiOrNo2
            this.setState({ showPayOtp1: '' })
          } else {
            if (responseJson.data.payment_resp_msg == 'Invalid account number') {
              responseJson.data.showHideVerifyButtonForWallet = this.state.showHideVerifyButtonForWallet
              responseJson.data.showHideVerifyButton = false
              responseJson.data.showHideUpdate = true
              responseJson.data.inValidIfsc = false
              responseJson.data.showHideErrorMSg = false
              responseJson.data.showPayOtp1 = this.state.showPayOtp1
              responseJson.data.showPayOtp2 = ''
              responseJson.data.callApiOrNo1 = this.state.callApiOrNo1
              responseJson.data.callApiOrNo2 = this.state.callApiOrNo2
              this.props.setMechanicData(responseJson.data);
              this.setState({ showPayOtp2: '', showHideUpdate: true, inValidIfsc: false, showHideVerifyButtonForWallet: false, showHideErrorMSg: true, acNoError: strings('login.paymentScreen_acNoError') })
              return;
            }
            responseJson.data.showHideVerifyButtonForWallet = this.state.showHideVerifyButtonForWallet
            responseJson.data.showHideVerifyButton = false
            responseJson.data.showHideUpdate = true
            responseJson.data.inValidIfsc = false
            responseJson.data.showHideErrorMSg = false
            this.setState({ showHideUpdate: true, inValidIfsc: false, showHideVerifyButtonForWallet: false, showHideErrorMSg: false })
          }
          this.props.setMechanicData(responseJson.data);
        } else if (responseJson.status == 500) {
          alert(responseJson.message);
        } else if (responseJson.status == 403) {
          alert(responseJson.message);
        }
      })
      .catch(async (error) => {
        await isMaintenance({navigation : this.props.navigation});
        this.setState({ loading: false })
        console.log(error);
      });
  }
  render() {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? "black" : '#F8F8F8' }} keyboardShouldPersistTaps="always">
        {this._showHeader()}
        <Loader loading={this.state.loading} text={this.state.loaderText} />
        <Grid style={{ marginTop: 20, margin: 20, flex: 0.07 }}>
          <Col >
            <CircleCheckBox
              checked={this.state.paymentWallet}
              // onToggle={(checked) => this.props.showHideVerifyButtonForWallet ? this.setState({ paymentWallet: checked ? true : true, bankTransfer: false, }) : this.paymentApi("Paytm Wallet")}
              // this.setState({ paymentWallet: checked ? true : true, bankTransfer: false, })
              onToggle={(checked) => this.setState({ paymentWallet: checked ? true : true, bankTransfer: false, }, () => {
                if (this.props.showHideVerifyForWallet == '1' && this.props.counter < 1) {
                  this.props.setCounterValue(1)
                  this.paymentApi("Paytm Wallet")
                }
              })}
              labelPosition={LABEL_POSITION.RIGHT}
              label={strings('login.paymentOptions_screen_waller')}
              styleLabel={{ fontWeight: 'bold', fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }}
              outerSize={30}
              outerColor="#66ffff"
              innerColor="#b3ffff"
            />
          </Col>
          <Col>
            <CircleCheckBox
              checked={this.state.bankTransfer}
              // onToggle={(checked) => this.setState({ bankTransfer: checked ? true : true, paymentWallet: false, })}
              onToggle={(checked) => this.setState({ bankTransfer: checked ? true : true, paymentWallet: false, }, () => {
                // if (this.props.showPayOtp2 == '2' && !this.props.callApiOrNo2) {
                if (this.props.showHideVerifyForBank == '1' && this.props.counter1 < 1) {
                  this.props.setCounter1Value(1)
                  this.paymentApi("Bank Transfer")
                }
              })}

              labelPosition={LABEL_POSITION.RIGHT}
              label={strings('login.paymentOptions_screen_bank')}
              styleLabel={{ fontWeight: 'bold', fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }}
              outerSize={30}
              outerColor="#66ffff"
              innerColor="#b3ffff"
            />
          </Col>
        </Grid>
        <Card style={this.state.paymentWallet ? { marginLeft: 10, marginRight: 10, marginTop: 0, backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white' } : { marginTop: 0, marginLeft: 10, marginRight: 10, backgroundColor: this.props.enableDarkTheme ? 'black' : 'white' }}>
          {this.state.paymentWallet ?
            <View>
              {!!this.state.phoneNoError ?
                <View style={{ marginTop: 15, marginLeft: 10 }}>
                  <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>Paytm Registered Mobile No<Text style={{ color: 'red' }}>*</Text> :</Label>
                  <TextInput
                    value={this.state.phoneNo}
                    placeholder="Enter Mobile No"
                    style={{ height: 40, borderColor: 'red', borderWidth: 1, marginTop: 10, marginRight: 20, width: '95%', marginLeft: 0, color: this.props.enableDarkTheme ? 'white' : 'black' }}
                    maxLength={10}
                    keyboardType="phone-pad"
                    onChangeText={(phoneNo) => this.recuriterDataChange(phoneNo)}
                  />
                  <View style={{ justifyContent: 'center' }}>
                    <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 18, color: 'red', marginTop: 5, marginLeft: 15, marginRight: 15 }}>
                      {' '}<Text style={styles.errorMsg}>{this.state.phoneNoError}</Text>
                    </Icon>
                  </View>
                </View>
                :
                <View style={{ marginTop: 15, marginLeft: 10 }}>
                  <Grid>
                    <Col size={10}>
                      <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.paymentOptions_screen_registered_mobileNo')}<Text style={{ color: 'red' }}>*</Text> :</Label>
                      <TextInput
                        value={this.state.phoneNo}
                        editable={this.state.showHideUpdateForPhoneNo}
                        placeholder={strings('login.paymentOptions_screen_placeholder_mobileno')}
                        style={{ height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 0.8, marginTop: 10, marginRight: 20, width: '95%', marginLeft: 0, paddingLeft: 10, fontSize: 17, color: this.props.enableDarkTheme ? 'white' : 'black' }}
                        maxLength={10}
                        onChangeText={(phoneNo) => this.recuriterDataChange(phoneNo)}
                        keyboardType="phone-pad"
                      />
                    </Col>
                    {this.props.showHideVerifyButtonForWallet ?
                      <Col size={2}>
                        <Icon name="check-circle-o" type="FontAwesome" style={{ fontSize: 30, color: 'green', textAlign: 'center' }} />
                        <Text style={{ color: 'green' }}>{strings('login.paymentOptions_screen_verifiedLogo')}</Text>
                      </Col>
                      : <View />}
                  </Grid>
                </View>
              }
              <View>
                <Grid>
                  <Row>
                    {!this.state.showHideUpdateForPhoneNo ?
                      <Col>
                        <TouchableOpacity onPress={() => this.setState({ showHideUpdateForPhoneNo: true })} style={{ alignItems: 'center', marginTop: 30 }}>
                          <View style={styles.buttonSignUp}>
                            <Text style={styles.buttonTextSignUp}>{strings('login.Edit_button')}</Text>
                          </View>
                        </TouchableOpacity>
                      </Col>
                      :
                      <Col>
                        <TouchableOpacity onPress={() => this._onPressButton('Wallet')} style={{ alignItems: 'center', marginTop: 30 }}>
                          <View style={styles.buttonSignUp}>
                            <Text style={styles.buttonTextSignUp}>{strings('login.paymentOptions_screen_saveButton')}</Text>
                          </View>
                        </TouchableOpacity>
                      </Col>
                    }
                  </Row>
                </Grid>
              </View>
            </View>
            :
            <View style={{ backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white' }}>
              <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10, }}>
                {!!this.state.beneficiaryNameError ?
                  <View style={{ marginTop: 15 }}>
                    <Label style={{ color: this.props.enableDarkTheme ? 'black' : 'white' }}>{strings('login.paymentOptions_screen_beneficiaryName')}<Text style={{ color: 'red' }}>*</Text> :</Label>
                    <TextInput
                      value={this.state.beneficiaryName}
                      placeholder={strings('login.paymentOptions_screen_beneficiaryName')}
                      style={this.props.showHideVerifyForBank == '1' ? { height: 40, borderColor: 'red', borderWidth: 1, marginTop: 10, width: '80%' } : { height: 40, borderColor: 'red', borderWidth: 1, marginTop: 10, width: '100%' }}
                      maxLength={30}
                      onChangeText={(beneficiaryName) => this.setState({ beneficiaryName: beneficiaryName, beneficiaryNameError: '' })}
                    />
                    <View style={{ justifyContent: 'center' }}>
                      <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 18, color: 'red', marginTop: 5 }}>
                        {' '}<Text style={styles.errorMsg}>{this.state.beneficiaryNameError}</Text>
                      </Icon>
                    </View>
                  </View>
                  :
                  <View>
                    <Grid>
                      <Col size={10}>
                        <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.paymentOptions_screen_beneficiaryName')}<Text style={{ color: 'red' }}>*</Text> :</Label>
                        <TextInput
                          value={this.state.beneficiaryName}
                          editable={this.state.showHideUpdate}
                          placeholder={strings('login.paymentOptions_screen_beneficiaryName')}
                          style={this.props.showHideVerifyForBank == '1' ? { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 0.8, marginTop: 10, width: '95%', fontSize: 17, color: this.props.enableDarkTheme ? 'white' : 'black' } : { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 1, marginTop: 10, width: '100%', fontSize: 17, color: this.props.enableDarkTheme ? 'white' : 'black' }}
                          maxLength={30}
                          onChangeText={(beneficiaryName) => this.setState({ beneficiaryName: beneficiaryName })}
                        />
                      </Col>
                      {this.props.showHideVerifyButton ?
                        <Col size={2}>
                          <Icon name="check-circle-o" type="FontAwesome" style={{ fontSize: 30, color: 'green', textAlign: 'center' }} />
                          <Text style={{ color: 'green', textAlign: 'center' }}>{strings('login.paymentOptions_screen_verifiedLogo')}</Text>
                        </Col>
                        : <View />}
                    </Grid>
                  </View>
                }

                {!!this.state.acNoError ?
                  <View style={{ marginTop: 15 }}>
                    <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.paymentOptions_screen_acNo')}<Text style={{ color: 'red' }}>*</Text> :</Label>
                    <TextInput
                      value={this.state.acNo}
                      placeholder={strings('login.paymentOptions_screen_acNo')}
                      style={this.props.showHideVerifyForBank == '1' ? { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'red', color: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 1, marginTop: 10, width: '80%' } : { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'red', color: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 1, marginTop: 10, width: '100%' }}
                      maxLength={20}
                      keyboardType="phone-pad"
                      onChangeText={(acNo) => this.setState({ acNo: acNo, acNoError: '' })}
                    />
                    <View style={{ justifyContent: 'center' }}>
                      <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 18, color: 'red', marginTop: 5 }}>
                        {' '}<Text style={styles.errorMsg}>{this.state.acNoError}</Text>
                      </Icon>
                    </View>
                  </View>
                  :
                  <View style={{ marginTop: 15 }}>
                    <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.paymentOptions_screen_acNo')}<Text style={{ color: 'red' }}>*</Text> :</Label>
                    <TextInput
                      value={this.state.acNo}
                      placeholder={strings('login.paymentOptions_screen_acNo')}
                      style={this.props.showHideVerifyForBank == '1' ? { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'black', color: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 0.8, marginTop: 10, width: '80%', fontSize: 17 } : { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'black', color: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 1, marginTop: 10, width: '100%', fontSize: 17 }}
                      maxLength={20}
                      editable={this.state.showHideUpdate}
                      onChangeText={(acNo) => this.setState({ acNo: acNo })}
                      keyboardType="phone-pad"
                    />
                  </View>
                }

                {!!this.state.ifscCodeError ?
                  <View style={{ marginTop: 15 }}>
                    <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.paymentOptions_screen_ifsc_code')}<Text style={{ color: 'red' }}>*</Text> :</Label>
                    <TextInput
                      value={this.state.ifscCode}
                      placeholder={strings('login.paymentOptions_screen_ifsc_code')}
                      // style={{ height: 40, borderColor: 'red', borderWidth: 1, marginTop: 10, width: '80%' }}
                      style={this.props.showHideVerifyForBank == '1' ? { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'red', color: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 1, marginTop: 10, width: '80%' } : { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'red', color: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 1, marginTop: 10, width: '100%' }}
                      maxLength={11}
                      onChangeText={(ifscCode) => this.setState({ ifscCode: ifscCode, ifscCodeError: '' })}
                    />
                    <View style={{ justifyContent: 'center' }}>
                      <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 18, color: 'red', marginTop: 5 }}>
                        {' '}<Text style={styles.errorMsg}>{this.state.ifscCodeError}</Text>
                      </Icon>
                    </View>
                  </View>
                  :
                  <View style={{ marginTop: 15 }}>
                    <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.paymentOptions_screen_ifsc_code')}<Text style={{ color: 'red' }}>*</Text> :</Label>
                    <TextInput
                      value={this.state.ifscCode}
                      placeholder={strings('login.paymentOptions_screen_ifsc_code')}
                      // style={{ height: 40, borderColor: 'black', borderWidth: 0.8, marginTop: 10, width: '80%' }}
                      style={this.props.showHideVerifyForBank == '1' ? { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'black', color: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 0.8, marginTop: 10, width: '80%', fontSize: 17 } : { height: 40, borderColor: this.props.enableDarkTheme ? 'white' : 'black', color: this.props.enableDarkTheme ? 'white' : 'black', borderWidth: 1, marginTop: 10, width: '100%', fontSize: 17 }}
                      maxLength={11}
                      editable={this.state.showHideUpdate}
                      onChangeText={(ifscCode) => this.setState({ ifscCode: ifscCode })}
                    />
                  </View>
                }
                <Grid>
                  <Row>
                    {!this.state.showHideUpdate ?
                      <Col>
                        <TouchableOpacity onPress={() => this.setState({ disableFields: true, showHideUpdate: true })} style={{ alignItems: 'center', marginTop: 30 }}>
                          <View style={styles.buttonSignUp}>
                            <Text style={styles.buttonTextSignUp}>{strings('login.Edit_button')}</Text>
                          </View>
                        </TouchableOpacity>
                      </Col>
                      :
                      <Col>
                        <TouchableOpacity onPress={() => this._onPressButton('Bank')} style={{ alignItems: 'center', marginTop: 30 }}>
                          <View style={styles.buttonSignUp}>
                            <Text style={styles.buttonTextSignUp}>{strings('login.paymentOptions_screen_saveButton')}</Text>
                          </View>
                        </TouchableOpacity>
                      </Col>
                    }
                  </Row>
                </Grid>
                {!this.props.showHideVerifyButton && !this.props.inValidIfsc && this.props.beneficiaryName && this.props.showHideErrorMSg ?
                  <View style={{ marginTop: 20 }}>
                    <Text style={{ color: 'red', textAlign: 'center' }}>We are verifying the bank account details. Kindly click on refresh to obtain the latest status.{'  '}
                    </Text>
                    <View>
                      <TouchableOpacity style={{ marginTop: 10, marginLeft: this.state.width / 3, marginRight: this.state.width / 3 }} onPress={() => this.paymentApi("Bank Transfer")}>
                        <Icon type="FontAwesome" name="refresh" style={{ fontSize: 30, color: '#00ff00', textAlign: 'center' }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  : <View />}
              </View>
            </View>
          }
          <Text></Text>
        </Card>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  buttonSignUp: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#94302C',
    borderRadius: 5,
    width: 90,
  },
  buttonTextSignUp: {
    padding: 10,
    color: '#fcb52f',
  },
  errorMsg: {
    fontSize: 12,
    color: 'red',
  },
})
const mapStateToProps = (state) => {
  console.log(state.VerifierReducer);

  return {
    mechanicID: state.VerifierReducer.mechanicData.id,
    phoneNo: state.VerifierReducer.mechanicData.paytm_reg_no,
    showHideVerifyForWallet: state.VerifierReducer.mechanicData.is_valid_payment_data_mobile,
    pymOpn: state.VerifierReducer.mechanicData.payment_option,
    showHideVerifyForBank: state.VerifierReducer.mechanicData.is_valid_payment_data_bank,
    beneficiaryName: state.VerifierReducer.mechanicData.beneficiary_name,
    acNo: state.VerifierReducer.mechanicData.account_no,
    ifscCode: state.VerifierReducer.mechanicData.ifsc_code,
    disableFieldsForBank: state.VerifierReducer.mechanicData.disableFields,

    showHideVerifyButton: state.VerifierReducer.mechanicData.showHideVerifyButton,
    showHideUpdate: state.VerifierReducer.mechanicData.showHideUpdate,
    inValidIfsc: state.VerifierReducer.mechanicData.inValidIfsc,
    showHideVerifyButtonForWallet: state.VerifierReducer.mechanicData.showHideVerifyButtonForWallet,
    showHideErrorMSg: state.VerifierReducer.mechanicData.showHideErrorMSg,
    showPayOtp1: state.VerifierReducer.mechanicData.showPayOtp1,
    showPayOtp2: state.VerifierReducer.mechanicData.showPayOtp2,
    callApiOrNo1: state.VerifierReducer.mechanicData.callApiOrNo1,
    callApiOrNo2: state.VerifierReducer.mechanicData.callApiOrNo2,
    counter: state.VerifierReducer.testCounter,
    counter1: state.VerifierReducer.testCounter1,
    enableDarkTheme: state.VerifierReducer.enableDarkTheme,
    languageControl: state.VerifierReducer.languageEnglish,
    fingerPrintEnable: state.VerifierReducer.enableFingerPrint
  }
}
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setMechanicData: setMechanicData,
    setCounterValue: setCounterValue,
    setCounter1Value: setCounter1Value
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PaymentDetailsScreen)