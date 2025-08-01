import React, { Component } from 'react';
import { Alert, BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity, StatusBar, Animated, ScrollView, Easing } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Modal from "react-native-modal";
import ScanService from '../../services/ScanService/ScanService';
import Loader from '../../Utility/Loader';
// import * as utilities from '../../Utility/utilities';
import * as app from '../../App';
import Moment from 'moment';
import { Col, Row, Grid } from "react-native-easy-grid";
import { RNCamera } from 'react-native-camera';
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
var Sound = require('react-native-sound');
import ImagePicker from 'react-native-image-picker'
// import ViewShot from "react-native-view-shot";
import * as utilities from "../../Utility/utilities";
import AsyncStorage from '@react-native-community/async-storage';
// import Dialog from "react-native-animated-dialog";
import { open } from 'react-native-file-viewer';

var redeemMethodsT = [];
class ScanScreen extends Component {
    constructor(props) {
        super(props);
        console.log("Scanscreen.js");
        this.distributorId;
        this.animatedValue = new Animated.Value(0)
        // redeemMethodsT = [];
        this.qrText;
        this.state = {
            userId: '',
            userName: '',
            flashEnabled: false,
            loading: false,
            showCamera: true,
            showCameraText: true,
            showModal: false,
            isModalVisible: false,
            loaderText: 'Scanning...',
            redeemType: '',
            redeemMethods: [],
            offerDetails: {},
            userType: '',
            flash: '',
            checkForPayment: '',
            animatedWidth: new Animated.Value(0),
            animatedHeight: new Animated.Value(0),
            isSuccess: false,
            reactivateScanner: 3000,
            scanningTitle: '',
            scanningBody: '',
            cashDetails: '',
            loyaltyPoints: '',
            currencySymbol:'\u20B9',
           
        };
    }
    componentWillMount() { this._getAsyncData(); }
    componentDidMount = () => {
        // this.refs.viewShot.capture().then(uri => {
        //     console.log("do something with ", uri);
        //   });

        this.didFocusSubscription = this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.setState({ showCamera: true });
            }
        );
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        this.didFocusSubscription.remove();
    }
    handleBackPress = () => {
        this.props.navigation.navigate('HomeScreen');
        return true;
    }
    closeActivityIndicator() {
        setTimeout(() => {
            this.setState({ loading: false });
        });
    }
    async _getAsyncData() {
        await AsyncStorage.getItem('USERDATA', (err, result) => {
            var lData = JSON.parse(result);
            if (lData) {
                this.distributorId = lData.data.id;
                this.setState({ userType: lData.data.userType, checkForPayment: lData.data.payment_option })
            }
        });
    }
    _showModalOffer() { 
        this.setState({ modalValue: 'offers', isModalVisible: !this.state.isModalVisible });
        this._callForAPIRedeem()
     }
    onSuccess(e) {
        console.log("=-=-=-=00000");
        console.log(e);

        this.setState({ showCamera: false, showCameraText: false });
        this._callForAPICheckCoupon(e); 
        // setTimeout(() => { 
        //     this.props.navigation.navigate('HomeScreen', { minutes:  10 } );
        // },2000);
        

    }
    async _callForAPIRedeem() {
        this.setState({ isModalVisible: !this.state.isModalVisible, isCheckedScheme: false, isCheckedCash: false });
        let redeemType = this.state.redeemType;
        console.log(redeemType);

        // if (this.state.isCheckedScheme) {
        //     redeemType = '1';
        // } else if (this.state.isCheckedCash) {
        //     redeemType = '0';
        // } else {

        //     Alert.alert(
        //         'Error',
        //         'Select any one redeemtion method',
        //         [
        //             { text: 'BACK', onPress: () => { this.props.navigation.navigate('HomeScreen') } },
        //             { text: 'CONTINUE', onPress: () => { this.setState({ errorRedeem: true, showCamera: true }) } },
        //         ],
        //         { cancelable: true }
        //     )
        // }
        if (redeemType || redeemType === 0) {
            console.log("1");
            const formData = new FormData();
            formData.append('qrText', this.qrText);
            formData.append('distributorId', this.distributorId);
            formData.append('redeemType', redeemType);
            formData.append('userType', this.state.userType);
            if (this.props.languageControl) {
                formData.append('language', 'en');
            } else {
                formData.append('language', 'hi');
            }
            console.log(formData);

            var scanApiObj = new ScanService();
            this.setState({ loading: true, loaderText: "Loading..." });
            if (this.state.userType == 0){
                await scanApiObj.redeemCoupon(formData);
            } else {
                await scanApiObj.redeemCouponV1(formData);
            }
            
            var lResponseData = scanApiObj.getRespData();
            console.log(lResponseData);
            await this.closeActivityIndicator();
            if (!lResponseData) {
                alert('Something went wrong. Please try again later');
            } else if (lResponseData.status == 500 || lResponseData.status == 400 || lResponseData.status == 422
                || lResponseData.status == 503 || lResponseData.status == 451) {
                console.log("1");
                alert(lResponseData.message);
            } else if (lResponseData.status == 403) {
                alert(lResponseData.message);
                this.props.navigation.navigate('LoginScreen');
                AsyncStorage.clear();
                return;
            }
            else if (lResponseData.status == 200) {
                // alert(lResponseData.message);
                this.animatedBox(lResponseData.message);
                this.setState({ showCamera: true });
                // this.props.navigation.navigate('ScanScreen');

            } else {
                alert('Something went wrong. Please try again later');
            }
        }
    }
    async _callForAPICheckCoupon(e) {
        if (this.props.pymOpn == '0') {
            Alert.alert(
                strings('login.ScanScreenAlertTitle'),
                strings('login.ScanScreenAlertContent'),
                [
                    { text: strings('login.OK'), onPress: () => { this.props.navigation.navigate('PaymentDetailsScreen') } },
                ],
                { cancelable: true }
            )
            return;
        } else {
            this.qrText = e.data;
            const formData = new FormData();
            formData.append('qrText', e.data);
            formData.append('distributorId', this.distributorId);
            formData.append('userType', this.state.userType);
            if (this.props.languageControl) {
                formData.append('language', 'en');
            } else {
                formData.append('language', 'hi');
            }
            console.log("0000");
            console.log(formData);

            var scanApiObj = new ScanService();
            this.setState({ loading: true, loaderText: "Loading..." });
            await scanApiObj.checkCoupon(formData);
            var lResponseData = scanApiObj.getRespData();

            console.log(lResponseData, "000");

            await this.closeActivityIndicator();
            debugger
            if (!lResponseData) {
                alert('Something went wrong. Please try again later');
            } else if (lResponseData.status == 500 || lResponseData.status == 400 || lResponseData.status == 422
                || lResponseData.status == 501 || lResponseData.status == 451) {
                    // alert(lResponseData.message)
                    this.animatedBoxForDanger(lResponseData.message)
                return;
            } 
            else if (lResponseData.status == 503) {
                // this.animatedBoxForDanger(lResponseData.minutes)
                console.log(lResponseData.minutes);
                this.props.navigation.navigate('HomeScreen',{ minutes:  lResponseData.minutes }); 
                return;
            } 
           
            else if (lResponseData.status == 200) {
                redeemMethodsT = lResponseData.redeemMethods;
                this.setState({ redeemMethods: lResponseData.redeemMethodsT, redeemType: redeemMethodsT[0].redeem_type })
                for (var i = 0; i < redeemMethodsT.length; i++) {
                    if (redeemMethodsT[i].redeem_type == "1") {
                        this.setState({ offerDetails: redeemMethodsT[i].details });
                    } else if (redeemMethodsT[i].redeem_type == "0") {
                        this.setState({ cashDetails: redeemMethodsT[i].details.value, loyaltyPoints: redeemMethodsT[i].points }, () => console.log(this.state.cashDetails));
                    }
                }
                this._showModalOffer();
            } else {
                alert('Something went wrong. Please try again later');
            }
        }
    }

    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#fab032' }}>
                    <Left style={{ flex: 0.5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.7 }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.scan_screen_title')}</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => { this._openFlash() }}>
                            {this.state.flashEnabled ?
                                <Icon type="FontAwesome" name="lightbulb-o" style={{ fontSize: 25, color: 'yellow', paddingLeft: 10, paddingRight: 10 }} />
                                :
                                <Icon type="FontAwesome" name="lightbulb-o" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                            }
                        </TouchableOpacity>
                    </Right>
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: '#fab032' }}>
                    <Left style={{ flex: 0.5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.7 }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>{strings('login.scan_screen_title')}</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => { this._openFlash() }}>
                            {this.state.flashEnabled ?
                                <Icon type="FontAwesome" name="lightbulb-o" style={{ fontSize: 25, color: 'yellow', paddingLeft: 10, paddingRight: 10 }} />
                                :
                                <Icon type="FontAwesome" name="lightbulb-o" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                            }
                        </TouchableOpacity>
                    </Right>
                </Header>
            )
        }
    }

    _showModal() {
        if (Platform.OS == 'ios') {
            if (this.state.isModalVisible) {
                return (
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <ScrollView style={{ width: 350, paddingTop: 20 }} keyboardShouldPersistTaps="always">
                            <Card style={{ flex: 1, borderRadius: 7, padding: 20, }}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{strings('login.couponDetails')}{'\n'}</Text>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
                                {this.state.redeemType === '1'
                                    ? <View style={{ paddingBottom: 10, flexDirection: 'row' }}>
                                    </View>
                                    :
                                    <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row' }}>
                                        <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                        {/* {this.state.redeem_type} */}
                                    </View>
                                }
                                {this.state.redeemType === '1' ?
                                    <View style={{ flex: 1, }}>

                                        <Grid >
                                            <Row style={{ marginLeft: 10 }}>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.tit')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.title} </Text></Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginLeft: 10 }}>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>Description : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.gift} </Text></Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginLeft: 10 }}>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.validity')} : <Text style={{ fontSize: 14 }}>{strings('login.offer')}
                                                        <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.from_date).format('D-MMM-YYYY')}
                                                            {""} <Text style={{ fontSize: 14 }}>{strings('login.til')}</Text> {""}
                                                            <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.to_date).format('D-MMM-YYYY')}
                                                            </Text></Text></Text></Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginLeft: 10 }}>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>Target-- : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.target} </Text></Text>
                                                </Col>
                                            </Row>
                                            <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20 }} />
                                        </Grid>
                                    </View>
                                    :
                                    <View></View>
                                }
                                <View style={{ paddingTop: 20, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this._callForAPIRedeem() }}>
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.REDEEM')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { this.setState({ isModalVisible: !this.state.isModalVisible, showCamera: true, showCameraText: true, isCheckedScheme: false, isCheckedCash: false }) }}>
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.CANCEL')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        </ScrollView>
                    </View>
                )
            }
        } else {
            return (
                <Modal isVisible={this.state.isModalVisible} style={{ paddingTop: 50 }}>
                    <View style={{ flex: 1, }}>
                        <ScrollView>
                            <Card style={{ flex: 1, borderRadius: 7, padding: 20, }}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{strings('login.couponDetails')}{'\n'}</Text>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
                                {this.state.redeemType === '1'
                                    ? <View style={{ paddingBottom: 10, flexDirection: 'row' }}>
                                    </View>
                                    :
                                    <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row' }}>
                                        <Grid>
                                            {/* <Row>
                                                <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                            </Row>
                                            <Row style={{ marginTop: 10 }}>
                                                <Col size={1.3}>
                                                    <Text style={{ textAlign: 'right', flex: 1, }}>Amount : </Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ flex: 1, textAlign: 'left' }}><Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginTop: 10 , backgroundColor:'red' , justifyContent:'center'}}>
                                                <Col size={1.3}>
                                                    <Text style={{ textAlign: 'right', flex: 1, }}>Loyalty Points : </Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ flex: 1, textAlign: 'left' }}>{this.state.loyaltyPoints}</Text>
                                                </Col>
                                            </Row> */}
                                            <Row>
                                                <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                            </Row>

                                            {this.props.languageControl == 'Urdu - (اردو)' ?
                                                <Grid>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}> : {strings('login.amt')}</Text>
                                                        <Text style={{}}><Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                    </Row>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}> : {strings('login.LoPoints')}</Text>
                                                        <Text style={{}}>{this.state.loyaltyPoints}</Text>
                                                    </Row>
                                                </Grid>
                                                :
                                                <Grid>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.amt')}</Text>
                                                        <Text style={{}}> : <Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                    </Row>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.LoPoints')}</Text>
                                                        <Text style={{}}> : {this.state.loyaltyPoints}</Text>
                                                    </Row>
                                                </Grid>
                                            }
                                        </Grid>
                                    </View>
                                }
                                {this.state.redeemType === '1' ?
                                    <View style={{ flex: 1, }}>
                                        <Grid style={{ marginLeft: 30 }}>
                                            {this.props.languageControl == 'Urdu - (اردو)' ?
                                                <Grid>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.tit')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.title} </Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.prodName')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.product_name} </Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalProd')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_products} </Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalBox')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_boxes} </Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.validity')} : <Text style={{ fontSize: 14 }}>{strings('login.offer')}
                                                            <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.from_date).format('D-MMM-YYYY')}
                                                                {""} <Text style={{ fontSize: 14 }}>{strings('login.til')}</Text> {""}
                                                                <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.to_date).format('D-MMM-YYYY')}
                                                                </Text></Text></Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20 }} />
                                                </Grid>
                                                :
                                                <Grid>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.tit')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.title} </Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.prodName')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.product_name} </Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalProd')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_products} </Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalBox')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_boxes} </Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.validity')} : <Text style={{ fontSize: 14 }}>{strings('login.offer')}
                                                                <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.from_date).format('D-MMM-YYYY')}
                                                                    {""} <Text style={{ fontSize: 14 }}>{strings('login.til')}</Text> {""}
                                                                    <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.to_date).format('D-MMM-YYYY')}
                                                                    </Text></Text></Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20 }} />
                                                </Grid>
                                            }
                                        </Grid>
                                    </View>
                                    :
                                    <View></View>
                                }
                                <View style={{ paddingTop: 20, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this._callForAPIRedeem() }}>
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.REDEEM')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { this.setState({ isModalVisible: !this.state.isModalVisible, showCamera: true, showCameraText: true, isCheckedScheme: false, isCheckedCash: false }) }}>
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.CANCEL')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        </ScrollView>
                    </View>
                </Modal>
            )
        }
    }
    _openFlash = async () => {
        this.setState(prevState => ({
            flashEnabled: !prevState.flashEnabled
        }), () => {
            if (this.state.flashEnabled) {
                this.setState({ flash: RNCamera.Constants.FlashMode.torch })
            } else {
                this.setState({ flash: RNCamera.Constants.FlashMode.off })
            }
        });
    }

    animatedBox = (msg) => {
        this.setState({ isSuccess: true, 
            reactivateScanner: 5000, 
            showCamera: true, 
            scanningTitle: 'SUCCESS', 
            scanningBody: msg  }, () => {
            var whoosh = new Sound('eventually.mp3', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                } else {
                    whoosh.play();
                }
            });
           
            Animated.timing(this.state.animatedWidth, {
                toValue: 300,
                duration: 500
            }).start()
            Animated.timing(this.state.animatedHeight, {
                toValue: 300,
                duration: 500
            }).start()
            this.animate()
            setTimeout(() => {
                Animated.timing(this.state.animatedWidth, {
                    toValue: 0,
                    duration: 400
                }).start()
                Animated.timing(this.state.animatedHeight, {
                    toValue: 0,
                    duration: 400
                }).start()
            }, 2000);
        })
    }
    animate() {
        this.animatedValue.setValue(0)
        Animated.timing(
            this.animatedValue,
            {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear
            }
        ).start(() => this.animate())
    }
    animatedBoxForDanger = (msg) => {
        this.setState({ isSuccess: false, reactivateScanner: 3000, showCamera: true, scanningTitle: 'FAILURE', 
        scanningBody: msg } , () => {
            var whoosh = new Sound('system_fault.mp3', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                } else {
                    whoosh.play();
                }
            });
            Animated.timing(this.state.animatedWidth, {
                toValue: 300,
                duration: 500
            }).start()
            Animated.timing(this.state.animatedHeight, {
                toValue: 300,
                duration: 500
            }).start()
            this.animate()
            setTimeout(() => {
                Animated.timing(this.state.animatedWidth, {
                    toValue: 0,
                    duration: 400
                }).start()
                Animated.timing(this.state.animatedHeight, {
                    toValue: 0,
                    duration: 400
                }).start()
            }, 2000);
        })
    }
    animateForDanger() {
        this.animatedValue.setValue(0)
        Animated.timing(
            this.animatedValue,
            {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear
            }
        ).start(() => this.animateForDanger())
    }
    takePicture = async () => {
        try {
            const options = { quality: 0.5, pauseAfterCapture: true };
            const data = await this.camera.takePictureAsync(options);
            this.setState({ path: data.uri, data: data });
            console.log('Path to image: ' + data.uri);
        } catch (err) {
            console.log('err: ', err);
        }
    };
    render() {
        const opacity = this.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0]
        })
        
        return (
            <View style={styles.container}>
                {this._showHeader()}
                <StatusBar
                    barStyle="light-content"
                />
                <Loader
                    loading={this.state.loading}
                    text={this.state.loaderText}
                />
                {this.state.showCamera && this.state.flashEnabled ?
                    <QRCodeScanner
                        onRead={this.onSuccess.bind(this)}
                        cameraStyle={{ width: '100%', height: '100%' }}
                        showMarker={true}
                        flashMode={RNCamera.Constants.FlashMode.torch}
                        reactivate={true}
                        reactivateTimeout={this.state.reactivateScanner}
                    />
                    : <View></View>
                }
                {!this.state.flashEnabled ?
                    // <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
                    //     <Text>...Something to rasterize...</Text>
                    // </ViewShot>
                    <QRCodeScanner
                        onRead={this.onSuccess.bind(this)}
                        cameraStyle={{ width: '100%', height: '100%' }}
                        showMarker={true}
                        reactivate={true}
                        reactivateTimeout={this.state.reactivateScanner}
                    />
                    : <View />
                }
                {this.state.showCameraText ?
                    <View>
                        <Text style={{ position: 'absolute', bottom: 50, left: Dimensions.get('window').width * 0.1, zIndex: 1, color: '#FFFFFF' }}>Point the camera at QR code.</Text>
                    </View>
                    :
                    <View></View>
                }
                <Animated.View style={[{ backgroundColor: this.state.isSuccess ? '#009900' : 'red', position: 'absolute', marginTop: '45%', left:30 }, { width: this.state.animatedWidth, height: this.state.animatedHeight }]}>
                    {/* <Animated.View style={{ opacity }}> */}
                    {this.state.isSuccess ?
                        <Icon type="FontAwesome" name="check-circle-o" style={{ fontSize: 45, color: '#FFFFFF', textAlign: 'center', marginTop: 10 }} />
                        :
                        <Icon type="FontAwesome" name="times-circle-o" style={{ fontSize: 45, color: '#FFFFFF', textAlign: 'center', marginTop: 10 }} />
                    }
                    {/* </Animated.View> */}
                    
                    <Text style={{ color: 'white', fontSize: 22, textAlign: 'center', textAlignVertical: 'center', flex: 1, }}>{this.state.scanningTitle}</Text>
                   
                    {/* <Grid> */}
                    {/* <Row fullHeight  style={{  height:'60%' ,  }}> */}
                        
                            {/* <Text style={{ fontSize: 18, textAlign: 'center',color: 'white' }}> Product: </Text> */}
                            {/* <Text style={{fontSize: 18, textAlign: 'left', color: 'white' ,fontWeight:"bold"}}>{this.state.offerDetails.product_name}</Text> */}
                             {/* <Text style={{ fontSize: 18,  textAlign: 'center',color: 'white' ,fontWeight:"bold", flexShrink:1 }}>Zoomol Roxx Premium 4T 20W-40</Text> */}
                          
                    {/* </Row> */}
                    
                    {/* <Row  fullHeight style={{  alignSelf: 'center'}}> */}
                            {/* <Text style={{ fontSize: 18, textAlign: 'center',color: 'white' }}> {strings('login.amt')} :</Text> */}
                            {/* <Text style={{fontSize: 18, textAlign: 'left', color: 'white' ,fontWeight:"bold"}}>{this.state.currencySymbol+" "+this.state.cashDetails}</Text> */}
                            {/* <Text style={{fontSize: 18, textAlign: 'center', color: 'white' ,fontWeight:"bold"}}>{this.state.currencySymbol+"60"}</Text> */}
                    {/* </Row> */}
                    
                   {/* </Grid> */}
                    {/* <Text style={{ color: 'white', fontSize: 18,   textAlign: 'center', textAlignVertical: 'top',  }}>Amount:</Text><Text style={{ color: 'white', fontSize: 18, fontWeight:'bold',  }}>{this.state.currencySymbol+" "+this.state.cashDetails}</Text> */}
                    {/* <Text style={{ color: 'white', fontSize: 18,   textAlign: 'center', textAlignVertical: 'top',   }}>Loyalty Points:</Text><Text style={{ color: 'white', fontSize: 18, fontWeight:'bold', }}>{this.state.loyaltyPoints}</Text> */}
                    <Text style={{ color: 'white', fontSize: 18,   textAlign: 'center', textAlignVertical: 'top', flex: 1,  }}>{this.state.scanningBody}</Text>
                   
                </Animated.View>
                {/* {this._showModal()} */}

              
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
    console.log(state.VerifierReducer.languageEnglish);

    return {
        pymOpn: state.VerifierReducer.mechanicData.payment_option,
        languageControl: state.VerifierReducer.languageEnglish,
    }
}
export default connect(mapStateToProps, null)(ScanScreen)