import React, { Component } from 'react';
import { Alert, FlatList, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity } from 'react-native';
import { Container, Header, Left, Body, Right, Content, ListItem, Card, CardItem, Text, Title, Item, Icon, Toast, Tab, Tabs } from 'native-base';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import Loader from '../../Utility/Loader';
import moment from 'moment';
import { Col, Grid, Row } from "react-native-easy-grid";
import { strings } from '../../locales/i18n';
import DatePicker from 'react-native-date-picker'
import { connect } from 'react-redux';
import * as utilities from "../../Utility/utilities";
import AsyncStorage from '@react-native-community/async-storage';
import { isMaintenance } from '../../services/MaintenanceService/MaintenanceService';

class ReportHistory extends Component {
    constructor(props) {
        super(props);
        this.reportDataa = []
        this.state = {
            reportData: [],
            loading: false,
            loaderText: 'Loading',
            offset: 0,
            frmDate: moment().format('DD-MM-YYYY'),
            toDate: moment().format('DD-MM-YYYY'),
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
            this.setState({ toDateError: strings('login.ToDateError') })
        } else if (a < b) {
            this.setState({ toDateError: strings('login.FromDateError') })
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
        if (this.props.languageControl) {
            formData.append('language', 'en');
        } else {
            formData.append('language', 'hi');
        }
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
                }
                else if (lResponseData.status == 404) {
                    this.setState({ noMoreDataError: strings('login.noMoreData') })
                    return;
                }
                else if (lResponseData.status == 200) {
                    console.log(lResponseData);
                    this.setState({ noMoreDataError: "", offset: lResponseData.offset })
                    this.reportDataa = lResponseData.reportedCouponHistory;
                    this.setState(this.state);
                }
            })
            .catch(async (error) => {
                await isMaintenance({navigation : this.props.navigation});
                console.log(error);
            });
    }

    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#fab032' }} hasTabs>
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
                <Header style={{ backgroundColor: '#fab032' }} hasTabs>
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
                                    <Text style={{ alignSelf: 'flex-start', fontSize: 14, color: this.props.enableDarkTheme ? 'white' : 'black' }}>Report Date : {moment(item.created).format('DD-MM-YYYY')}</Text>
                                    <Text style={{ alignSelf: 'flex-start', fontSize: 14, color: this.props.enableDarkTheme ? 'white' : 'black' }}>Serial No : {item.sr_no}</Text>
                                    <Text style={{ alignSelf: 'flex-start', fontSize: 14, color: this.props.enableDarkTheme ? 'white' : 'black' }}>Description: {item.description}</Text>
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
            <View style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? 'black' : 'white' }}>
                {this._showHeader()}
                <Loader
                    loading={this.state.loading}
                    text={this.state.loaderText}
                />
                <View style={{ flex: this.state.fromDateError || this.state.toDateError ? 0.2 : 0.1, marginTop: 5 }}>
                    {this.props.languageControl == 'Urdu - (اردو)' ?
                        <Grid style={{ margin: 10 }}>
                            <Col style={{ bottom: 7 }} size={1.2}>
                                {/* <DatePicker
                                    date={this.state.frmDate}
                                    mode="date"
                                    format="DD-MM-YYYY"
                                    maxDate={moment().format('DD-MM-YYYY')}
                                    showIcon={false}
                                    onDateChange={(date) => { this.handleDatePicked(date) }}
                                    customStyles={{
                                        dateInput: {
                                            borderWidth: 0,
                                            alignItems: 'flex-start',
                                            // marginRight: this.props.enableDarkTheme ? 65 : 0,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                    style={{ width: '100%' }}
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
                            <Col size={1.5}>
                                <Text style={{ textAlign: 'left', fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.report_history_fromDate')} : </Text>
                            </Col>

                            <Col style={{ bottom: 7 }}>
                                {/* <DatePicker
                                    date={this.state.toDate}
                                    mode="date"
                                    format="DD-MM-YYYY"
                                    maxDate={moment().format('DD-MM-YYYY')}
                                    showIcon={false}
                                    onDateChange={(date) => { this.handleDatePicked1(date) }}
                                    // style={{ width: 90, height: 25, justifyContent: 'center' }}
                                    customStyles={{
                                        dateInput: {
                                            borderWidth: 0,
                                            alignItems: 'flex-start',
                                            marginRight: this.props.enableDarkTheme ? 65 : 0,
                                            backgroundColor: 'white'
                                        }
                                    }}
                                    style={{ width: '190%' }}
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
                            <Col size={1}>
                                <Text style={{ fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.report_history_toDate')} : </Text>
                            </Col>
                        </Grid>
                        :
                        <View style={{ margin: 5, width: 90, flexDirection: "row", alignItems: "center", }}>
                            <Text style={{ fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.coupon_history_fromDate')} : </Text>
                            <View style={{ marginTop: 0 }}>
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
                            </View>
                            <View >
                                <Text style={{ fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>  {strings('login.coupon_history_toDate')} : </Text>
                            </View>
                            <View style={{ marginTop: 0 }}>                              
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
                            </View>
                        </View> 
                    }

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
                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20, margin: 10 }} />
                </View>
                {this._displayList()}
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