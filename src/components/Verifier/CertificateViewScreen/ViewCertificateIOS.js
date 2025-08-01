import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Alert, StatusBar,  BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity, Linking, KeyboardAwareScrollView, ScrollView} from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Torch from 'react-native-torch';
import VerifierService from '../../../services/VerifierService/VerifierService';
// import Pdf from 'react-native-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';

export default class ViewCertificateIOS extends React.Component{

	constructor(props) {
	  	super(props);
	  	this.state = {
		  	userId: '',
		  	serialNo: '',
		  	certificateURI: '',
		  	loading: false,
	  		loaderText: 'Loading...',
	  	};
	}

	componentWillMount() {
		this._getAsyncData();

	}

	componentDidMount() {
    	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    	// this._checkForCameraPermission();
  	}

  	componentWillUnmount() {
    	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  	}

  	handleBackPress = () => {
  		this.props.navigation.navigate('VerifierMainScreen');
    	return true;
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
	  	// feel free to change main path according to your requirements
	  	return `${RNFS.DocumentDirectoryPath}/${filename}`;
	}

	downloadFile(){
		if(Platform.OS == 'ios'){
			this.props.navigation.navigate('ViewCertificateIOS');
		}else{
			 
			const url = this.state.certificateURI;
			const localFile = this.getLocalPath(url);
			 
			const options = {
				fromUrl: url,
				toFile: localFile
			};
			RNFS.downloadFile(options).promise
			.then(() => FileViewer.open(localFile))
			.then(() => {
			    Alert.alert("File saved successfully");
			})
			.catch(error => {
			    Alert.alert("Error in downloading file"); 
			});
		}
	}

	_showHeader(){
		if(Platform.OS == 'ios'){
			return(
				<Header style={{backgroundColor: '#fab032'}}>
					<Left> 
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('CertificateViewScreen')}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
		  			<Body style={{ marginLeft: -50, width: '100%'}}>
		  				<Title style={{ color: '#FFFFFF' }}>Scanned details</Title>
		  			</Body>           			
		  			<Right />
		  		
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

   				
    			<View style={{ height:'100%',paddingTop: 0,marginTop: 0}}>
    				
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

			</View>
		)}
	}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
 	},
    pdf: {
        flex:1,
        
        paddingTop: 0,
        marginTop: 0,
        marginLeft: 10
       	// width:Dimensions.get('window').width,
    }
 });

