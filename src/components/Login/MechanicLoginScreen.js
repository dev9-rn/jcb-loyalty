import React, { Component } from 'react';
import { StatusBar, Button, Alert, BackHandler, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity } from 'react-native';
import { Header, Left, Body, Content, Card, CardItem, Text, Title, Icon } from 'native-base';
;
import LinearGradient from 'react-native-linear-gradient';
import Modal from "react-native-modal";
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setMechanicData } from '../../Redux/Actions/VerifierActions';
import { strings } from '../../locales/i18n';
// import { ScrollView } from 'react-native-gesture-handler';
import * as utilities from "../../Utility/utilities";
import AsyncStorage from '@react-native-community/async-storage';
import { ScrollView } from 'react-native';
import { isMaintenance } from '../../services/MaintenanceService/MaintenanceService';

class MechanicLoginScreen extends Component {

    constructor(props) {
        super(props);

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

    async getUserData() {
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

    async callForAPI() {
        let lMobileNumber = this.state.mobileNumber;
        const formData = new FormData();
        formData.append('mobileNo', lMobileNumber);

        console.log(formData);

        var lUrl = URL + 'loginMechanic';
        fetch(lUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application\/json',
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(JSON.stringify(responseJson));
                if (responseJson.status == 200) {
                    this.props.navigation.navigate('MechanicOtpVerification', { mobileNumber: lMobileNumber })
                } else if (responseJson.status == 409) {
                    alert(responseJson.message);
                } else if (responseJson.status == 422) {
                    alert(responseJson.message)
                } else if (responseJson.status == 451) {
                    alert(responseJson.message)
                } else if (responseJson.status == 400) {
                    alert(responseJson.message)
                } else if (responseJson.status == 403) {
                    alert(responseJson.message);
                    this.props.navigation.navigate('LoginScreen');
                    AsyncStorage.clear();
                    return;
                }
            })
            .catch(async (error) => {
                await isMaintenance({navigation : this.props.navigation});
                console.error(error);
            });
        this.setState({ mobileNumber: '' })
    }

    _validateMobileNumber() {
        console.log("inside");
        let lMobileNumber = this.state.mobileNumber;
        let res = '';
        
        res = utilities.checkMobileNumber(lMobileNumber);
        if (!res || lMobileNumber.trim().length < 10) {
          this.setState({ phoneNumberError: "This mobile number appears to be invalid." });
        }
        return res;
      }

    async _onPressButton() {
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

    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#fab032' }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.9 }}>
                        <Title style={{ color: '#FFFFFF' }}>SeQR Loyalty Demo</Title>
                    </Body>
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: '#fab032' }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.9, alignItems: 'center' }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16 }}>SeQR Loyalty Demo</Title>
                    </Body>

                </Header>
            )
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
                        this.toggleModal();
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
    render() {
        return (
            <ScrollView keyboardShouldPersistTaps="always" style={styles.container}>
                <View style={styles.containerLevel1}>
                    <View style={{ marginTop: 30 }}>
                        <Image
                            style={{ width: 300, height: 300 }}
                            resizeMode='contain'
                            source={require('../../images/SeQRLoyalty.jpg')}
                        />
                    </View>
                </View>
                <View style={styles.loginViewContainer}>
                    <ScrollView keyboardShouldPersistTaps="always">
                        <Card style={styles.cardContainer}>

                            <CardItem header style={styles.cardHeader}>
                                <Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>{strings('login.MechanicLogin')}</Text>
                            </CardItem>

                            <View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
                                <View style={styles.inputContainer}>

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
                                                    <TouchableOpacity onPress={(isModalVisible) => this.setState({ isModalVisible: false })}>
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
                                                        maxLength={10}
                                                        placeholder='Brand Code'
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
                                                        <Button title="Submit" disabled={this.state.brandCode ? false : true} onPress={this.verifyBrandID} />
                                                    </View>
                                                </View>
                                            </Card>
                                        </View>
                                    </Modal>
                                    <View>
                                        <TouchableOpacity style={{ marginTop: 15, paddingLeft: 10 }} >
                                            {/* <Text style={{ color: '#fab032', fontSize: 12}}>Click here to sign up</Text> onPress={() => this.props.navigation.navigate('MechanicSignupForm')} */}
                                            <Text style={{ color: '#fab032', fontSize: 12 }} onPress={() => this.props.navigation.navigate('MechanicSignupForm')}>{strings('login.clickHereToSignUp')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Content>
                            </View>
                        </Card>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('LoginScreen')} style={{ alignItems: 'center' }}>
                            <View style={styles.buttonLogin1}>
                                <LinearGradient colors={['#fab032', '#fab032', '#fab032']} style={styles.linearGradient}>
                                    <Text style={styles.buttonText}>
                                        {strings('login.clickForDistributor')}
                                    </Text>
                                </LinearGradient>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </ScrollView>
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
        color: '#000000'
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
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
})
const mapStateToProps = (state) => {
    return {
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ setMechanicData: setMechanicData }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(MechanicLoginScreen)