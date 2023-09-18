import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {  StatusBar,  BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Label, Toast } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CodeInput from 'react-native-confirmation-code-input';
import LoginService from '../../../services/LoginService/LoginService';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';

export default class OTPVerification extends React.Component{

	constructor(props) {
	  	super(props);
	
	  	this.state = {
	  		isConnected: true,
	  		OTP: '',
		  	time: '',
		  	otpCode: '',
		  	borderBottomColorPassword:'#757575',
		  	borderBottomColorUserName:'#757575',
		  	loading: false,
	  		loaderText: 'Verifying mobile number...',
	  		btnVerifyEnabled: false,
	  		btnResendOTPEnabled: false,
	  	};
	  	
	}

	componentWillMount(){
		this.setState({isConnected: app.ISNETCONNECTED});
		this._getAsyncData();
	}

	componentDidMount() {
    	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    	this._showNetErrMsg();
    	// NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    	this.countdown();
  	}

  	componentWillUnmount() {
    	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    	// NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    	clearInterval(interval);
  	}

  	handleBackPress = () => {
    	BackHandler.exitApp();
    	return true;
  	}

  	_showNetErrMsg(){
  		if ( !app.ISNETCONNECTED ) {
  			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
  		}
  	}

  	closeActivityIndicator() {
   		setTimeout(() => {
    		this.setState({animating: false, loading: false});
   		});
 	}

 	async _getAsyncData(){
 		await AsyncStorage.getItem('OTPDATA',(err,result)=>{		// OTPDATA is set on SignUP screen
  			//  ;
  			var lData = JSON.parse(result);
  			console.log(result);
  			if (lData) {
  				this.setState({ UID: lData.UID, asyncOTP: lData.otp, verificationMethod: lData.verification_method });
  			}
  		});
 	}

 	countdown() {
		var interval;
		var time;
		if (!this.state.btnResendOTPEnabled) {

	    	var timer = '3:00';
		    timer = timer.split(':');
		    var minutes = timer[0];
		    var seconds = timer[1];
		    interval = setInterval(()=> {
			    
			    seconds -= 1;
			    if (minutes < 0) return;
			    else if (seconds < 0 && minutes != 0) {
			        minutes -= 1;
			        seconds = 59;
			    }
			    else if (seconds < 10 && seconds.length != 2){
			    	seconds = '0' + seconds;
			    } 
			    time = minutes + ':' + seconds;
				this.setState({time: time});

	      		if (minutes == 0 && seconds == 0){
	      			this.setState({btnResendOTPEnabled: true});
	      			clearInterval(interval);	
	  			} 
  			}, 1000);
		}
	}

 	_onFinishCheckingCode1(code){
 		//  ;
 		this.setState({ btnVerifyEnabled: true, otpCode: code});
 		// console.log(code);

 	}

 	validateOTP(){
 		//  ;
		let lOTP = this.state.otpCode;
		let res = '';
		if (this.state.asyncOTP == lOTP) {
			res = true;
		}else{
			res = false;
		}
		return res;
	}

	async callForAPI(){
		//  ;
		let lUID = this.state.UID;
		let lAction = 'verifyOTP';
		let lOtp = this.state.otpCode;
		
		const formData = new FormData();
		formData.append('id', lUID);
		formData.append('OTP', lOtp);
		formData.append('action', lAction);
		
		var loginApiObj = new LoginService();

		this.setState({loading: true});
		await loginApiObj.registration(formData);
		var lResponseData = loginApiObj.getRespData();
		this.closeActivityIndicator();
		//  ;
		if(!lResponseData){
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
		else if(lResponseData.status == false){
			utilities.showToastMsg('Failed to verify. Please resend OTP and try again.');
		}else if(lResponseData.status == true){
			utilities.showToastMsg('Login as verifier successful');
			this.props.navigation.navigate('VerifierMainScreen');
		}else{
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

	_onPressButton(action){
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		}else{
			let lOTP = this.state.otpCode;
			var isValidOTP = '';
			if(lOTP == ''){
				utilities.showToastMsg('Enter OTP');
			}
			else if(lOTP){
				isValidOTP = this.validateOTP();
				if(isValidOTP){
					this.callForAPI(action);
				}else{
					utilities.showToastMsg('Verification failed! OTP mismatch');
				}
			}else{
				console.warn('Error');
			}
		}
	}

	async _onPressResendOTP(){
		//  ;
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		}else{
			let lUID = this.state.UID;
			let lAction = 'resendOTP';
			let lOtp = this.state.otpCode;
			
			const formData = new FormData();
			formData.append('id', '404');
			formData.append('action', lAction);
			
			var loginApiObj = new LoginService();

			this.setState({loading: true});
			await loginApiObj.registration(formData);
			var lResponseData = loginApiObj.getRespData();
			this.closeActivityIndicator();
			//  ;
			if(!lResponseData){
				utilities.showToastMsg('Something went wrong. Please try again later');
			}
			else if(lResponseData.status == false){
				utilities.showToastMsg('Number not found');
			}else if(lResponseData.status == true){
				utilities.showToastMsg('OTP resent successfully.');
			}else{
				utilities.showToastMsg('Something went wrong. Please try again later');
			}
		}	
	}

	_showBtnVerify(){
		if (this.state.btnVerifyEnabled) {
			return(
				<TouchableOpacity onPress={()=>this._onPressButton()}>
		      		<View style={styles.buttonVerifier}>
		    			<Text style={styles.buttonText}>VERIFY</Text>
		      		</View>
				</TouchableOpacity>
			);
		}else{
			return(
				<TouchableOpacity>
		      		<View style={styles.btnVerifyDisabled}>
		    			<Text style={styles.textVerifyDisabled}>VERIFY</Text>
		      		</View>
				</TouchableOpacity>
			);	
		}

	}

	_showBtnResendOTP(){
		if (this.state.btnResendOTPEnabled) {
			return(
				<TouchableOpacity onPress={()=>this._onPressResendOTP()}>
		  			<View style={styles.btnResendOTP}>
						<Text style={styles.buttonText}>RESEND OTP</Text>
		  			</View>
				</TouchableOpacity>
			)
		}else{
			return(
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

	render(){
		return(
			<View style={styles.container}>
				<Header style={{backgroundColor: '#0000FF'}}>
					<Left />
      				<Body style={{ marginLeft: -30 }}>
      					<Title style={{ color:'#FFFFFF', fontSize: 16 }}>Sec Doc SeQR</Title>
      				</Body>            			
          			<Right />
				</Header>
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
            			
            			<CardItem header style={ styles.cardHeader }>
              				<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Verify mobile number</Text>
            			</CardItem>

            			<View style={{ paddingLeft:0, paddingRight: 0,marginTop: 10}}>
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
						      	containerStyle={{ marginTop: 10, marginBottom: 10 , }}
						      	codeInputStyle={{ color: 'black', borderWidth: 1.5 , borderBottomColor: 'black', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent'}}
						    	codeLength={5}
						    	/>
								
							</View>
						</View>	
						
						<Content padder>
							{ this._showBtnVerify() }

			        		<View style={{ marginTop: 20 }}>
		        				<Text style={{ fontSize: 12}}>Didn't received OTP?</Text>			        			
		        			</View>

		        			{ this._showBtnResendOTP() }
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
  	inputs:{
      	height:45,
      	width: 50,
		marginLeft:5,
      	borderBottomWidth: 1,  	
      	
  	},
  	buttonVerifier: {
	    marginTop: 10,
	    alignItems: 'center',
	    backgroundColor: '#0000FF',
	    borderRadius: 5
  	},
  	btnVerifyDisabled:{
  		marginTop: 10,
	    alignItems: 'center',
	    backgroundColor: '#D3D3D3',
	    borderRadius: 5
  	},
  	btnResendOTP:{
  		marginTop: 3,
	    alignItems: 'center',
	    backgroundColor: '#0000FF',
	    borderRadius: 5
  	},
  	buttonText: {
    	padding: 10,
    	color: 'white',
  	},
  	textVerifyDisabled:{
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