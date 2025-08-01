import React, {Component} from 'react';
import {  BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity, StatusBar,Linking } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast  } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';

export default class AboutUs extends React.Component{

	constructor(props) {
  		super(props);
	
	  	this.state = {
	  		setNavigationScreen:'',
	  		backgroundColorHeader: ''
	  	};
	}

	componentWillMount() {
		this._getAsyncData();
	}
	componentDidMount() {
    	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  	}

	componentWillUnmount() {
    	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  	}

  	handleBackPress = () => {
    	this.props.navigation.navigate(this.state.setNavigationScreen);
    	return true;
  	}

  	async _getAsyncData(){
 		await AsyncStorage.getItem('USERDATA',(err,result)=>{		// USERDATA is set on SignUP screen
  			debugger;
  			var lData = JSON.parse(result);
  			console.log(result);
  			if (lData.user_type == '1') {
  				this.setState({ setNavigationScreen: 'VerifierMainScreen', backgroundColorHeader: '#fab032'});
  			}else if (lData.user_type == '2') {
  				this.setState({ setNavigationScreen: 'InstituteMainScreen', backgroundColorHeader: '#D34A44'});
  			}
  		});
 	}

 	_sendMail(){
 		Linking.openURL('mailto:software@scube.net.in?subject=Enquiry regarding SeQR scan.');
 	}
 	_openURL(){
 		Linking.openURL('http://scube.net.in');
 	}

	_showHeader(){
		if(Platform.OS == 'ios'){
			return(
				<Header style={{backgroundColor: this.state.backgroundColorHeader }}>
					<Left> 
						<TouchableOpacity onPress={()=> this.props.navigation.navigate(this.state.setNavigationScreen)}> 
						<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
		  			<Body> 
		  				<Title style={{ color: '#FFFFFF'}}>About us</Title>
		  			</Body>           			
		  			<Right />
				</Header>
			)
		} else {
			return(
				<Header style={{backgroundColor: this.state.backgroundColorHeader}}>
					<Left>
						<TouchableOpacity onPress={()=> this.props.navigation.navigate(this.state.setNavigationScreen)}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
					<Body>
						<Title style={{ color: '#FFFFFF'}}>About us</Title>
					</Body>            			
		  			<Right />
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

   				<Card style={{ padding: 10, marginTop: 20}}>
		            <CardItem>
		              	<Body>
		                	<Text>
		                   		S Cube offers a variety of ERP solutions for businesses including banks, e-libraries, document management systems, visa on arrival and land taxation systems etc.
		                	</Text>
	                   		
	                   		<Text>Feel free to contact us to get a qoute.</Text>

	                   		<TouchableOpacity onPress={()=> this._sendMail()}>
		                		<Text style={{ paddingTop: 20, color: 'blue' }}>software@scube.net.in</Text>
		                	</TouchableOpacity>
		                	<TouchableOpacity onPress={()=> this._openURL()}>
		                		<Text style={{ paddingTop: 20, color: 'blue' }}>http://scube.net.in</Text>
		              		</TouchableOpacity>
		              	</Body>
		            </CardItem>
				</Card>
			</View>
	)}
}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
 	},
 })