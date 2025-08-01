import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {  Alert, StatusBar,  BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity, Linking, KeyboardAwareScrollView, ScrollView} from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
// import Torch from 'react-native-torch';
import VerifierService from '../../../services/VerifierService/VerifierService';
// import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import * as app from '../../../App';

export default class CertificateViewScreen extends React.Component{

	constructor(props) {
	  	super(props);
	  	this.state = {
	  		isConnected: true,
		  	userId: '',
		  	serialNo: '',
		  	certificateURI: '',
		  	animating: false,
		  	loading: false,
	  		loaderText: 'Please wait downloading file...',
	  	};
	}

	componentWillMount() {

		this.setState({isConnected: app.ISNETCONNECTED});
		this._getAsyncData();
	}

	componentDidMount() {
    	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    	this._showNetErrMsg();
  	}

  	componentWillUnmount() {
    	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  	}

  	handleBackPress = () => {
  		this.props.navigation.navigate('VerifierMainScreen');
    	return true;
  	}

  	handleConnectivityChange = isConnected => {
	    if (isConnected) {
	      	this.setState({ isConnected });
	    } else {
	    	this.setState({ isConnected });
	    	// this._showNetErrMsg();
	    }
  	};

  	_showNetErrMsg(){
  		if (!this.state.isConnected || !app.ISNETCONNECTED) {
  			Alert.alert(
				'No network available',
				'Connect to internet to scan SeQR. Without internet you can only scan non secured public QR codes.',
				[
					// { text: 'SETTINGS', onPress: () => {} },
					{ text: 'BACK', onPress: () => {this.props.navigation.navigate('VerifierMainScreen')}},
					{ text: 'CONTINUE', onPress: () => {this.setState({ isConnected: false }) }},
				],
				{ cancelable: false }
			)
  		}
  	}

  	closeActivityIndicator() {
   		setTimeout(() => {
    		this.setState({animating: false, loading: false});
   		});
 	}

 	async _getAsyncData(){
 		await AsyncStorage.multiGet(['USERDATA','CERTIFICATESCANNEDDATA'],(err,result)=>{		// USERDATA is set on SignUP screen
  			 ;
  			var lUserData = JSON.parse(result[0][1]);

  			var lData = JSON.parse(result[1][1]);
  			console.log(result);
  			var lProps = this.props;
  			 ;
  			if (lProps.navigation.state.params) {
	  			if (lData) {
	  				this.setState({ serialNo: lProps.navigation.state.params.certificateData.serial_no, certificateURI: lProps.navigation.state.params.certificateData.certificate_filename, userId: lUserData.id });
	  			}
  			}else {
  				if (lData) {
	  				this.setState({ serialNo: lData.serial_no, certificateURI: lData.certificate_filename, userId: lUserData.id });
	  			}
  			}
  		});
 	}

	getLocalPath (url) {
		const filename = url.split('/').pop();
	  	return `${RNFS.DocumentDirectoryPath}/${filename}`;
	}

	async downloadFile(){
		// if(Platform.OS == 'ios'){
		// 	this.props.navigation.navigate('ViewCertificateIOS');
		// }else{

		if (!this.state.isConnected || !app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
		}else{

			this.setState({loading: true});
			const url = this.state.certificateURI;
			const localFile = this.getLocalPath(url);
			 
			const options = {
				fromUrl: url,
				toFile: localFile
			};
	
			RNFS.downloadFile(options).promise
			.then(async () => { 
    			this.setState({ loading: false});
				setTimeout(() => { FileViewer.open(localFile)},500);
			})
			.catch(error => {
				setTimeout(() => {
    				this.setState({animating: false, loading: false});
   				},2000);
			    
			    console.warn("Error in downloading file" + error);
			});
		}
	}

	_showHeader(){
		if(Platform.OS == 'ios'){
			return(
				<Header style={{backgroundColor: '#fab032'}}>
					<Left> 
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('VerifierMainScreen')}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
		  			<Body style={{ marginLeft: -50, width: '100%'}}>
		  				<Title style={{ color: '#FFFFFF' }}>Scanned details</Title>
		  			</Body>           			
		  			<Right>
		  				<TouchableOpacity onPress={()=> this.props.navigation.navigate('VerifierScanScreen')}> 
		  					<Title style={{ color: '#FFFFFF'}}>SCAN NEW</Title>
		  				</TouchableOpacity>
		  			</Right>
				</Header>
			)
		} else {
			return(
				<Header style={{backgroundColor: '#fab032'}}>
					<Left>
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('VerifierMainScreen')}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
					<Body>
						<Title style={{ color: '#FFFFFF', fontSize: 16}}>Scanned details</Title>
					</Body>            			
		  			<Right>
		  				<TouchableOpacity onPress={()=> this.props.navigation.navigate('VerifierScanScreen')}> 
		  					<Title style={{ color: '#FFFFFF', fontSize: 16}}>SCAN NEW</Title>
		  				</TouchableOpacity>
		  			</Right>
				</Header>
			)
		}
	}

	render(){
		const source = {uri: this.state.certificateURI, cache:true};
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

				<View style={styles.certificateViewContainer}>
   					<Card style={styles.cardContainer}>
            			<ScrollView keyboardShouldPersistTaps="handled">
            			<CardItem header style={ styles.cardHeader }>
              				<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 16 }}>Sr.no : { this.state.serialNo }</Text>
            			</CardItem>
            			<View style={{paddingTop: 10,height: Dimensions.get('window').height * 0.7 }}>
            				<View style={{flex: 0.1, flexDirection: 'row'}}>
            					<Text style={{ fontSize: 22, flex:0.9}}>Certificate</Text>
            					<TouchableOpacity style={{flex:0.1}} onPress={()=>{ this.downloadFile() }}>
									<Image 
			      						style={{ width: 30, height: 30 }}
			      						source={require('../../../images/forward_arrow.png' )}
			  						/>
								</TouchableOpacity>
            				</View>
            				
			                {/* <Pdf
			                    source={source}
			                    onLoadComplete={(numberOfPages,filePath)=>{
			                        console.log(`number of pages: ${numberOfPages}`);
			                    }}
			                    onPageChanged={(page,numberOfPages)=>{
			                        console.log(`current page: ${page}`);
			                    }}
			                    onError={(error)=>{
			                        console.log(error);
			                    }}
			                    style={styles.pdf}/> */}

						</View>
						</ScrollView>
					</Card>
				</View>
			</View>
		)}
	}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
 	},
 	certificateViewContainer: { 
 		flex: 1, 
 		flexDirection: 'column',
 		alignItems: 'stretch',
 		paddingTop: Dimensions.get('window').height * 0.01
 	},
 	cardContainer: { 
 		padding: 15, 
 		marginTop: 10,
 		marginLeft: 20, 
 		marginRight: 20 
 	},
 	cardHeader: { 
 		borderBottomWidth: 1, 
 		borderBottomColor: '#E0E0E0'
 	},
 	containerPDF: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 25,
    },
    pdf: {
        flex:1,
        // width:Dimensions.get('window').width,
    }
 });

