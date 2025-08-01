import React, { Component } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, ListItem } from 'native-base';
import Loader from '../../Utility/Loader';
import * as utilities from '../../Utility/utilities';
import moment from 'moment';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import { Col, Grid } from "react-native-easy-grid";
import DatePicker from 'react-native-date-picker'
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { isMaintenance } from '../../services/MaintenanceService/MaintenanceService';
class Tab1 extends Component {

	constructor(props) {
		super(props);
		this.redeemHistoryCash = this.props.redeemCash;
		this.state = {
			data: this.props.redeemCash,
			// data: redeemHistoryCash,
			deleteItem: false,
			isDateTimePickerVisible: false,
			isDateTimePickerVisible1: false,
			frmDate:  moment().locale('en').clone().startOf('month').format("DD-MM-YYYY"),
			toDate:  moment().locale('en').format('DD-MM-YYYY'),
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
			noMoreDataError: '',
			userType: ''
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
		// this.setState({ offset: 0, redeemHistoryCashArr: [] })
		// let a = date;
		// let b = this.state.toDate
		console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
		let a = moment(date, 'DD-MM-YYYY');
		let b = moment(this.state.toDate, 'DD-MM-YYYY');

		if (moment(a).isAfter(b)) {
			this.setState({ fromDateError: 'FromDate cannot be greater than toDate.', noMoreDataError: '',open1:false  })
		} else {
			this.forceUpdate();
			this.setState({ fromDateError: '', toDateError: '', frmDate: a.format("DD-MM-yyyy"), open1: false }, () => {
				this.callApi();
			})
		}
		// this.setState({ frmDate: moment(a).format("DD-MM-YYYY") })
		this.hideDateTimePicker();
	};
	handleDatePicked1 = date => {
		// this.setState({ offset: 0, redeemHistoryCashArr: [] })
		// let a = date;
		// let b = this.state.frmDate;
		// let c = moment().format('DD-MM-YYYY')
		let a = moment(date, 'DD-MM-YYYY');
		// let b = this.state.frmDate;
		let b = moment(this.state.frmDate, 'DD-MM-YYYY');

		if (a < b) {
			this.setState({ toDateError: strings('login.FromDateError'), noMoreDataError: '',open2:false })
		} else {
			this.setState({ toDate: a.format("DD-MM-yyyy"), toDateError: '', fromDateError: '' ,open2:false}, () => {
				this.callApi();
			})
		}
		// this.setState({ toDate: a })
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
				this.setState({ distributorId: lData.data.id, userType: lData.data.userType }, () => {
					this.callApi()
				})
			}
		});
	}
	callApi = () => {
		const formData = new FormData();
		console.log(this.state.userType);

		formData.append('distributorId', this.state.distributorId);
		formData.append('fromDate', this.state.frmDate);
		formData.append('toDate', this.state.toDate);
		formData.append('offset', this.state.offset);
		formData.append('redeemType', 'Cash');
		formData.append('userType', this.state.userType);
		if (this.props.languageControl) {
			formData.append('language', 'en');
		} else {
			formData.append('language', 'hi');
		}

		console.log(formData);
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
			.catch(async (error) => {
				await isMaintenance({navigation : this.props.navigation});
			});
	}
	dataVerify = (lResponseData) => {
		if (!lResponseData) {
			alert('Something went wrong. Please try again later');
		} else if (lResponseData.status == 500 || lResponseData.status == 400) {
			this.setState({ noMoreDataError: "" })
			alert(lResponseData.message);
			this.setState({ noMoreDataError: "" })
		} else if (lResponseData.status == 403) {
			alert(lResponseData.message);
			this.props.navigation.navigate('LoginScreen');
			AsyncStorage.clear();
			return;
		} else if (lResponseData.status == 404) {
			this.setState({ noMoreDataError: strings('login.noMoreData') });
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
			alert('Something went wrong. Please try again later');
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
		if (this.state.redeemHistoryCash.length == 0) {
			return (
				<View style={styles.noRecord}>
					<Text style={{ fontSize: 28, color: this.props.enableDarkTheme ? 'white' : '#BDBDBD' }}>{strings('login.NoHistory_Error')}</Text>
				</View>
			)
		} else {
			return (
				<View style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white' }}>
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
							<ListItem key={index} style={{ flexDirection: 'column', alignItems: 'flex-start', }}>
								<View style={{ flex: 1, flexDirection: 'row', }}>
									<View style={{ flex: 0.9, }} >
										<Text style={{ alignSelf: 'flex-start', fontSize: 14, color: this.props.enableDarkTheme ? 'white' : 'black' }}>Serial No : {item.redeemHistoryCash.id}</Text>
									</View>
									<View style={{ flex: 0.1, flexDirection: 'row' }}>
										<Text style={{ fontSize: 12, color: 'green', paddingRight: 3, color: this.props.enableDarkTheme ? 'white' : 'black' }}>{'\u20B9'}</Text>
										<Text style={{ fontSize: 14, color: this.props.enableDarkTheme ? 'white' : 'black' }}>{item.redeemHistoryCash.value}</Text>
									</View>
								</View>
								<View style={{ flex: 0.1, flexDirection: 'row' }}>
									<View style={{ flex: 0.9, }} >
										<Text style={{ alignSelf: 'flex-start', fontSize: 14, color: this.props.enableDarkTheme ? 'white' : 'black' }}>Item Code : {item.redeemHistoryCash.item_code}</Text>
									</View>
								</View>
								<View style={{ flex: 1, }} >
									<Text style={{ fontSize: 14, color: this.props.enableDarkTheme ? 'white' : 'black' }}>Redemtion Date : {item.redeemHistoryCash.distributor_redemption_date}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 14, color: this.props.enableDarkTheme ? 'white' : 'black' }}>Status : {item.redeemHistoryCash.sap_interface_flag}</Text>
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
	onHideAfterConfirm = () => {
		alert(1)
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white' }}>
				<View style={{ flex: this.state.fromDateError || this.state.toDateError ? 0.2 : 0.1, marginTop: 10 }}>
					{this.props.languageControl == 'Urdu - (اردو)' ?
						<Grid style={{ margin: 10 }}>
							<Col style={{ bottom: 7 }} size={1.2}>
								{/* <DatePicker
									date={this.state.frmDate}
									mode="date"
									showIcon={false}
									onDateChange={(date) => { this.handleDatePicked(date) }}
									customStyles={{
										dateInput: {
											borderWidth: 0,
											alignItems: 'center',
											// marginRight: this.props.enableDarkTheme ? 65 : 0,
											backgroundColor: 'white'
										}
									}}
									style={{ width: '100%' }}
								/>
								 */}
								 <TouchableOpacity style={{ paddingRight: 2 }} onPress={() => { this.setState({ open1: true }) }}>
                             <Text onPress={() => { this.setState({ open1: true })} }  style={{  color:"#000000"}}>{this.state.frmDate}</Text>
                             </TouchableOpacity>
								 <DatePicker
                                modal
                                mode="date"
                                open={this.state.open1}
                                date={new Date()}
                                color="#000000"
                                textColor="#000000"
								maximumDate={new Date()}
                                onConfirm={(date) => {
                                    this.handleDatePicked(date) 
                                }}
                                onCancel={() => {
                                // setOpen(false)
                                this.setState({ open1: false})
                                }}
                            />
							</Col>
							<Col size={1.5}>
								<Text style={{ textAlign: 'left', fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.coupon_history_fromDate')} : </Text>
							</Col>

							<Col style={{ bottom: 7, }}>
								{/* <DatePicker
									date={this.state.toDate}
									mode="date"
									showIcon={false}
									onDateChange={(date) => { this.handleDatePicked1(date) }}
									customStyles={{
										dateInput: {
											borderWidth: 0,
											alignItems: 'center',
											// marginRight: this.props.enableDarkTheme ? 65 : 0,
											backgroundColor: 'white'
										}
									}}
									style={{ width: '130%' }}
								/> */}
								<TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this.setState({ open2: true }) }}>
                             <Text onPress={() => { this.setState({ open2: true })} }  style={{ color:"#000000"}}>{this.state.toDate}</Text>
                             </TouchableOpacity>
								 <DatePicker
                                modal
                                mode="date"
                                open={this.state.open2}
                                date={new Date()}
                                color="#000000"
								maximumDate={new Date()}
                                textColor="#000000"
                                onConfirm={(date) => {
                                    this.handleDatePicked1(date) 
                                }}
                                onCancel={() => {
                                // setOpen(false)
                                this.setState({ open2: false})
                                }}
                            />
							</Col>
							<Col size={1}>
								<Text style={{ fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>  {strings('login.coupon_history_toDate')} : </Text>
							</Col>
						</Grid>
						:
						<View style={{ marginLeft: 20,alignItems:'center', flexDirection: "row", marginTop:5 }}>
							
								<View>
									<Text style={{ fontSize:16, fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black', }}>{strings('login.report_history_fromDate')} : </Text>
								</View>
								<Col style={{  }}>
									{/* <DatePicker
										date={this.state.frmDate}
										confirmBtnText="Select"
										cancelBtnText="Cancel"
										mode="date"
										format="DD-MM-YYYY"
										maxDate={moment().format('DD-MM-YYYY')}
										showIcon={false}
										onDateChange={(date) => { this.handleDatePicked(date) }}
										customStyles={{
											dateInput: {
												borderWidth: 0,
												alignItems: 'flex-start',
												marginRight: this.props.enableDarkTheme ? 65 : 0,
												backgroundColor: 'white',
											}
										}}
									/> */}
									 <TouchableOpacity style={{ paddingRight: 2 }} onPress={() => { this.setState({ open1: true }) }}>
                             <Text onPress={() => { this.setState({ open1: true })} }  style={{  color:"#000000"}}>{this.state.frmDate}</Text>
                             </TouchableOpacity>

								<DatePicker
                                modal
                                mode="date"
                                open={this.state.open1}
                                date={new Date()}
                                color="#000000"
                                textColor="#000000"
								maximumDate={new Date()}
                                onConfirm={(date) => {
                                    this.handleDatePicked(date) 
                                }}
                                onCancel={() => {
                                // setOpen(false)
                                this.setState({ open1: false})
                                }}
                            />
								</Col>
								<Col>
									<Text style={{ fontSize:16,fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.report_history_toDate')} : </Text>
								</Col>
								<Col style={{ 

								 }}>
									{/* <DatePicker
										date={this.state.toDate}
										confirmBtnText="Select"
										cancelBtnText="Cancel"
										mode="date"
										format="DD-MM-YYYY"
										maxDate={moment().format('DD-MM-YYYY')}
										showIcon={false}
										onDateChange={(date) => { this.handleDatePicked1(date) }}
										customStyles={{
											dateInput: {
												borderWidth: 0,
												alignItems: 'flex-start',
												marginRight: this.props.enableDarkTheme ? 65 : 0,
												backgroundColor: 'white'
											}
										}}
									/> */}
									 <TouchableOpacity style={{ paddingRight: 2 }} onPress={() => { this.setState({ open2: true }) }}>
                             <Text onPress={() => { this.setState({ open2: true })} }  style={{ color:"#000000"}}>{this.state.toDate}</Text>
                             </TouchableOpacity>
									 <DatePicker
                                modal
                                mode="date"
                                open={this.state.open2}
                                date={new Date()}
                                color="#000000"
								maximumDate={new Date()}
                                textColor="#000000"
                                onConfirm={(date) => {
                                    this.handleDatePicked1(date) 
                                }}
                                onCancel={() => {
                                // setOpen(false)
                                this.setState({ open2: false})
                                }}
                            />
								</Col>
							
						</View>
					}
					{this.state.fromDateError ?
						<View style={{ marginTop: 15, marginLeft: 20 }}>
							<Text style={{ color: 'red', }}>{this.state.fromDateError}</Text>
						</View>
						: <View></View>}
					{this.state.toDateError ?
						<View style={{ marginTop: 15, marginLeft: 20 }}>
							<Text style={{ color: 'red', }}>{this.state.toDateError}</Text>
						</View>
						: <View></View>}
					<Text style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
					{/* <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 10, margin: 10 }} /> */}
				</View>
				{this._displayList()}
			</View>
		)
	}
}
const styles = StyleSheet.create({
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