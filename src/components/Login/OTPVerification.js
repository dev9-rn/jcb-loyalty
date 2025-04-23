import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Label, Toast } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-community/async-storage';
import CodeInput from 'react-native-confirmation-code-input';
import LoginService from '../../services/LoginService/LoginService';
import OfflineNotice from '../../Utility/OfflineNotice';
import Loader from '../../Utility/Loader';
import * as utilities from '../../Utility/utilities';
import * as app from '../../App';

var interval;
export default class OTPVerification extends React.Component {

	constructor(props) {
		super(props);
		this.mobileNo = this.props.navigation.state.params.mobileNumber;
		// this.fcmToken;

		this.state = {
			OTP: '',
			time: '',
			otpCode: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Verifying mobile number...',
			btnVerifyEnabled: false,
			btnResendOTPEnabled: false,
		};

	}

	componentWillMount() {
		this._getAsyncData();
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this.countdown();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
		clearInterval(interval);
	}

	handleBackPress = () => {
		BackHandler.exitApp();
		return true;
	}

	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ animating: false, loading: false });
		});
	}

	async _getAsyncData() {
		await AsyncStorage.multiGet(['FCMTOKEN'], (err, result) => {		// FCMTOKEN is set on App.js
			var lData = JSON.parse(result[0][1]);
			if (lData) {
				// this.fcmToken = lData.fcmToken;
			}
		});
	}

	countdown() {

		var time;
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
		this.setState({ loading: true })
		let lOtp = this.state.otpCode;
		const formData = new FormData();
		formData.append('mobileNo', this.mobileNo);
		formData.append('otp', lOtp);
		formData.append('deviceToken', app.FCMTOKEN);
		formData.append('deviceType', Platform.OS);

		var loginApiObj = new LoginService();
		await loginApiObj.verifyOtp(formData);

		var lResponseData = loginApiObj.getRespData();
		// await loginApiObj.getRespData().then((data) => { lResponseData = data });
		if (!lResponseData) {
			this.setState({ loading: false })
			utilities.showToastMsg('Something went wrong. Please try again later');
			return true;
		} else if (lResponseData.status == 422) {
			this.setState({ loading: false })
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
		else if (lResponseData.status == 403 || lResponseData.status == 400 || lResponseData.status == 503 || lResponseData.status == 451) {
			this.setState({ loading: false })
			utilities.showToastMsg(lResponseData.message);
			return;
		} else if (lResponseData.status == 200) {
			this.setState({ loading: false })
			utilities.showToastMsg('Login successful');
			await AsyncStorage.setItem('USERDATA', JSON.stringify(lResponseData));
			app.ACCESSTOKEN = loginApiObj.getAccessToken();
			console.log("-=-=-=-=-=-=");

			console.log(app.ACCESSTOKEN);

			await AsyncStorage.setItem('ACCESSTOKEN', JSON.stringify({ ACCESSTOKEN: loginApiObj.getAccessToken() }));
			this.props.navigation.navigate('HomeScreen');
		} else {
			this.setState({ loading: false })
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

	_onPressButton(action) {
		let lOTP = this.state.otpCode;
		var isValidOTP = '';
		if (lOTP == '') {
			utilities.showToastMsg('Enter OTP');
		}
		else if (lOTP) {
			this.callForAPI();
		} else {
			console.warn('Error');
		}
	}

	async _onPressResendOTP() {
		this.setState({ loading: true })
		const formData = new FormData();
		formData.append('mobileNo', this.mobileNo);

		var loginApiObj = new LoginService();

		this.setState({ loading: true });
		await loginApiObj.login(formData);
		var lResponseData = loginApiObj.getRespData();
		this.closeActivityIndicator();

		if (!lResponseData) {
			this.setState({ loading: false })
			utilities.showToastMsg('Something went wrong. Please try again later');
		} else if (lResponseData.status == 200) {
			this.setState({ loading: false })
			utilities.showToastMsg('OTP resent successfully.');
			this.setState({ btnResendOTPEnabled: false });
			this.countdown();
		} else {
			this.setState({ loading: false })
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

	_showBtnVerify() {
		if (this.state.btnVerifyEnabled) {
			return (
				<TouchableOpacity onPress={() => this._onPressButton()}>
					<View style={styles.buttonVerifier}>
						<Text style={styles.buttonText}>VERIFY</Text>
					</View>
				</TouchableOpacity>
			);
		} else {
			return (
				<TouchableOpacity>
					<View style={styles.btnVerifyDisabled}>
						<Text style={styles.textVerifyDisabled}>VERIFY</Text>
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
						<Text style={styles.buttonText}>RESEND OTP</Text>
					</View>
				</TouchableOpacity>
			)
		} else {
			return (
				<TouchableOpacity>
					<View style={styles.btnResendOTPDisabled}>
						<Text style={styles.textResendOTPDisabled}>
							RESEND OTP in
						</Text>
						<Text style={{ marginLeft: 2, color: 'white' }}>{this.state.time} </Text>
					</View>
				</TouchableOpacity>
			)
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left />
					<Body style={{ marginLeft: -30 }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Hyundai</Title>
					</Body>
					<Right />
				</Header>
				<OfflineNotice />
				<StatusBar
					barStyle="light-content"
				/>

				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>

				<View style={styles.OTPViewContainer}>
					<KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
						<Card style={styles.cardContainer}>

							<CardItem header style={styles.cardHeader}>
								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Verify mobile number</Text>
							</CardItem>

							<View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
								<Text style={{ fontSize: 14, color: '#808080' }}>OTP has been sent to your mobile number, please enter it below.</Text>
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
									<Text style={{ fontSize: 12 }}>Didn't received OTP?</Text>
								</View>

								{this._showBtnResendOTP()}
							</Content>

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
		backgroundColor: '#0000FF',
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
		backgroundColor: '#0000FF',
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