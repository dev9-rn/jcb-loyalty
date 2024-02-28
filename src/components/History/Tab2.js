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
import DatePicker from 'react-native-date-picker'
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
			selectedSchemeId: '',			
			open1:'',
			open2:''
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
        let a = moment(date).format("DD-MM-YYYY");
        let b = this.state.toDate;

        let fromDate = moment(`${a}T07:42:47.876Z` ,'DD-MM-YYYYTHH:mm:ss.SSS');
        let toDate = moment(`${b}T07:42:47.876Z` ,'DD-MM-YYYYTHH:mm:ss.SSS');

        console.log(fromDate , fromDate)
        this.setState({ redeemHistoryCashArr: [] }, () => {
            if (fromDate.isAfter(toDate)) {
                this.setState({ fromDateError: 'FromDate cannot be greater than toDate.', noMoreDataError: '',open1:false })
            } else {
                this.forceUpdate();
                this.setState({ fromDateError: '', toDateError: '', frmDate: a, frmDatePass: date,open1:false }, () => {
                    this.callApi();
                })
            }
        })
    };
    handleDatePicked1 = date => {
        console.log(date);
        console.log("=-=-=-=-=-=-=-=-=-=-=-=----=-======-=-=-=-=-=-=-=-==-=-=-=-=-=");
        this.setState({ redeemHistoryCashArr: [] }, () => {

            // let a = moment(date, 'DD-MM-YYYY');
            // let b = moment(this.state.frmDate, 'DD-MM-YYYY');

            let a = moment(date).format("DD-MM-YYYY");
            let b = this.state.frmDate;

            let fromDate = moment(`${b}T07:42:47.876Z` ,'DD-MM-YYYYTHH:mm:ss.SSS');
            let toDate = moment(`${a}T07:42:47.876Z` ,'DD-MM-YYYYTHH:mm:ss.SSS');

            if (toDate.isBefore(fromDate)) {
                this.setState({ toDateError: strings('login.FromDateError'), noMoreDataError: '',open2:false })
            } else {
                this.setState({ toDate: a, toDateError: '', fromDateError: '', toDatePass: date,open2:false }, () => {
                    this.callApi();
                })
            }
        })
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
						{/* <Row style={{ flex: 0.1 }}> */}
							<Col>
								<Text style={{ fontSize: this.props.languageControl == "English" || this.props.languageControl == "English - (English)" ? 15 : 12,fontWeight: 'bold', height: 30 }}>{strings('login.coupon_history_fromDate')} : </Text>
							</Col>
							<Col >
							<TouchableOpacity style={{}} onPress={() => { this.setState({ open1: true }) }}>
                             <Text onPress={() => { this.setState({ open1: true })} }  style={{ color:"#000000"}}>{this.state.frmDate}</Text>
                             </TouchableOpacity>
                            <DatePicker
                                modal
                                mode="date"
                                open={this.state.open1}
                                date={new Date(moment(`${this.state.frmDate}T07:42:47.876Z` ,'DD-MM-YYYYTHH:mm:ss.SSS').utc().toISOString())}
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
								{/* <DatePicker date={this.state.frmDate} mode="date" 
									locale={moment.locale('en')}
								format="DD-MM-YYYY" maxDate={moment().format('DD-MM-YYYY')}
									showIcon={false} confirmBtnText={"Done"} cancelBtnText={"Cancel"} onDateChange={(date) => { this.handleDatePicked(date) }}
									style={{ width: 90, height: 25, justifyContent: 'center' }}
									customStyles={{ dateInput: { borderWidth: 0, } }}
								/> */}
							</Col>
							<Col>
								<Text style={{ fontSize: this.props.languageControl == "English" || this.props.languageControl == "English - (English)" ? 15 : 12,fontWeight: 'bold', height: 30 }}>{strings('login.coupon_history_toDate')} : </Text>
							</Col>
							<Col>
							<TouchableOpacity style={{ }} onPress={() => { this.setState({ open2: true }) }}>
                             	<Text onPress={() => { this.setState({ open2: true })} }  style={{ color:"#000000"}}>{this.state.toDate}</Text>
                            </TouchableOpacity>
                            <DatePicker
                                modal
                                mode="date"
                                open={this.state.open2}
                                date={new Date(moment(`${this.state.toDate}T07:42:47.876Z` ,'DD-MM-YYYYTHH:mm:ss.SSS').utc().toISOString())}
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
								{/* <DatePicker date={this.state.toDate} mode="date" 
									locale={moment.locale('en')}
								format="DD-MM-YYYY" maxDate={moment().format('DD-MM-YYYY')}
									showIcon={false} onDateChange={(date) => { this.handleDatePicked1(date) }} style={{ width: 90, height: 25, justifyContent: 'center' }}
									confirmBtnText={"Done"} cancelBtnText={"Cancel"} customStyles={{ dateInput: { borderWidth: 0, } }}
								/> */}
							</Col>
						{/* </Row> */}
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