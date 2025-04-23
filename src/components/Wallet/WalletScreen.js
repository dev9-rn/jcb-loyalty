import React, { Component } from 'react';
import { Alert, FlatList, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, BackHandler, Modal } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Left, Body, Right, ListItem,  Text, Title,  Icon,  Button } from 'native-base';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import Loader from '../../Utility/Loader';
import moment from 'moment';
import { Col, Grid, Row } from "react-native-easy-grid";
import DateTimePicker from "react-native-modal-datetime-picker";
import DatePicker from 'react-native-date-picker';
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import * as utilities from '../../Utility/utilities';

class WalletScreen extends Component {

    constructor(props) {
        super(props);
        this.reportDataa = []
        this.state = {
            reportData: [],
            isRedeemModalVisible: false,
            modalVisible: false,
            responseMessage: '',
            redeemAmount: '',
            minimum_redeemption_amount : "",
            wallet_data : "",    
            minimum_redeemption_message : "",
            transaction_history : [],
            loading: false,
            loaderText: 'Loading',
            offset: 0,
            frmDate: moment().locale('en').format('DD-MM-YYYY'),
            toDate: moment().locale('en').format('DD-MM-YYYY'),
            noMoreDataError: '',
            distributorId: '',
            open1:false,
            open2:false

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
        console.log(date);
        this.reportDataa = []
        this.setState({ offset: 0, reportDataaState: [] })
        // let a = date;
        // let b = this.state.toDate
        let a = moment(date, 'DD-MM-YYYY');
        let b = moment(this.state.toDate, 'DD-MM-YYYY');

        if (moment(a).isAfter(b)) {
            this.setState({ fromDateError: 'FromDate cannot be greater than toDate.', noMoreDataError: '',open1:false  })
        } else {
            this.forceUpdate();
            this.setState({ fromDateError: '', toDateError: '', frmDate: a.format("DD-MM-yyyy"),open1:false }, () => {
                this._callApiForReportHistory(this.state.distributorId);
            })
        }
        // this.setState({ frmDate: date })
        // this.hideDateTimePicker();
    };
    handleDatePicked1 = date => {
        this.reportDataa = []
        this.setState({ offset: 0, reportDataaState: [] })
        let a = moment(date, 'DD-MM-YYYY');
        // let b = this.state.frmDate;
        let b = moment(this.state.frmDate, 'DD-MM-YYYY');

        console.log(a);
        console.log(b);
        console.log(moment(a).isBefore(b));


        if (a < b) {
            this.setState({ toDateError: strings('login.FromDateError'), noMoreDataError: '',open2:false })
        } else {
            this.setState({ toDate: a.format("DD-MM-yyyy"), toDateError: '', fromDateError: '',open2:false }, () => {
                this._callApiForReportHistory(this.state.distributorId);
            })
        }
        // this.hideDateTimePicker();
    };

    handleUpdateBankDetails = () => {
        this.setState({ modalVisible: false, })
        this.props.navigation.navigate('BankDetailScreen');
        // Logic to navigate to update bank details
        // setModalVisible(false);
        // Add navigation or other logic here
      };

    handleSubmitAmount = () => {
        const { redeemAmount, wallet_data, minimum_redeemption_amount, distributorId } = this.state;
    
        if (parseFloat(redeemAmount) > parseFloat(wallet_data)) {
            Alert.alert('Error', 'Entered amount exceeds wallet balance.');
        } else if (parseFloat(redeemAmount) < parseFloat(minimum_redeemption_amount)) {
            Alert.alert('Error', 'Entered amount is less than the minimum redemption amount.');
        } else {
            this.setState({ loading: true });
    
            const formData = new FormData();
            formData.append('distributorId', distributorId);
            formData.append('amount', redeemAmount);
    
            var lUrl = URL + 'redeemRequest';
            fetch(lUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'apikey': APIKEY,
                    'accesstoken': ACCESSTOKEN
                },
                body: formData,
            })
            .then((response) => response.json())
            .then((lResponseData) => {
                console.log(lResponseData);
    
                this.setState({ loading: false });
                if (!lResponseData) {
                    utilities.showToastMsg('Something went wrong. Please try again later');
                } else if (lResponseData.status == 500 || lResponseData.status == 403) {
                    this.setState({ noMoreDataError: "" });
                    utilities.showToastMsg(lResponseData.message);
                }  else if (lResponseData.status == 400) {
                    this.setState({ noMoreDataError: "" });
                    this.setState({ isRedeemModalVisible: false, redeemAmount: '' });
                    // utilities.showToastMsg(lResponseData.message);
                    // setResponseMessage(lResponseData.message);
                    this.setState({ modalVisible: true, responseMessage: lResponseData.message });
                } else if (lResponseData.status == 404) {
                    this.setState({ noMoreDataError: "No more data." });
                    return;
                } else if (lResponseData.status == 200) {
                    console.log(lResponseData);
                    Alert.alert('Success', 'Redemption successful!');
                    this.setState({ isRedeemModalVisible: false, redeemAmount: '' });
    
                    // Refresh the page to get the latest data
                    this._callApiForReportHistory(distributorId);
                }
            })
            .catch((error) => {
                console.log(error);
                this.setState({ loading: false });
            });
        }
    };

   

    componentDidMount = () => {
        this._getAsyncData();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.props.navigation.navigate('HomeScreen');
        return true;
    }

    _callApiForReportHistory = (distributorId) => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('distributorId', distributorId);
        // formData.append('fromDate', this.state.frmDate);
        // formData.append('toDate', this.state.toDate);
        // formData.append('offset', this.state.offset);
        // formData.append('userType', 0);
        // formData.append('redeemType', 0);

        console.log(formData);


        var lUrl = URL + 'getRedeemWalletHistory';
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
                    this.setState({ noMoreDataError: "", offset: lResponseData.offset , minimum_redeemption_amount: lResponseData.minimum_redeemption_amount , wallet_data: lResponseData.wallet_data , transaction_history: lResponseData.data , minimum_redeemption_message: lResponseData.minimum_redeemption_message})
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
                        <Title style={{ textAlign: 'center', color: '#FFFFFF' }}>{strings('login.sidemenu_mywallet')}</Title>
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
                        <Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.sidemenu_mywallet')}</Title>
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

    renderTransactionItem = ({ item }) => (
        <View 
            style={styles.transactionContainer}
        >
            <View style={{ flex: 1 , marginBottom:26 }}>
                <Text 
                    style={styles.requestNoText}
                >
                    {item.request_no}
                </Text>
                <Text 
                    style={styles.dateText}
                >
                    {moment(item.created_date).format('DD-MM-YYYY h:mm A')}
                </Text>
                <Text style={{fontSize:14}}
            >
                Status: <Text  style={[
                    styles.statusText, 
                    {
                        color: item.status === 'Pending' ? '#CC5500' : '#32a852',
                        backgroundColor: item.status === 'Pending' ? '#FFF5EE' : '#f9efee'
                    }
                ]}>{item.status}</Text>
            </Text>
            </View>
            <View>
                <Text 
                    style={[
                        styles.amountText,
                        {
                            color: item.status === 'Pending' ? '#CC5500' : '#32a852',
                            backgroundColor: item.status === 'Pending' ? '#FFF5EE' : '#f9efee'
                        }
                    ]}
                >
                    {item.amount}
                </Text>
            </View>
        </View>
    );

    renderRedeemModal() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.isRedeemModalVisible}
                onRequestClose={() => this.setState({ isRedeemModalVisible: false, redeemAmount: '' })}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter amount"
                            keyboardType="numeric"
                            value={this.state.redeemAmount}
                            onChangeText={(text) => this.setState({ redeemAmount: text })}
                        />
                        <View style={styles.modalButtons}>
                            <Button
                                style={[styles.submitButton, this.state.redeemAmount ? {} : { backgroundColor: 'gray' }]}
                                onPress={this.handleSubmitAmount}
                                disabled={!this.state.redeemAmount}  // Submit button is disabled if input is empty
                            >
                                <Text style={styles.buttonText}>Submit</Text>
                            </Button>
                            <Button
                                style={styles.cancelButton}
                                onPress={() => this.setState({ isRedeemModalVisible: false, })}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    renderBankModal() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => this.setState({ modalVisible: false, })}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                    <Text style={styles.modalMessage}>{this.state.responseMessage}</Text>
                       
                        <View style={styles.modalButtons}>
                            <Button
                                style={styles.submitButton}
                                onPress={this.handleUpdateBankDetails}
                            >
                                <Text style={styles.buttonText1}>Update Details</Text>
                            </Button>
                            <Button
                                style={styles.cancelButton}
                                onPress={() => this.setState({ modalVisible: false,})}
                            >
                                <Text style={styles.buttonText1}>Okay</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
    render() {
        return (

            <View style={{ flex: 1 , backgroundColor: '#0000FF' }}>
                {this._showHeader()}
                <Loader
                    loading={this.state.loading}
                    text={this.state.loaderText}
                />
                <View style={{ }}>
					<View style={{ marginTop: 20, paddingLeft: 20, marginBottom:20 }}>
                        <Text style={{ alignSelf: 'flex-start', fontSize: 14 , color:'#FAF9F6' , paddingBottom:6 }}>Available Balance </Text>
                        <Text style={{ alignSelf: 'flex-start', fontSize: 30 , color:'#fff' , paddingBottom:6, fontWeight:'bold' }}>{this.state.wallet_data} Points</Text>
                        <Text style={{ alignSelf: 'flex-start', fontSize: 12 , color:'#FAF9F6' , paddingBottom:2, paddingTop:12 }}>{this.state.minimum_redeemption_message}</Text>
                        {
                        this.state.wallet_data >= this.state.minimum_redeemption_amount ? (
                            <TouchableOpacity
                            style={styles.buttonSignUp}
                            onPress={() => this.setState({ isRedeemModalVisible: true })}
                            >
                            <LinearGradient colors={['#fff', '#fff', '#fff']} style={styles.linearGradient}>
                                <Text style={styles.buttonTextSignUp}>Redeem Points</Text>
                            </LinearGradient>
                            </TouchableOpacity>  
                        ) : null
                        }
					</View>
                    {this.renderRedeemModal()}
                    {this.renderBankModal()}

                </View>
                <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: 'transparent',marginBottom:0 }}>
					<View style={{ marginTop: 20, paddingLeft: 20, marginBottom:20 }}>
						<Text style={{ alignSelf: 'flex-start', fontSize: 24 , color:'#0000FF' , paddingBottom:6, fontWeight:'bold' }}>My Redeemptions</Text>
						<FlatList
                            data={this.state.transaction_history}
                            renderItem={this.renderTransactionItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ margin: 10 }}
                        />
					</View>

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
	buttonSignUp: {
		marginTop: 14,
			marginBottom: 14,
			backgroundColor: '#0000FF',
			width: '40%',
	},
	linearGradient:{
		borderRadius: 24,
		borderWidth: 1,  
			borderColor: '#0000FF',
	},
	buttonTextSignUp: {
		padding: 8,
		color: '#0000FF',
		textAlign: 'center',
        fontWeight:'bold',
        fontSize:14,
		
	},
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    submitButton: {
        marginRight: 10,
        backgroundColor: '#0000FF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    buttonText1: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
      },
    transactionContainer: {
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    requestNoText: {
        alignSelf: 'flex-start',
        fontSize: 16,
        color: '#000',
        paddingBottom: 6,
        fontWeight: 'bold',
    },
    dateText: {
        alignSelf: 'flex-start',
        fontSize: 12,
        color: '#323232',
        paddingBottom: 6,
        fontWeight: 'bold',
    },
    statusText: {
        alignSelf: 'flex-start',
        fontSize: 12,
        fontWeight: 'bold',
    },
    amountText: {
        alignSelf: 'flex-start',
        fontSize: 14,
        paddingHorizontal: 12,
        paddingVertical: 4,
        fontWeight: 'bold',
    }
})
const mapStateToProps = (state) => {
    return {
        enableDarkTheme: state.VerifierReducer.enableDarkTheme,
        languageControl: state.VerifierReducer.languageEnglish,
    }
}

export default connect(mapStateToProps, null)(WalletScreen)

