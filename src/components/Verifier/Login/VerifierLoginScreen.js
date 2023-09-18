import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {  Alert, StatusBar,  BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Label, Toast, Icon } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LoginService from '../../../services/LoginService/LoginService';
import { LAT, LONG, LOC_ERROR } from '../../../Utility/GeoLocation';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';

export default class VerifierLoginScreen extends React.Component{

	constructor(props) {
	  	super(props);
	
	  	this.state = {
		  	isConnected: true,
		  	username:'',
		  	password:'',
		  	borderBottomColorPassword:'#757575',
		  	borderBottomColorUserName:'#757575',
		  	loading: false,
	  		loaderText: 'Logging in...',
	  	};
	  	console.log("LAT : " + LAT);
	}

	componentWillMount(){
		this.setState({isConnected: app.ISNETCONNECTED});
	}
	componentDidMount() {
    	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	    // NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  	}

  	componentWillUnmount() {
    	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    	// NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  	}

  	handleBackPress = () => {
    	this.props.navigation.navigate('HomeScreen');
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
    		this.setState({animating: false, loading: false});
   		});
 	}

 	validateUserName(){
		let lUserName = this.state.username;
		let res = utilities.checkSpecialChar(lUserName);
		return res;
	}

	async callForAPI(){
		let lUserName = this.state.username;
		let lPassword = this.state.password;
		let lDeviceType = Platform.OS;
		let lat = LAT; // this.state.latitude;
		let long = LONG; //this.state.longitude;
		console.log('lat : ' + LAT);
		const formData = new FormData();
		formData.append('username', lUserName);
		formData.append('password', lPassword);
		formData.append('device_type', lDeviceType);
		formData.append('lat', lat);
		formData.append('long', long);

		var loginApiObj = new LoginService();

		this.setState({loading: true});
		await loginApiObj.doLogin(formData);
		var lResponseData = await loginApiObj.getRespData();
		// await this.closeActivityIndicator();
		
		if(!lResponseData){
			this.closeActivityIndicator();
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
		else if(lResponseData.status == "false"){
			this.closeActivityIndicator();
			utilities.showToastMsg('Wrong login credentials! Please check and try again');
		}
		else if (lResponseData.is_verified == '0' && lResponseData.status == '0') {
			
			setTimeout(() => {
				Alert.alert(
					'Verify email id',
					'Verify email id and login again to SeQR scan',
				  	[
				    	{text: 'OK'},
				  	],
				  	{ cancelable: false }
				);
			})
		}
		else if(lResponseData.status == '1'){
			this.closeActivityIndicator();
			utilities.showToastMsg('Login as verifier successful');
			try {
			    await AsyncStorage.setItem('USERDATA',JSON.stringify(lResponseData));
			    this.props.navigation.navigate('VerifierMainScreen');
		   	} catch (error) {
			    console.log(error);
			}
		}else{
			this.closeActivityIndicator();
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

	async _onPressButton(){

		if (!this.state.isConnected || !app.ISNETCONNECTED) {
			// alert(app.ISNETCONNECTED);
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		}else{
			// alert(app.ISNETCONNECTED);
			let lUserName = this.state.username;
			let lPassword = this.state.password;
			var isValidUName = '';
			var isValidPassword = '';
			if(lUserName == ''){
				utilities.showToastMsg('Enter user name');
			}
			else if(lUserName == '' && lPassword == ''){
				utilities.showToastMsg('Enter user name');
			}else if(lPassword == ''){
				utilities.showToastMsg('Enter password');
			}else if(lUserName && lPassword){
				isValidUName = await this.validateUserName();
				if(isValidUName){
					this.callForAPI();
				}else{
					utilities.showToastMsg('Wrong login credentials! Please check and try again');
				}
			}else{
				alert('Server error');
			}
		}
	}

	_showOffline(){
		if (!app.ISNETCONNECTED) {
			return(
				<OfflineNotice />
			)	
		}
	}

	_showHeader(){
		if(Platform.OS == 'ios'){
			return(
				<Header style={{backgroundColor: '#0000FF'}}>
					<Left style={{ flex: 0.1 }}> 
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('HomeScreen')}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
		  			<Body style={{ flex: 0.9 }}> 
		  				<Title style={{ color: '#FFFFFF'}}>Sec Doc SeQR</Title>
		  			</Body>
				</Header>
			)
		} else {
			return(
				<Header style={{backgroundColor: '#0000FF'}}>
					<Left style={{ flex: 0.1}}>
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('HomeScreen')}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9, alignItems: 'center' }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16}}>Sec Doc SeQR</Title>
					</Body>	
		  			
				</Header>
			)
		}
	}

	render(){
		return(
			<View style={styles.container}>

				{ this._showHeader() }
				
				<StatusBar
			    	barStyle="light-content"
   				/>

				<Loader
   					loading={this.state.loading}
   					text={this.state.loaderText}
				/>
				<View style={{ flex: 0.9 }}>
      				<View style={ styles.containerLevel1 }>
      					<Text style={{ textAlign: 'center', fontSize: 20, fontFamily: 'Roboto' }}>
      						<Text style={{color: '#0000FF' }}>Nanda PetroChem</Text>
      						
      					</Text>
      					      				
      				</View>
      			</View>
        		<View style={styles.loginViewContainer}>
        			<KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
          			<Card style={styles.cardContainer}>
            			
            			<CardItem header style={ styles.cardHeader }>
              				<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Login</Text>
            			</CardItem>

            			<View style={{ paddingLeft:0, paddingRight: 0,marginTop: 10}}>
          					<View style={styles.inputContainer}>
          						
									<TextInput 
										style={{
											borderBottomColor: this.state.borderBottomColorUserName,
									      	...styles.inputs
								  		}}
					              		placeholder='Username'		              		
						              	
						              	onFocus = {()=>{this.setState({borderBottomColorUserName:'#50CAD0'}) }}
						              	onBlur={()=>{this.setState({borderBottomColorUserName:'#757575'}); }}
						              	onChangeText={(username) => this.setState({username})}/>
								
									<TextInput 
										style={{
											borderBottomColor: this.state.borderBottomColorPassword,
									      	...styles.inputs
								  		}}
					              		placeholder='Password'
						              	secureTextEntry={true}
						              	onFocus = {()=>{this.setState({borderBottomColorPassword:'#50CAD0'}) }}
										onBlur={()=>{ this.setState({borderBottomColorPassword:'#757575'});  }}
						              	onChangeText={(password) => this.setState({password})}/>
								
							</View>
						</View>	
						
						<View>
							<Content padder>
							<TouchableOpacity onPress={()=>this._onPressButton()}>
				          		<View style={styles.buttonVerifier}>
			            			<Text style={styles.buttonText}>LOGIN</Text>
				          		</View>
			        		</TouchableOpacity>
			        		
			        		<View>
			        			<TouchableOpacity style={{marginTop: 10, paddingLeft: 10 }}>
			        				<Text style={{ color: '#1784C7', fontSize: 12}} onPress={()=>this.props.navigation.navigate('SignUpScreen')}>Click here to sign up</Text>
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
 	loginViewContainer: { 
 		flex: 1, 
 		flexDirection: 'column',
 		alignItems: 'stretch',
 		paddingTop: Dimensions.get('window').height * 0.1
 	},
 	cardContainer: { 
 		padding: 15, 
 		marginTop: 40,
 		marginLeft: 30, 
 		marginRight: 30 
 	},
 	cardHeader: { 
 		borderBottomWidth: 1, 
 		borderBottomColor: '#E0E0E0'
 	},
	inputContainer: {
      	height:100,
      	marginBottom:15,
      	flexDirection: 'column',
      	justifyContent: 'space-between',
  	},
  	inputs:{
      	height:45,
		marginLeft:5,
      	borderBottomWidth: 1,  	
      	flex:1,
  	},
  	buttonVerifier: {
	    marginTop: 10,
	    alignItems: 'center',
	    backgroundColor: '#0000FF',
	    borderRadius: 5
  	},
  	buttonText: {
    	padding: 10,
    	color: 'white',
  	}
})

