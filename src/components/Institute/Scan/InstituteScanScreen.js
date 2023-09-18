import React, {Component} from 'react';
import {  Alert,  BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AsyncStorage from '@react-native-community/async-storage';
import AndroidOpenSettings from 'react-native-android-open-settings';
import InstituteService from '../../../services/InstituteService/InstituteService';
// import Torch from 'react-native-torch';
import CustomHeader from '../../../Utility/CustomHeader';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';

export default class InstituteScanScreen extends React.Component{

	constructor(props) {
	  super(props);
	
	  this.state = {
	  	isConnected: true,
	  	userId: '',
	  	userName: '',
	  	flashEnabled: true,
	  	flash: false,
	  	loading: false,
	  	showCamera: true,
  		loaderText: 'Scanning...',
	  };
	}

	componentWillMount() {
		this.setState({isConnected: app.ISNETCONNECTED});
		this._getAsyncData();
	}

	componentDidMount() {
		this.didFocusSubscription = this.props.navigation.addListener(
      		'didFocus',
        	payload => {
          		this.setState({showCamera: true});
          		// this.scanSuccess = true;
        	}
      	);
    	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    	this._showNetErrMsg();
  	}

  	componentWillUnmount() {
    	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    	this.didFocusSubscription.remove();
  	}

  	handleBackPress = () => {
  		this.props.navigation.navigate('InstituteMainScreen');
    	return true;
  	}

  	handleConnectivityChange = isConnected => {
	    if (isConnected) {
	      	this.setState({ isConnected });
	    } else {
	    	this.setState({ isConnected });
	      	this._showNetErrMsg();
	    }
  	};

  	_openSettings(){
  		if (Platform.OS == 'ios') {
  			Linking.canOpenURL('app-settings:').then(supported => {
		  		if (!supported) {
			    	console.log('Can\'t handle settings url');
			  	} else {
			    	return Linking.openURL('app-settings:');
			  	}
			}).catch(err => console.error('An error occurred', err));	
  		}else{
  			AndroidOpenSettings.generalSettings();
  		}
  	}

  	_showNetErrMsg(){
  		if (!this.state.isConnected || !app.ISNETCONNECTED) {
			Alert.alert(
				'No network available',
				'Connect to internet to scan SeQR. Without internet you can only scan non secured public QR codes.',
				[
					{ text: 'SETTINGS', onPress: () => { this._openSettings() } },
					{ text: 'BACK', onPress: () => {this.props.navigation.navigate('InstituteMainScreen')}},
					{ text: 'CONTINUE', onPress: () => {this.setState({ isConnected: false }) }},
				],
				{ cancelable: false }
			)
  		}
  	}

  	closeActivityIndicator() {
   		setTimeout(() => {
    		this.setState({loading: false});
   		});
 	}
 	
  	async _getAsyncData(){
 		await AsyncStorage.getItem('USERDATA',(err,result)=>{		// USERDATA is set on SignUP screen
  			var lData = JSON.parse(result);
  			console.log(result);
  			if (lData) {
  				this.setState({ userName: lData.institute_username, userId: lData.id });
  			}
  		});
 	}

  	onSuccess(e) {
  		this.setState({showCamera:false});
  		if (this.state.isConnected || app.ISNETCONNECTED) {
     		this._callForAPI(e);
  		}else{
  			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
  		}
  	}

  	async _callForAPI(e){
		const formData = new FormData();
		let lUserName = this.state.userName;
		let lUserId = this.state.userId;
		formData.append('key', e.data);
		formData.append('device_type', Platform.OS);
		formData.append('scanned_by', lUserName);
		console.log(formData);

		var instituteApiObj = new InstituteService();

		this.setState({loading: true});
		await instituteApiObj.instituteScanViewCertificate(formData);
		var lResponseData = instituteApiObj.getRespData();
		 ;
		await this.closeActivityIndicator();
		// console.log(lResponseData);

		if(!lResponseData){
			utilities.showToastMsg('Something went wrong. Please try again later');
		}else if(lResponseData.status == '1' ){
			try {
			    await AsyncStorage.setItem('CERTIFICATESCANNEDDATA',JSON.stringify(lResponseData));
			    this.props.navigation.navigate('InstituteCertificateViewScreen');
		   	} catch (error) {
			    console.warn(error);
			}			
		}else if(lResponseData.status == '0'){
			try {
			    await AsyncStorage.setItem('CERTIFICATESCANNEDDATA',JSON.stringify(lResponseData));
			    this.props.navigation.navigate('InstituteCertificateViewScreen');
		   	} catch (error) {
			    console.warn(error);
			}	
			await utilities.showToastMsg('QR code part of the system. But certificate is inactive now');
		}else if (lResponseData.status == '2') {
			setTimeout(() => {
				Alert.alert(
					'Scanning Error',
					'Please scan proper QR Code',
					[
						{ text: 'OK', onPress: () => {this.props.navigation.navigate('InstituteMainScreen')}},
					],
					{ cancelable: false }
				)
			},500); 
		}
		else{
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

  	_openFlash(){
  		if (this.state.flashEnabled) {
  			Torch.switchState(true);
  			this.setState({ flashEnabled: false });
  		}else{
  			Torch.switchState(false);
  			this.setState({ flashEnabled: true });
  		}

  	}

	_showHeader(){
		if(Platform.OS == 'ios'){
			return(
				<Header style={{backgroundColor: '#D34A44'}}>
					<Left style={{ flex: 0.1}}> 
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('InstituteMainScreen')}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
		  			<Body style={{ flex: 0.9}}> 
		  				<Title style={{ color: '#FFFFFF'}}>Sec Doc SeQR</Title>
		  			</Body>
				</Header>
			)
		} else {
			return(
				<Header style={{backgroundColor: '#D34A44'}}>
					<Left style={{ flex: 0.1}}>
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('InstituteMainScreen')}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9, alignItems: 'center'}}>
						<Title style={{ color: '#FFFFFF', fontSize: 16}}>Sec Doc SeQR</Title>
					</Body>
				</Header>
			)
		}
	}

	_displayFlashIcon(){
		if (Platform.OS == 'ios') {
			if (this.state.flash) {
				return(
					<TouchableOpacity onPress={()=>{ this._openFlash(); this.setState({ flash: false }); }} style={{ position: 'absolute',bottom: 50, left: Dimensions.get('window').width* 0.8, zIndex: 1 }}>
						<Image 
							style={{ width: 30, height: 30 }}
							source={require('../../../images/flash_on.png' )}
						/>
					</TouchableOpacity>
				)
			}else {
				return(
					<TouchableOpacity onPress={()=>{ this._openFlash(); this.setState({ flash: true }); }} style={{ position: 'absolute',bottom: 50, left: Dimensions.get('window').width* 0.8, zIndex: 1 }}>
						<Image 
							style={{ width: 30, height: 30 }}
							source={require('../../../images/flash_off.png' )}
						/>
					</TouchableOpacity>
				)
			}
		}else {
			return(null);
		}
	}

	render(){
		return(
			<View style={styles.container}>
				
				{ Platform.OS == 'ios' ?
					<CustomHeader prop={this.props} bodyTitle={'Sec Doc SeQR'} navigateTo='InstituteMainScreen' headerStyle={{backgroundColor: '#D34A44'}}/>
				:
					<CustomHeader prop={this.props} bodyTitle={'Sec Doc SeQR'} navigateTo='InstituteMainScreen' headerStyle={{backgroundColor: '#D34A44'}} bodyStyle={{ alignItems: 'center'}}/>
				}
				<StatusBar
					backgroundColor="#D34A44"
			    	barStyle="light-content"
   				/>

   				<Loader
   					loading={this.state.loading}
   					text={this.state.loaderText}
				/>

				{ this.state.showCamera ?
   					<QRCodeScanner
	        			onRead={this.onSuccess.bind(this)}
			        	cameraStyle={{width:'100%',height:'100%'}}
			        	showMarker={true}
      				/>
   				:
   					<View></View>
   				}
				
      			<View>
      				<Text style={{position: 'absolute',bottom: 50, left: Dimensions.get('window').width* 0.1, zIndex: 1, color:'#FFFFFF'}}>Point the camera at QR code.</Text>
      				
				</View>
			</View>
	)}
}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
 	},
 	
 })

 // { this._displayFlashIcon() }