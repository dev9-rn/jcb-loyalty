import React, { Component } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, ListItem } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import Loader from '../../Utility/Loader';
import HistoryService from '../../services/HistoryService/HistoryService';
import * as utilities from '../../Utility/utilities';
import moment from 'moment';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import DateTimePicker from "react-native-modal-datetime-picker";
import { Col, Grid } from "react-native-easy-grid";
import { ScrollView } from 'react-native-gesture-handler';
import DatePicker from 'react-native-datepicker'
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';

class Tab1 extends React.Component {

	constructor(props) {
		super(props);
		this.redeemHistoryCash = this.props.redeemCash;
		this.state = {
			data: this.props.redeemCash,
			// data: redeemHistoryCash,
			deleteItem: false,
			loading: false,
			isDateTimePickerVisible: false,
			isDateTimePickerVisible1: false,
			frmDate: moment().locale('en').format('DD-MM-YYYY'),
			toDate: moment().locale('en').format('DD-MM-YYYY'),
			fromDateError: '',
			toDateError: '',
			distributorId: '',
			lResponseData: '',
			redeemHistory: [],
			redeemHistoryCash: [],
			redeemHistoryScheme: [],
			redeemHistoryCashArr: [],
			loaderText: 'Please wait...',
			offset: 0,
			noMoreDataError: ''
		};
	}

	showDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: true, isDateTimePickerVisible1: false });
	};
	showDateTimePicker1 = () => {
		this.setState({ isDateTimePickerVisible: false, isDateTimePickerVisible1: true });
	};

	hideDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: false, isDateTimePickerVisible1: false });
	};
	handleDatePicked = date => {
		let a = date;
		let b = this.state.toDate
		if (a > b) {
			this.setState({ fromDateError: 'FromDate cannot be greater than toDate.' })
		} else {
			this.forceUpdate();
			this.setState({ fromDateError: '', toDateError: '' })
			this.setState({ frmDate: date })
			this.callApi();
		}
		this.setState({ frmDate: a })
		this.hideDateTimePicker();
	};
	handleDatePicked1 = date => {
		let a = date;
		let b = this.state.frmDate;
		let c = moment().format('DD-MM-YYYY')
		if (a > c) {
			this.setState({ toDateError: 'ToDate cannot be greater than todays date.' })
		} else if (a < b) {
			this.setState({ toDateError: 'ToDate cannot be less than fromDate date.' })
		} else {
			this.setState({ toDateError: '', fromDateError: '' })
			this.setState({ toDate: date })
			this.callApi();
		}
		this.setState({ toDate: a })
		this.hideDateTimePicker();
	};
	componentDidMount = () => {
		this._getAsyncData();
	}
	async _getAsyncData() {
		await AsyncStorage.getItem('USERDATA', (err, result) => {		// USERDATA is set on SignUP screen
			var lData = JSON.parse(result);
			if (lData) {
				// this.distributorId = lData.data.id;
				this.setState({ distributorId: lData.data.id }, () => {
					this.callApi()
				})
			}
		});
	}
	callApi = () => {
		this.setState({ loading: true })
		const formData = new FormData();
		console.log(ACCESSTOKEN);

		formData.append('distributorId', this.state.distributorId);
		formData.append('fromDate', this.state.frmDate);
		formData.append('toDate', this.state.toDate);
		formData.append('offset', this.state.offset);
		formData.append('redeemType', 'Cash');

		var lUrl = URL + 'getRedeemHistory';
		fetch(lUrl, {
			method: 'POST',
			headers: {
				'Accept': 'application\/json',
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY,
				'accesstoken': ACCESSTOKEN
			},
			body: formData,
		})
			.then((response) => response.json())
			.then((responseJson) => {
				console.log(responseJson);

				this.setState({ offset: responseJson.offset })
				this.dataVerify(responseJson)
			})
			.catch((error) => {
				console.log(error);
			});
	}
	dataVerify = (lResponseData) => {
		this.setState({ loading: false })
		if (!lResponseData) {
			utilities.showToastMsg('Something went wrong. Please try again later');
		} else if (lResponseData.status == 500 || lResponseData.status == 400 || lResponseData.status == 403) {
			this.setState({ noMoreDataError: "" })
			utilities.showToastMsg(lResponseData.message);
			this.setState({ noMoreDataError: "" })
		} else if (lResponseData.status == 404) {
			this.setState({ noMoreDataError: "No more data." })
			return;
		}
		else if (lResponseData.status == 200) {
			this.setState({ noMoreDataError: "" })
			if (lResponseData.redeemHistory.length == 0) {
				this.setState({ redeemHistory: lResponseData.redeemHistory, redeemHistoryScheme: [], redeemHistoryCash: [] });
			} else if (lResponseData.redeemHistory.length > 0) {
				var redeemCashArr = [];
				var redeemSchemeArr = [];
				for (var i = 0; i < lResponseData.redeemHistory.length; i++) {
					if (lResponseData.redeemHistory[i].distributor_redeemed_type == '0') {
						var redeemCashObj = {};
						redeemCashObj.redeemHistoryCash = lResponseData.redeemHistory[i];
						redeemCashArr.push(redeemCashObj);
						this.state.redeemHistoryCashArr.push(redeemCashObj)
					} else {
						var redeemSchemeObj = {};
						redeemSchemeObj.redeemHistoryScheme = lResponseData.redeemHistory[i];
						redeemSchemeArr.push(redeemSchemeObj);
					}
				}
				this.setState({ redeemHistory: lResponseData.redeemHistory, redeemHistoryCash: redeemCashArr, redeemHistoryScheme: redeemSchemeArr });
			}
		} else {
			utilities.showToastMsg('Something went wrong. Please try again later');
			this.setState({ redeemHistoryCash: [] })
		}
	}
	renderFooter = () => {
		return (
			<View>
				{this.state.noMoreDataError ?
					<Text style={{ color: 'red', textAlign: 'center', }}>{this.state.noMoreDataError}</Text>
					: <Text></Text>}
			</View>
		)
	};
	handleLoadMore = () => {
		if (!this.state.noMoreDataError) {
			this.callApi();
		}
	};

	_displayList() {
		var items1 = this.state.redeemHistoryCash
		// var items = this.props.redeemCash;
		if (items1.length == 0) {
			return (
				<View style={styles.noRecord}>
					<Text style={{ fontSize: 28, color: '#BDBDBD' }}>{strings('login.NoHistory_Error')}</Text>
				</View>
			)
		} else {
			return (
				<View style={{ flex: 1 }}>
					{/* <FlatList
						data={this.state.redeemHistoryCash}
						extraData={this.state}
						key={(item, index) => item.index}
						keyExtractor={(item, index) => item.index}
						renderItem={({ item, index }) =>
							<ListItem key={index} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
								<View style={{ flex: 1, flexDirection: 'row', }}>
									<View style={{ flex: 0.9, }} >
										<Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Serial No : {item.redeemHistoryCash.id}</Text>
									</View>
									<View style={{ flex: 0.1, flexDirection: 'row' }}>
										<Text style={{ fontSize: 12, color: 'green', paddingRight: 3 }}>{'\u20B9'}</Text>
										<Text style={{ fontSize: 14 }}>{item.redeemHistoryCash.value}</Text>
									</View>
								</View>
								<View style={{ flex: 0.1, flexDirection: 'row' }}>
									<View style={{ flex: 0.9, }} >
										<Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Item Code : {item.redeemHistoryCash.item_code}</Text>
									</View>
								</View>

								<View style={{ flex: 1, }} >
									<Text style={{ fontSize: 14 }}>Redemtion Date : {item.redeemHistoryCash.distributor_redemption_date}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 14 }}>Status : {item.redeemHistoryCash.sap_interface_flag}</Text>
								</View>
							</ListItem>
						}
					/> */}

					<FlatList
						data={this.state.redeemHistoryCashArr}
						extraData={this.state}
						renderItem={({ item, index }) => (
							<ListItem key={index} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
								<View style={{ flex: 1, flexDirection: 'row', }}>
									<View style={{ flex: 0.9, }} >
										<Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Serial No : {item.redeemHistoryCash.id}</Text>
									</View>
									<View style={{ flex: 0.1, flexDirection: 'row' }}>
										<Text style={{ fontSize: 12, color: 'green', paddingRight: 3 }}>{'\u20B9'}</Text>
										<Text style={{ fontSize: 14 }}>{item.redeemHistoryCash.value}</Text>
									</View>
								</View>
								<View style={{ flex: 0.1, flexDirection: 'row' }}>
									<View style={{ flex: 0.9, }} >
										<Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Item Code : {item.redeemHistoryCash.item_code}</Text>
									</View>
								</View>
								<View style={{ flex: 1, }} >
									<Text style={{ fontSize: 14 }}>Redemtion Date : {item.redeemHistoryCash.distributor_redemption_date}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 14 }}>Status : {item.redeemHistoryCash.sap_interface_flag}</Text>
								</View>
							</ListItem>
						)}
						keyExtractor={(item, index) => index.toString()}
						ListFooterComponent={this.renderFooter.bind(this)}
						onEndReachedThreshold={0.1}
						onEndReached={this.handleLoadMore.bind(this)}
					/>
				</View>
			)
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>
				<View style={{ flex: this.state.fromDateError || this.state.toDateError ? 0.2 : 0.1, marginTop: 5 }}>
					<Grid style={{ marginTop: 10, margin: 5 }}>
						<Col size={2.5}>
							<Text style={{ fontSize: this.props.languageControl == "English" || this.props.languageControl == "English - (English)" ? 15 : 12,
								alignSelf:'center', fontWeight: 'bold' }}>{strings('login.report_history_fromDate')} : </Text>
						</Col>
						<Col size={3} >
							<DatePicker
								date={this.state.frmDate}
								confirmBtnText={"Done"}
								cancelBtnText={"Cancel"}
								mode="date"
								locale={moment.locale('en')}
								format="DD-MM-YYYY"
								maxDate={moment().format('DD-MM-YYYY')}
								showIcon={false}
								onDateChange={(date) => { this.handleDatePicked(date) }}
								style={{ width: 90, height: 25, justifyContent: 'center' }}
								customStyles={{
									dateInput: {
										borderWidth: 0,
									}
								}}
							/>
						</Col>
						<Col size={2}>
							<Text style={{ fontSize: this.props.languageControl == "English" || this.props.languageControl == "English - (English)" ? 15 : 12,fontWeight: 'bold' }}>{strings('login.report_history_toDate')} : </Text>
						</Col>
						<Col size={3}>
							<DatePicker
								date={this.state.toDate}
								confirmBtnText={"Done"}
								cancelBtnText={"Cancel"}
								mode="date"
								locale={moment.locale('en')}
								format="DD-MM-YYYY"
								maxDate={moment().format('DD-MM-YYYY')}
								showIcon={false}
								onDateChange={(date) => { this.handleDatePicked1(date) }}
								style={{ width: 90, height: 25, justifyContent: 'center' }}
								customStyles={{
									dateInput: {
										borderWidth: 0,
									}
								}}
							/>
						</Col>
					</Grid>
					{this.state.fromDateError ?
						<View style={{ marginTop: 15, marginLeft: 20 }}>
							<Text style={{ color: 'red' }}>{this.state.fromDateError}</Text>
						</View>
						: <View></View>}
					{this.state.toDateError ?
						<View style={{ marginTop: 15, marginLeft: 20 }}>
							<Text style={{ color: 'red' }}>{this.state.toDateError}</Text>
						</View>
						: <View></View>}
					{/* <DateTimePicker
						isVisible={this.state.isDateTimePickerVisible}
						onConfirm={this.handleDatePicked}
						onCancel={this.hideDateTimePicker}
					/>
					<DateTimePicker
						isVisible={this.state.isDateTimePickerVisible1}
						onConfirm={this.handleDatePicked1}
						onCancel={this.hideDateTimePicker}
					/> */}
					{/* <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 0, margin: 1 }} /> */}
				</View>
				{this._displayList()}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	noRecord: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	}
});
const mapStateToProps = (state) => {
	return {
		enableDarkTheme: state.VerifierReducer.enableDarkTheme,
		languageControl: state.VerifierReducer.languageEnglish,
	}
}
export default connect(mapStateToProps, null)(Tab1)