import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { FlatList, Alert,  BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, StatusBar, ListView } from 'react-native';
import { Container, Content, Card, CardItem, Text, Item, Icon, Toast, Tab, Tabs, List, ListItem } from 'native-base';
import Loader from '../../../Utility/Loader';
import * as utilities from '../../../Utility/utilities';
import { scanSeQRData } from '../../../App';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => { r1 !== r2 }});


export default class Tab1 extends React.Component{

	constructor(props) {
  		super(props);
	  	this.state = {
	  		data: scanSeQRData,
	  		deleteItem: false,
	  		loading: false,
	  		loaderText:'',
	  	};
	}

	_deleteRecord(pItem, pIndex){
		// alert('hi')
		 ;
		Alert.alert(
			'Delete history?',
			'This will delete current record from history.',
			[
				
				{text: 'CANCEL' },
			    {text: 'DELETE', onPress: () => {
					let index = parseInt(pIndex);
					scanSeQRData.splice( index , 1 );
					this.setState({ deleteItem: true, data: scanSeQRData });    	
			    }},
			],
			{ cancelable: true }
		);
		console.log(pItem + " : " + pIndex);
		
	}

	_displayList(){
		// this.setState({itemData: scanSeQRData});
		var items = scanSeQRData;
		 ;
		if (items.length == 0) {
			return(
				<View style={styles.noRecord}>
					<Text style={{ fontSize: 28, color: '#BDBDBD' }}>No history available!</Text>
				</View>
			)
		}else{
			return(
				<View>
		          	<FlatList
						data={this.state.data}
						extraData={this.state}
						key={(item, index) => item.index}
						keyExtractor={(item, index) => item.index}
  						renderItem={({item, index }) => 
  							<ListItem>
          						<TouchableOpacity style={{flex:0.9 ,flexDirection: 'row' }} onPress={()=>{ this.props.props.navigation.navigate('CertificateViewScreen', { certificateData: item }); } }>
		    	            		<Text>Serial No : {item.serial_no}</Text>		    	            	
	              				</TouchableOpacity>
	              				<TouchableOpacity style={{ flex: 0.1 }} onPress={()=> { this._deleteRecord(item, index) } }>
		    	            		<Icon type="MaterialIcons" name="delete" />
		              			</TouchableOpacity>
		              		</ListItem>
  						}
					/>
		        </View>
			)
		}
	}

	render(){
		return(			
			<View style={styles.container}>
		        { this._displayList() }
	      	</View>
	)}
}

const styles = StyleSheet.create({
  	container: {
	    flex: 1,
        
 	},
 	noRecord: {
 		flex: 1,
 		flexDirection: 'column',
        alignItems:'center',
        justifyContent: 'center'
 	}
 });

// <List 
// 	          		dataArray={items}
// 	            	renderRow={(item, sectionID, rowID ) =>
              			
// 	              			<ListItem>
//           						<TouchableOpacity style={{flex:0.9 ,flexDirection: 'row' }} onPress={()=>{ this.props.props.navigation.navigate('CertificateViewScreen', { certificateData: item }); } }>
// 		    	            		<Text>Serial No : {item.serial_no}</Text>		    	            	
// 	              				</TouchableOpacity>
// 	              				<TouchableOpacity style={{ flex: 0.1 }} onPress={()=> { this._deleteRecord(item, rowID) } }>
// 		    	            		<Icon type="MaterialIcons" name="delete" />
// 		              			</TouchableOpacity>
// 		              		</ListItem>
	              		
// 		            }>
// 		          	</List>

	