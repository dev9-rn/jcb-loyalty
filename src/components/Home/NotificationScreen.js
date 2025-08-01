import React, { Component } from 'react';
import {   StyleSheet, View, ScrollView, TouchableOpacity, AppRegistry } from 'react-native';
import { Card, Text, Container, Header, Left, Body, Icon, Title, Right } from 'native-base';
import App, { URL, APIKEY, ACCESSTOKEN } from '../../App';
var moment = require('moment');
import {createAppContainer ,createStackNavigator} from "react-navigation" 
// import {createStackNavigator} from "react-navigation-stack"
import HomeScreen from './HomeScreen';
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import * as utilities from "../../Utility/utilities";
import Loader from '../../Utility/Loader';
import AsyncStorage from '@react-native-community/async-storage';
import { isMaintenance } from '../../services/MaintenanceService/MaintenanceService';

const AppNavigator = createStackNavigator({
	AppJSScreen: { screen: HomeScreen, navigationOptions: { header: null } },
});
const AppContainer = createAppContainer(AppNavigator);

class NotificationScreen extends Component {
	constructor(props) {
		super(props);
		console.log("NotificationScreen.js");
		this.state = {
			data: [],
			deleteItem: false,
			loading: false,
			loaderText: 'Loading...',
			showHideHomeScreen: false,
			distributorId: '',
			redirecT: false
		};
		// console.log(this.props.navigation.state.routeName);
	}
	showHideHomeScrn = () => {
		this.setState({
			showHideHomeScreen: true
		}, () => {
			this.navigator && this.navigator.dispatch({ type: 'Navigate', routeName: "AppJSScreen", params: "hii" });
		})
	}

	async getDataFromAPi() {
		await AsyncStorage.getItem('USERDATA')
			.catch(err => { alert("Error") })
			.then(res => {
				var lData = JSON.parse(res);
				this.setState({ distributorId: lData.data.id }, () => {
					const formData = new FormData();
					formData.append('distributorId', this.state.distributorId);
					if (this.props.languageControl) {
						formData.append('language', 'en');
					} else {
						formData.append('language', 'hi');
					}
					this.getNotifications(formData);
				})
			})
	}
	async getNotifications(pFormData) {
		this.setState({ loading: true })
		var lUrl = URL + 'getNotifications';
		await fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY,
				'accesstoken': ACCESSTOKEN
			},
			body: pFormData,
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setState({ data: responseJson.notifications, loading: false });
				console.log("Notification response", responseJson)			})
			.catch(async (error) => {
				await isMaintenance({navigation : this.props.navigation});
				alert(error)
			});
	};
	componentDidMount() {
		this.getDataFromAPi();
	}
	handleBackPress = () => {
		this.props.navigation.navigate('HomeScreen');
		return true;
	}
	showNotfyScreen() {
		return (
			<ScrollView keyboardShouldPersistTaps="always" style={{ backgroundColor: '#1a1a1a' }}>
				<Header style={{ backgroundColor: '#fab032' }}>
					<Left style={{ flex: 0.5 }}>
						<TouchableOpacity onPress={this.showHideHomeScrn} style={{ marginLeft: 5 }}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.8 }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.NotificationScreen_title')}</Title>
					</Body>
				</Header>
				<Loader loading={this.state.loading} text={this.state.loaderText} />
				<View style={styles.container}>
					{this.state.data && this.state.data.length > 0 ?
						this.state.data.map((data, i) => {
							return <Card style={styles.cardContainer} key={i}>
								<Text style={{ fontWeight: 'bold' }}>{moment(data.created_date).format('DD-MMM-YYYY')}</Text>
								<Text>{data.notification}</Text>
							</Card>
						})
						:
						<Container>
							<View style={{
								flex: 1,
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: this.props.enableDarkTheme ? 'black' : 'white'
							}}>
								<Text style={{ fontSize: 28, color: '#BDBDBD' }}>{strings('login.NotificationScreen_Error')}</Text>
							</View>
						</Container>
					}
				</View>
			</ScrollView>
		)
	}
	showHomeScreen() {
		return (
			<AppContainer ref={nav => { this.navigator = nav; }} />
		)
	}
	render() {
		return (
			<View>
				{this.state.showHideHomeScreen ? (this.state.redirecT ? this.showHomeScreen() : this.handleBackPress()) : this.showNotfyScreen()}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f2f2f2'
	},
	cardContainer: {
		padding: 15,
		marginTop: 20,
		marginLeft: 10,
		marginRight: 10
	},
	backGroundTextForNoti: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
const mapStateToProps = (state) => {
	return {
		enableDarkTheme: state.VerifierReducer.enableDarkTheme,
		languageControl: state.VerifierReducer.languageEnglish,
	}
}
export default connect(mapStateToProps, null)(NotificationScreen)