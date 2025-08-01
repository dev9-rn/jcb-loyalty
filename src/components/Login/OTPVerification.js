import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Label, Icon } from 'native-base';

import CodeInput from 'react-native-confirmation-code-input';
import LoginService from '../../services/LoginService/LoginService';
import * as app from '../../App';
import { Col, Row, Grid } from "react-native-easy-grid";
import { strings } from '../../locales/i18n';
import { setLoginData } from '../../Redux/Actions/InstituteActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as utilities from "../../Utility/utilities";
import AsyncStorage from '@react-native-community/async-storage';


var interval;
var time;
class OTPVerification extends React.Component {

	constructor(props) {
		console.log("otp verification");
		super(props);
		this.mobileNo = this.props.navigation.state.params.mobileNumber;
		this.state = {
			OTP: '',
			time: '',
			otpCode: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loaderText: 'Verifying mobile number...',
			btnVerifyEnabled: false,
			btnResendOTPEnabled: false,
		};
	}
	
	componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); this.countdown(); }
	countdown() {
        if (!this.state.btnResendOTPEnabled) {
            var timer = '3:00';
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

                if (minutes == 0 && seconds == 0) {
                    this.setState({ btnResendOTPEnabled: true });
                    clearInterval(interval);
                }
            }, 1000);
        }
    }

	_onFinishCheckingCode1(code) {
		//  ;
		this.setState({ btnVerifyEnabled: true, otpCode: code });
	}

	async callForAPI() {
		let lOtp = this.state.otpCode;
		const formData = new FormData();
		formData.append('mobileNo', this.mobileNo);
		formData.append('otp', lOtp);
		formData.append('deviceToken', app.FCMTOKEN);
		formData.append('deviceType', Platform.OS);
		console.log("app.FCMTOKEN....", app.FCMTOKEN);


		var loginApiObj = new LoginService();
		await loginApiObj.verifyOtp(formData);

		var lResponseData = loginApiObj.getRespData();

		// await loginApiObj.getRespData().then((data) => { lResponseData = data });
		if (!lResponseData) {
			alert('Something went wrong. Please try again later');
			return true;
		} else if (lResponseData.status == 422) {
			Alert.alert(
				'Alert',
				lResponseData.message,
				[
					{ text: 'CANCEL', onPress: () => { } },
					{ text: 'LOGIN', onPress: () => this.props.navigation.navigate('LoginScreen'), style: 'cancel' },
				],
				{ cancelable: false }
			);
		}
		else if (lResponseData.status == 400  || lResponseData.status == 503 || lResponseData.status == 451) {
			alert(lResponseData.message);
			return;
		} else if (lResponseData.status == 403) {
			alert(lResponseData.message);
			// this.props.navigation.navigate('LoginScreen');
			// AsyncStorage.clear();
			return;
		}
		else if (lResponseData.status == 200) {
			// alert('Login successful');
			this.props.setLoginData(lResponseData.data)
			await AsyncStorage.setItem('USERDATA', JSON.stringify(lResponseData));
			console.log("userdata set.....................")
			app.ACCESSTOKEN = loginApiObj.getAccessToken();
			await AsyncStorage.setItem('ACCESSTOKEN', JSON.stringify({ ACCESSTOKEN: loginApiObj.getAccessToken() }));
			this.props.navigation.navigate('HomeScreen');
		} else {
			alert('Something went wrong. Please try again later');
		}
	}

	_onPressButton(action) {
		let lOTP = this.state.otpCode;
		if (lOTP == '') {
			alert('Enter OTP');
		}
		else if (lOTP) {
			this.callForAPI();
		} else {
			console.warn('Error');
		}
	}

	async _onPressResendOTP() {
		const formData = new FormData();
		formData.append('mobileNo', this.mobileNo);

		var loginApiObj = new LoginService();
		await loginApiObj.login(formData);
		var lResponseData = loginApiObj.getRespData();
		console.log(lResponseData);

		//this.closeActivityIndicator();

		if (!lResponseData) {
			alert('Something went wrong. Please try again later');
		} else if (lResponseData.status == 200) {
			alert('OTP resent successfully.');
			this.setState({ btnResendOTPEnabled: false });
			this.countdown();
		} else {
			alert('Something went wrong. Please try again later');
		}
	}

	_showBtnVerify() {
		if (this.state.btnVerifyEnabled) {
			return (
				<TouchableOpacity onPress={() => this._onPressButton()}>
					<View style={styles.buttonVerifier}>
						<Text style={styles.buttonText}>{strings('login.verify')}</Text>
					</View>
				</TouchableOpacity>
			);
		} else {
			return (
				<TouchableOpacity>
					<View style={styles.btnVerifyDisabled}>
						<Text style={styles.textVerifyDisabled}>{strings('login.verify')}</Text>
					</View>
				</TouchableOpacity>
			);
		}

	}

	_showBtnResendOTP() {
		if (this.state.btnResendOTPEnabled) {
			return (
				<TouchableOpacity onPress={() => this._onPressResendOTP()}>
					<View style={styles.btnResendOTP}>
						<Text style={styles.buttonText}>{strings('login.reSendTp')}</Text>
					</View>
				</TouchableOpacity>
			)
		} else {
			return (
				<TouchableOpacity>
					<View style={styles.btnResendOTPDisabled}>
						<Text style={styles.textResendOTPDisabled}>
							{strings('login.reSendTp')} :
						</Text>
						<Text style={{ marginLeft: 1, color:'white'}}>{this.state.time} </Text>
					</View>
				</TouchableOpacity>
			)
		}
	}
	backToLoginScreen = () => {
		Alert.alert(
			'Alert',
			'Are you sure you want to go back ?',
			[
				{ text: 'CANCEL', onPress: () => { } },
				{ text: 'YES', onPress: () => this.props.navigation.navigate('LoginScreen'), style: 'cancel' },
			],
			{ cancelable: false }
		);
		
	}
	render() {
		return (
			<View style={styles.container}>
				<Header style={{ backgroundColor: '#fab032' }}>
					<Grid>
						<Col size={1} style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={this.backToLoginScreen} >
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF' }} />
							</TouchableOpacity>
						</Col>
						<Col size={10} style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>{strings('login.SeQr')}</Title>
						</Col>
					</Grid>
				</Header>
				<View style={styles.OTPViewContainer}>
					<ScrollView keyboardShouldPersistTaps="always">
						<Card style={styles.cardContainer}>

							<CardItem header style={styles.cardHeader}>
								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>{strings('login.verifyMobileNo')}</Text>
							</CardItem>

							<View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
								<Text style={{ fontSize: 14, color: '#808080' }}>{strings('login.otpSent')}</Text>
								<View style={styles.inputContainer}>
									<CodeInput
										ref="codeInputRef2"
										keyboardType="number-pad"
										inactiveColor='white'
										autoFocus={false}
										ignoreCase={true}
										className='border-b-t'
										size={50}
										onFulfill={(code) => this._onFinishCheckingCode1(code)}
										containerStyle={{ marginTop: 10, marginBottom: 10, }}
										codeInputStyle={{ color: 'black', borderWidth: 1.5, borderBottomColor: 'black', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
										codeLength={4}
									/>

								</View>
							</View>

							<Content style={{ marginTop: 20 }}>
								{this._showBtnVerify()}

								<View style={{ marginTop: 20 }}>
									<Text style={{ fontSize: 12 }}>{strings('login.didntRec')}</Text>
								</View>

								{this._showBtnResendOTP()}
							</Content>

						</Card>
					</ScrollView>
				</View>
			</View>
		)
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	OTPViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: Dimensions.get('window').height * 0.05
	},
	cardContainer: {
		flex: 1,
		padding: 15,
		marginTop: 20,
		marginLeft: 30,
		marginRight: 30,
	},
	cardHeader: {
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0'
	},
	inputContainer: {
		marginTop: 30,
		height: 60,
		flexDirection: 'row',
		justifyContent: 'space-between',
		// backgroundColor: 'skyblue',
	},
	inputs: {
		height: 45,
		width: 50,
		marginLeft: 5,
		borderBottomWidth: 1,

	},
	buttonVerifier: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#fab032',
		borderRadius: 5
	},
	btnVerifyDisabled: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#D3D3D3',
		borderRadius: 5
	},
	btnResendOTP: {
		marginTop: 3,
		alignItems: 'center',
		backgroundColor: '#fab032',
		borderRadius: 5
	},
	buttonText: {
		padding: 10,
		color: 'white',
	},
	textVerifyDisabled: {
		padding: 10,
		color: 'white',
	},
	btnResendOTPDisabled: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 3,
		alignItems: 'center',
		backgroundColor: '#D3D3D3',
		borderRadius: 5
	},
	textResendOTPDisabled: {
		padding: 10,
		color: 'white',
	}

})
const mapStateToProps = (state) => {
	// console.log("wwe bro.......");
	// console.log(state);
	return {
	}
}
const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
		setLoginData: setLoginData
	}, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(OTPVerification)