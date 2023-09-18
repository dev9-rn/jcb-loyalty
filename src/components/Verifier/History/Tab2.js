import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {  BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, StatusBar } from 'react-native';
import { Container, Content, Card, CardItem, Text, Item, Icon, Toast, Tab, Tabs, List, ListItem } from 'native-base';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import { scanQRData } from '../../../App';

export default class Tab2 extends React.Component{

	constructor(props) {
  		super(props);
	
	  	this.state = {
	  		loading: false,
	  		loaderText:'',
	  	};
	}

	_displayList(){
		var items = scanQRData;
		if (items.length == 0) {
			return(
				<View style={styles.container}>
					<Text style={{ fontSize: 28, color: '#BDBDBD' }}>No history available!</Text>
				</View>
			)
		}else{
			return(
				<Content>
		          	<List 
	          		dataArray={items}
	            	renderRow={(item) =>
	              		<ListItem>
		    	            <Text>{item.serial_no}</Text>
		              	</ListItem>
		            }>
		          	</List>
		        </Content>
			)
		}
	}

	render(){
		return(
			<Container>
		        { this._displayList() }
	      	</Container>
	)}
}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
	    flexDirection: 'column',
        alignItems:'center',
        justifyContent: 'center'
 	},
 })