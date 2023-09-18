import React, { Component } from 'react';
import { Dimensions, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Text, Card } from 'native-base';
import Loader from '../../Utility/Loader';
import { Col, Grid, Row } from "react-native-easy-grid";
import moment from 'moment';
import { URL, APIKEY, ACCESSTOKEN } from '../../App';
import { Dropdown } from 'react-native-material-dropdown';
import Moment from 'moment';
var _ = require('lodash');
import { withNavigation } from 'react-navigation';
import DatePicker from 'react-native-datepicker'
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';

class Tab2 extends Component {
	constructor(props) {
		super(props);

		this.state = {
			data: this.props.redeemScheme,
			loading: false,
			loaderText: '',
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
			loaderText: 'Please wait...',
			offset: 0,
			noMoreDataError: '',
			schemes: [],
			schemesList: [],
			selectedSchemeId: ''
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
	componentDidMount = async () => {
		await this._getAsyncData();
	}
	getDistributorSchemes = () => {
		this.setState({ loading: true })
		const formData = new FormData();
		formData.append('distributorId', this.state.distributorId);
		var lUrl = URL + 'getDistributorSchemes';
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
				this.setState({ loading: false })
				console.log(responseJson);
				this.setState({ schemesList: responseJson.schemes })
			})
			.catch((error) => {
				this.setState({ loading: false })
				console.log(error);
			});
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
	callApi = (nameOfSelectedScheme, schemesList) => {
		this.setState({ loading: true })
		var selectedSchemeId = 0;
		if (nameOfSelectedScheme == "All") {
			console.log("inside baba");
			selectedSchemeId = 0
			this.setState({ offset: 0 })
		}
		else if (nameOfSelectedScheme) {
			let idForState = _.filter(schemesList, { value: nameOfSelectedScheme })[0].id
			console.log(idForState);
			selectedSchemeId = idForState;
			this.setState({ offset: 0 })
		}
		const formData = new FormData();
		formData.append('distributorId', this.state.distributorId);
		formData.append('schemeId', selectedSchemeId);
		formData.append('fromDate', this.state.frmDate);
		formData.append('toDate', this.state.toDate);
		formData.append('offset', this.state.offset);
		formData.append('redeemType', 'FOC');
		console.log(formData);
		var lUrl = URL + 'getDistributorSchemesDetails';
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
				this.getDistributorSchemes();
				this.setState({ loading: false })
				console.log(responseJson);
				this.setState({ offset: responseJson.offset, schemes: responseJson.schemes })
			})
			.catch((error) => {
				this.setState({ loading: false })
				console.log(error);
				alert('Network request failed')
			});
	}
	dataRec = (da) => {
		console.log(da);

	}
	_displayList() {
		return (
			<View style={{ flex: 1 }}>
				{this.state.schemes && this.state.schemes.length > 0 ? this.state.schemes.map((item) => (
					<View style={{ margin: 5 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('CouponSchemeDetails', { redeemedCouponsDetails: item.redeemedCouponsDetails })}>
							<Card style={{ height: 150, borderColor: '#f4b826', padding: 10 }}>
								<Grid >
									<Row style={{ marginLeft: 10, height: 23 }}>
										<Col size={1}>
											<Text style={{ color: 'grey' }}>*</Text>
										</Col>
										<Col size={10}>
											<Text style={{ fontSize: 14, color: 'grey', }}>Total product till date : <Text style={{ fontSize: 14 }}>{item.total_products} </Text></Text>
										</Col>
									</Row>
									<Row style={{ marginLeft: 10, height: 23 }}>
										<Col size={1}>
											<Text style={{ color: 'grey' }}>*</Text>
										</Col>
										<Col size={10}>
											<Text style={{ fontSize: 14, color: 'grey', }}>Product : <Text style={{ fontSize: 14 }}>{item.product_name} </Text></Text>
										</Col>
									</Row>
									<Row style={{ marginLeft: 10, height: 23 }}>
										<Col>
											<Text style={{ color: 'grey' }}>*</Text>
										</Col>
										<Col size={10}>
											<Text style={{ fontSize: 14, color: 'grey', }}>Coupons required for this scheme : <Text style={{ fontSize: 14 }}>{item.no_of_coupons_required} </Text></Text>
										</Col>
									</Row>
									<Row style={{ marginLeft: 10, height: 23 }}>
										<Col size={1}>
											<Text style={{ color: 'grey' }}>*</Text>
										</Col>
										<Col size={11}>
											<Text style={{ fontSize: 14, color: 'grey', }}>Total coupons scanned for this scheme : <Text style={{ fontSize: 14 }}>{item.totalNoOfCouponsRedeemed} </Text></Text>
										</Col>
									</Row>
									<Row style={{ marginLeft: 10, height: 23 }}>
										<Col size={1}>
											<Text style={{ color: 'grey' }}>*</Text>
										</Col>
										<Col size={10}>
											<Text style={{ fontSize: 14, color: 'grey', }}>Validity : <Text style={{ fontSize: 14 }}>Offer is valid from
                                                            <Text style={{ color: 'green', fontSize: 14 }}> {Moment(item.from_date).format('D-MMM-YYYY')}
													{""} <Text style={{ fontSize: 14 }}>till</Text> {""}
													<Text style={{ color: 'green', fontSize: 14 }}> {Moment(item.to_date).format('D-MMM-YYYY')}
													</Text></Text></Text></Text>
										</Col>
									</Row>
								</Grid>
							</Card>
						</TouchableOpacity>
					</View>

				)) :
					<View style={{ flex: 1, justifyContent: 'center' }}>
						<Text style={{ fontSize: 28, color: '#BDBDBD', textAlign: 'center', textAlignVertical: 'center' }}>{strings('login.NoHistory_Error')}</Text>
					</View>
				}
			</View>
		)
	}
	render() {
		return (
			<Container>
				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>
				<View style={{ flex: Dimensions.get('window').height * 0.00013 }}>
					<Grid style={{ margin: 5, }}>
						<Row style={{ flex: 0.1 }}>
							<Col size={1.05}>
								<Text style={{ fontSize: this.props.languageControl == "English" || this.props.languageControl == "English - (English)" ? 15 : 12,fontWeight: 'bold', height: 30 }}>{strings('login.coupon_history_fromDate')} : </Text>
							</Col>
							<Col size={1.05}>
								<DatePicker date={this.state.frmDate} mode="date" 
									locale={moment.locale('en')}
								format="DD-MM-YYYY" maxDate={moment().format('DD-MM-YYYY')}
									showIcon={false} confirmBtnText={"Done"} cancelBtnText={"Cancel"} onDateChange={(date) => { this.handleDatePicked(date) }}
									style={{ width: 90, height: 25, justifyContent: 'center' }}
									customStyles={{ dateInput: { borderWidth: 0, } }}
								/>
							</Col>
							<Col>
								<Text style={{ fontSize: this.props.languageControl == "English" || this.props.languageControl == "English - (English)" ? 15 : 12,fontWeight: 'bold', height: 30 }}>{strings('login.coupon_history_toDate')} : </Text>
							</Col>
							<Col>
								<DatePicker date={this.state.toDate} mode="date" 
									locale={moment.locale('en')}
								format="DD-MM-YYYY" maxDate={moment().format('DD-MM-YYYY')}
									showIcon={false} onDateChange={(date) => { this.handleDatePicked1(date) }} style={{ width: 90, height: 25, justifyContent: 'center' }}
									confirmBtnText={"Done"} cancelBtnText={"Cancel"} customStyles={{ dateInput: { borderWidth: 0, } }}
								/>
							</Col>
						</Row>
					</Grid>
				</View>
				<View>
					{this.state.fromDateError ?
						<View style={{ marginTop: 0, marginLeft: 20 }}>
							<Text style={{ color: 'red' }}>{this.state.fromDateError}</Text>
						</View>
						: <View></View>}
					{this.state.toDateError ?
						<View style={{ marginTop: 0, marginLeft: 20 }}>
							<Text style={{ color: 'red' }}>{this.state.toDateError}</Text>
						</View>
						: <View></View>}
					<View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', margin: 1, marginTop: 0,  }} />
				</View>

				<View style={{ margin: 10, marginTop: 0, }}>
					<Dropdown
						label={"All"}
						data={this.state.schemesList}
						baseColor="(default: rgba(0, 0, 0, 5))"
						onChangeText={(nameOfSelectedScheme) => this.callApi(nameOfSelectedScheme, this.state.schemesList)}
					/>
				</View>
				{this._displayList()}
			</Container>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		enableDarkTheme: state.VerifierReducer.enableDarkTheme,
		languageControl: state.VerifierReducer.languageEnglish,
	}
}
export default connect(mapStateToProps, null)(Tab2)