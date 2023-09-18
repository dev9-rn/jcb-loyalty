import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Card, Text, Container, Header, Left, Body, Icon, Title, Right } from 'native-base';
import Loader from '../../Utility/Loader';
import App, { URL, APIKEY, ACCESSTOKEN } from '../../App';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import HomeScreen from './HomeScreen';
var moment = require('moment');

const AppNavigator = createStackNavigator({
	AppJSScreen: { screen: HomeScreen, navigationOptions: { header: null } },
});
const AppContainer = createAppContainer(AppNavigator);
export default class NotificationScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			deleteItem: false,
			loading: false,
			loaderText: 'Loading...',
			showHideHomeScreen: false,
			distributorId: '',
			redirecT: false
		};
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
			})
			.catch((error) => {
				alert(error)
			});
	};
	componentDidMount() {
		console.log(this.props);
		if (this.props.navigation.state.routeName === "DemoNotificationScreen") {
			console.log("inside notify prop");
			this.setState({ redirecT: true })
		} else {
			this.setState({ redirecT: false })
		}
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this.getDataFromAPi();
	}
	componentWillUnMount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}
	handleBackPress = () => {
		console.log("press back clicked");

		this.props.navigation.navigate('HomeScreen');
		return true;
	}
	showNotfyScreen() {
		return (
			<ScrollView keyboardShouldPersistTaps="handled">
				{/* <Header style={{ backgroundColor: '#0000FF' }}>
					<Left style={{}}>
						<TouchableOpacity onPress={this.showHideHomeScrn} style={{ marginLeft: 5 }}>
							<Icon type="FontAwesome" name="arrow-left" style={{ color: '#FFFFFF', fontSize: 25 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ alignItems: 'flex-start', }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>NOTIFICATIONS</Title>
					</Body>
				</Header> */}

				<Header style={{ backgroundColor: '#0000FF' }} hasTabs>
					<Left style={{ flex: 0.2 }}>
						<TouchableOpacity onPress={this.showHideHomeScrn}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.6, alignItems: 'center' }}>
						<Title style={{ textAlign: 'center', color: '#FFFFFF' }}>NOTIFICATIONS</Title>
					</Body>
					<Right style={{ flex: 0.2 }}>
					</Right>
				</Header>

				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>
				<View style={styles.container}>
					{this.state.data.length > 0 ?
						this.state.data.map((data, i) => {
							return <Card style={styles.cardContainer} key={i}>
								<Text style={{ fontWeight: 'bold' }}>{moment(data.created_date).format('DD-MMM-YYYY')}</Text>
								<Text>{data.notification}</Text>
							</Card>
						})
						:
						<Container>
							<View style={styles.backGroundTextForNoti}>
								<Text style={{ fontSize: 28, color: '#BDBDBD' }}>No notifications available!</Text>
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
			<View style={styles.container}>
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
		justifyContent: 'center'
	},
});
