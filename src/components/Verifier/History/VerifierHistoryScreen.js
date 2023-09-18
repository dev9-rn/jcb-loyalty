import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Alert,  BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, StatusBar } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast, Tab, Tabs } from 'native-base';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import { scanSeQRData } from '../../../App';

export default class VerifierHistoryScreen extends React.Component{

	constructor(props) {
  		super(props);
	
	  	this.state = {
	  		loading: false,
	  		loaderText:'',
	  		historyCleared: false,
	  	};
	}

	_clearHistory(){
		Alert.alert(
			'Delete history?',
			'This will delete all the scan history.',
			[
				{text: 'CANCEL' },
			    {text: 'DELETE', onPress: () => {
					scanSeQRData.length = 0;
					this.setState({historyCleared: true});
			    }},
			],
			{ cancelable: true }
		);
	}

	_showHeader(){
		if(Platform.OS == 'ios'){
			return(
				<Header style={{backgroundColor: '#0000FF'}} hasTabs>
					<Left> 
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('VerifierMainScreen')}> 
						<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
		  			<Body> 
		  				<Title style={{ color: '#FFFFFF'}}>Scan history</Title>
		  			</Body>           			
		  			<Right>
		  				<Menu>
				      		<MenuTrigger>
				      			<Image 
		      						style={{ width: 20, height: 20 ,paddingRight: 15 }}
		      						source={require('../../../images/three_dots.png' )}
	      						/>
				      		</MenuTrigger>
					      	<MenuOptions>
						        <MenuOption onSelect={() => this._clearHistory()} style={{padding:15}}>
						        	<Text style={{color: 'black'}}>Clear history</Text>
						        </MenuOption>
						        
					      	</MenuOptions>
						</Menu>
		  			</Right>
				</Header>
			)
		} else {
			return(
				<Header style={{backgroundColor: '#0000FF'}} hasTabs>
					<Left>
						<TouchableOpacity onPress={()=> this.props.navigation.navigate('VerifierMainScreen')}> 
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF',paddingLeft: 10, paddingRight: 10 }}/>
						</TouchableOpacity>
					</Left>
					<Body>
						<Title style={{ color: '#FFFFFF', fontSize: 16}}>Scan history</Title>
					</Body>            			
		  			<Right>
		  				<Menu>
				      		<MenuTrigger>
				      			<Image 
		      						style={{ width: 20, height: 20 ,paddingRight: 15 }}
		      						source={require('../../../images/three_dots.png' )}
	      						/>
				      		</MenuTrigger>
					      	<MenuOptions>
						        <MenuOption onSelect={() => this._clearHistory()} style={{padding:15}}>
						        	<Text style={{color: 'black'}}>Clear history</Text>
						        </MenuOption>
						        
					      	</MenuOptions>
						</Menu>
		  			</Right>
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
		        <Tabs>
		          	<Tab heading="SeQR" tabStyle={{backgroundColor: 'blue'}} textStyle={{color: '#fff'}} activeTabStyle={{backgroundColor: 'blue'}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
		          		
		        		<Tab1 props={this.props}/>
		          	</Tab>
		          	<Tab heading="QR" tabStyle={{backgroundColor: 'blue'}} textStyle={{color: '#fff'}} activeTabStyle={{backgroundColor: 'blue'}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
		        	    <Tab2 />
		          	</Tab>		          	
		        </Tabs>
				
			</View>
	)}
}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
 	},
 })