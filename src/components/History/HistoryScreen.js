import React, { Component } from 'react';
import { Alert, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, StatusBar } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast, Tab, Tabs } from 'native-base';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import HistoryService from '../../services/HistoryService/HistoryService';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
class HistoryScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			historyCleared: false,
			redeemHistory: [],
			redeemHistoryCash: [],
			redeemHistoryScheme: [],
			userType: ''
		};
	}

	componentWillMount() {

	}
	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this._getAsyncData();
	}
	componentWillUnMount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.props.navigation.navigate('HomeScreen');
		return true;
	}

	async _getAsyncData() {
		await AsyncStorage.getItem('USERDATA', (err, result) => {		// USERDATA is set on SignUP screen
			var lData = JSON.parse(result);
			if (lData) {
				this.setState({ userType: lData.data.userType })
				// this.distributorId = lData.data.id;
				// this._getRedeemHistory(lData.data.id);
			}
		});
	}

	async _getRedeemHistory(distributorId) {
		const formData = new FormData();

		formData.append('distributorId', distributorId);
		formData.append('fromDate', '05-06-2019');
		formData.append('toDate', '05-06-2019');
		formData.append('userType', this.state.userType);
		if (this.props.languageControl) {
			formData.append('language', 'en');
		} else {
			formData.append('language', 'hi');
		}

		var historyApiObj = new HistoryService();

		await historyApiObj.getRedeemHistory(formData);
		var lResponseData = historyApiObj.getRespData();
		await this.closeActivityIndicator();

		if (!lResponseData) {
			alert('Something went wrong. Please try again later');
		} else if (lResponseData.status == 500 || lResponseData.status == 400) {
			alert(lResponseData.message);
		} else if (lResponseData.status == 403) {
			alert(lResponseData.message);
			this.props.navigation.navigate('LoginScreen');
			AsyncStorage.clear();
			return;
		} else if (lResponseData.status == 200) {
			debugger
			if (lResponseData.redeemHistory.length == 0) {
				this.setState({ redeemHistory: lResponseData.redeemHistory });
			} else if (lResponseData.redeemHistory.length > 0) {
				var redeemCashArr = [];
				var redeemSchemeArr = [];
				for (var i = 0; i < lResponseData.redeemHistory.length; i++) {
					if (lResponseData.redeemHistory[i].distributor_redeemed_type == '0') {
						var redeemCashObj = {};
						redeemCashObj.redeemHistoryCash = lResponseData.redeemHistory[i];
						redeemCashArr.push(redeemCashObj);

					} else {
						var redeemSchemeObj = {};
						redeemSchemeObj.redeemHistoryScheme = lResponseData.redeemHistory[i];
						redeemSchemeArr.push(redeemSchemeObj);
					}
				}
				this.setState({ redeemHistory: lResponseData.redeemHistory, redeemHistoryCash: redeemCashArr, redeemHistoryScheme: redeemSchemeArr });
			}
		} else {
			alert('Something went wrong. Please try again later');
		}
	}

	_showHeader() {
			return (
				<Header style={{ backgroundColor: '#fab032' }} hasTabs>
					<Left style={{ flex: 0.2 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.6, alignItems: 'center' }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.coupon_history_title')}</Title>
					</Body>
					<Right style={{ flex: 0.2 }}>

					</Right>
				</Header>
			)
	}

	render() {
		return (
			<View style={styles.container}>
				{this._showHeader()}
				<Tabs>
					<Tab heading={strings('login.coupon_history_cash')} tabStyle={{ backgroundColor: this.props.enableDarkTheme ? 'black' : 'blue' }} textStyle={{ color: '#fff' }} activeTabStyle={{ backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'blue' }} activeTextStyle={{ color: '#fff', fontWeight: 'normal' }}>
						<Tab1 props={this.props} redeemCash={this.state.redeemHistoryCash} />
					</Tab>

					<Tab heading={strings('login.coupon_history_scheme')} tabStyle={{ backgroundColor: this.props.enableDarkTheme ? 'black' : 'blue' }} textStyle={{ color: '#fff' }} activeTabStyle={{ backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'blue' }} activeTextStyle={{ color: '#fff', fontWeight: 'normal' }}>
						<Tab2 props={this.props} redeemScheme={this.state.redeemHistoryScheme} />
					</Tab>
				</Tabs>

			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})
const mapStateToProps = (state) => {
	return {
		enableDarkTheme: state.VerifierReducer.enableDarkTheme,
		languageControl: state.VerifierReducer.languageEnglish,
	}
}
export default connect(mapStateToProps, null)(HistoryScreen)