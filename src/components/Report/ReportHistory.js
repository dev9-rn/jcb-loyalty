import React, { Component } from 'react';
import { Alert, FlatList, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Left, Body, Right, Content, ListItem, Card, CardItem, Text, Title, Item, Icon, Toast, Tab, Tabs } from 'native-base';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import Loader from '../../Utility/Loader';
import moment from 'moment';
import { Col, Grid, Row } from "react-native-easy-grid";
import DateTimePicker from "react-native-modal-datetime-picker";
import DatePicker from 'react-native-datepicker';
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';

class ReportHistory extends Component {

    constructor(props) {
        super(props);
        this.reportDataa = []
        this.state = {
            reportData: [],
            loading: false,
            loaderText: 'Loading',
            offset: 0,
            frmDate: moment().locale('en').format('DD-MM-YYYY'),
            toDate: moment().locale('en').format('DD-MM-YYYY'),
            noMoreDataError: '',
            distributorId: ''
        }
    }
    async _getAsyncData() {
        await AsyncStorage.getItem('USERDATA', (err, result) => {		// USERDATA is set on SignUP screen
            var lData = JSON.parse(result);
            if (lData) {
                this.setState({ distributorId: lData.data.id }, () => {
                    this._callApiForReportHistory(lData.data.id);
                })
            }
        });
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
            this._callApiForReportHistory(this.state.distributorId);
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
            this._callApiForReportHistory(this.state.distributorId);
        }
        this.setState({ toDate: a })
        this.hideDateTimePicker();
    };

    componentDidMount = () => {
        this._getAsyncData();
    }

    _callApiForReportHistory = (distributorId) => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('distributorId', distributorId);
        formData.append('fromDate', this.state.frmDate);
        formData.append('toDate', this.state.toDate);
        formData.append('offset', this.state.offset);

        console.log(formData);


        var lUrl = URL + 'getReportedCouponHistory';
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
            .then((lResponseData) => {
                console.log(lResponseData);

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
                    console.log(lResponseData);
                    this.setState({ noMoreDataError: "", offset: lResponseData.offset })
                    this.reportDataa = lResponseData.reportedCouponHistory;
                    this.setState(this.state);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#0000FF' }} hasTabs>
                    <Left style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.6, alignItems: 'center' }}>
                        <Title style={{ textAlign: 'center', color: '#FFFFFF' }}>{strings('login.report_history_title')}</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>
                    </Right>
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: '#0000FF' }} hasTabs>
                    <Left style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.6, alignItems: 'center' }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.report_history_title')}</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>

                    </Right>
                </Header>
            )
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
            this._callApiForReportHistory(this.state.distributorId);
        }
    };
    _displayList() {
        if (this.reportDataa.length == 0) {
            return (
                <View style={styles.container}>
                    <Text style={{ fontSize: 28, color: '#BDBDBD' }}>{strings('login.NoHistory_Error')}</Text>
                </View>
            )
        } else if (this.reportDataa.length > 0) {
            return (
                <FlatList
                    data={this.reportDataa}
                    extraData={this.state}
                    renderItem={({ item, index }) => (
                        <ListItem key={index} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Grid>
                                <Col size={2}>
                                    <Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Report Date : {moment(item.created).format('DD-MM-YYYY')}</Text>
                                    <Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Serial No : {item.sr_no}</Text>
                                    <Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Description: {item.description}</Text>
                                </Col>
                                <Col style={{ alignItems: 'flex-end' }}>
                                    <Image
                                        source={{ uri: item.coupon_image }}
                                        style={{ width: 100, height: 100 }}
                                    />
                                </Col>
                            </Grid>
                        </ListItem>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={this.renderFooter.bind(this)}
                    onEndReachedThreshold={0.1}
                    onEndReached={this.handleLoadMore.bind(this)}
                />
            )
        }
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {this._showHeader()}
                <Loader
                    loading={this.state.loading}
                    text={this.state.loaderText}
                />
                <View style={{ flex: this.state.fromDateError || this.state.toDateError ? 0.2 : 0.1, marginTop: 5 }}>
                    <Grid style={{ marginTop: 10, margin: 10 }}>
                        <Col size={2.5}>
                            <Text style={{ fontSize: this.props.languageControl == "English" || this.props.languageControl == "English - (English)" ? 15 : 12,fontWeight: 'bold', height:30}}>{strings('login.report_history_fromDate')} : </Text>
                        </Col>
                        <Col size={3} >
                            <DatePicker
                                date={this.state.frmDate}
                                confirmBtnText={"Done"}
                                cancelBtnText={"Cancel"}
                                mode="date"
                                format="DD-MM-YYYY"
                                locale={moment.locale('en')}
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
                            <Text style={{ fontSize: this.props.languageControl == "English" || this.props.languageControl == "English - (English)" ? 15 : 12,fontWeight: 'bold', height:30}}>{strings('login.coupon_history_toDate')} : </Text>
                        </Col>
                        <Col size={3}>
                            <DatePicker
                                date={this.state.toDate}
                                confirmBtnText={"Done"}
                                cancelBtnText={"Cancel"}
                                mode="date"
                                format="DD-MM-YYYY"
                                locale={moment.locale('en')}
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
                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 0, margin: 10, }} />
                </View>
                <View style={{ flex: 1, marginTop: 10 }}>
                    {this._displayList()}
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
})
const mapStateToProps = (state) => {
    return {
        enableDarkTheme: state.VerifierReducer.enableDarkTheme,
        languageControl: state.VerifierReducer.languageEnglish,
    }
}
export default connect(mapStateToProps, null)(ReportHistory)