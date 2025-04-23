import React, { Component } from 'react';
import { Alert, BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity,Easing, StatusBar, Linking, ScrollView,Animated } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import IconBadge from 'react-native-icon-badge';
import Modal from "react-native-modal";
import AndroidOpenSettings from 'react-native-android-open-settings';
import ScanService from '../../services/ScanService/ScanService';
// import Torch from 'react-native-torch';
import CustomHeader from '../../Utility/CustomHeader';
import Loader from '../../Utility/Loader';
import * as utilities from '../../Utility/utilities';
import * as app from '../../App';
import Moment from 'moment';
import { Col, Row, Grid } from "react-native-easy-grid";
import { request, PERMISSIONS } from 'react-native-permissions';
var Sound = require('react-native-sound');
import { strings } from '../../locales/i18n';
import I18n from 'react-native-i18n';
import { connect } from 'react-redux';

var redeemMethodsT = [];
class ScanScreen extends React.Component {
    constructor(props) {
        super(props);
        this.distributorId;
        this.animatedValue = new Animated.Value(0)
        // redeemMethodsT = [];
        this.qrText;
        this.state = {
            isConnected: true,
            userId: '',
            userName: '',
            flashEnabled: true,
            flash: false,
            loading: false,
            showCamera: true,
            showCameraText: true,
            showModal: false,
            isModalVisible: false,
            loaderText: 'Scanning...',
            redeemType: '',
            redeemMethods: [],
            offerDetails: {},
            animatedWidth: new Animated.Value(0),
            animatedHeight: new Animated.Value(0),
        };
    }

    componentWillMount() {
        console.log("bangdu");

        if (Platform.OS === 'ios') {
            console.log("aaya andr");

            Promise.all([
                request(PERMISSIONS.IOS.CAMERA),
            ]).then(([cameraStatus]) => {
                console.log(cameraStatus);
            })
        }
        this.setState({ isConnected: app.ISNETCONNECTED });
        this._getAsyncData();
    }

    componentDidMount() {
        this.didFocusSubscription = this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.setState({ showCamera: true });
                // this.scanSuccess = true;
            }
        );
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this._showNetErrMsg();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        this.didFocusSubscription.remove();
    }

    handleBackPress = () => {
        this.props.navigation.navigate('HomeScreen');
        return true;
    }

    handleConnectivityChange = isConnected => {
        if (isConnected) {
            this.setState({ isConnected });
        } else {
            this.setState({ isConnected });
            this._showNetErrMsg();
        }
    };

    _openSettings() {
        if (Platform.OS == 'ios') {
            Linking.canOpenURL('app-settings:').then(supported => {
                if (!supported) {
                    console.log('Can\'t handle settings url');
                } else {
                    return Linking.openURL('app-settings:');
                }
            }).catch(err => console.error('An error occurred', err));
        } else {
            AndroidOpenSettings.generalSettings();
        }
    }

    _showNetErrMsg() {
        if (!this.state.isConnected || !app.ISNETCONNECTED) {
            Alert.alert(
                'No network available',
                'Connect to internet to scan QR code.',
                [
                    { text: 'SETTINGS', onPress: () => { this._openSettings() } },
                    { text: 'BACK', onPress: () => { this.props.navigation.navigate('HomeScreen') } },
                    { text: 'CONTINUE', onPress: () => { this.setState({ isConnected: false }) } },
                ],
                { cancelable: false }
            )
        }
    }

    closeActivityIndicator() {
        setTimeout(() => {
            this.setState({ loading: false });
        });
    }

    async _getAsyncData() {
        await AsyncStorage.getItem('USERDATA', (err, result) => {       // USERDATA is set on SignUP screen
            var lData = JSON.parse(result);
            if (lData) {
                this.distributorId = lData.data.id;
            }
        });
    }

    _showModalOffer() {
        debugger;
        this.setState({ modalValue: 'offers', isModalVisible: !this.state.isModalVisible });

    }

    onSuccess(e) {

        this.setState({ showCamera: false, showCameraText: false });
        if (this.state.isConnected || app.ISNETCONNECTED) {
            this._callForAPICheckCoupon(e);
        } else {
            utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
        }
    }

    async _callForAPIRedeem() {
        debugger;
        this.setState({ isModalVisible: !this.state.isModalVisible, isCheckedScheme: false, isCheckedCash: false });
        let redeemType = this.state.redeemType;
        
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
        
        if (redeemType) {

            const formData = new FormData();
            formData.append('qrText', this.qrText);
            formData.append('distributorId', this.distributorId);
            formData.append('redeemType', redeemType);
            formData.append('userType', 0);

            console.log("redeemType" + redeemType);

            console.log("forqrTextmData" + this.qrText);
            console.log("distributorId" + this.distributorId);
            console.log("redeemType" + redeemType);
            console.log("userType" + 0);

            var scanApiObj = new ScanService();

            this.setState({ loading: true });
            await scanApiObj.redeemCoupon(formData);
            var lResponseData = scanApiObj.getRespData();
            await this.closeActivityIndicator();
            debugger;
            if (!lResponseData) {
                utilities.showToastMsg('Something went wrong. Please try again later');
            } else if (lResponseData.status == 500 || lResponseData.status == 400 || lResponseData.status == 422 || lResponseData.status == 403
                || lResponseData.status == 503 || lResponseData.status == 451) {
                utilities.showToastMsg(lResponseData.message);
            } else if (lResponseData.status == 200) {
                // utilities.showToastMsg(lResponseData.message);
                this.animatedBox(lResponseData.message);
                this.setState({ showCamera: true });
                // this.props.navigation.navigate('ScanScreen');

            } else {
                utilities.showToastMsg('Something went wrong. Please try again later');
            }
        }
    }

    async _callForAPICheckCoupon(e) {
        this.qrText = e.data;
        const formData = new FormData();

        formData.append('qrText', e.data);
        formData.append('distributorId', this.distributorId);

        var scanApiObj = new ScanService();

        this.setState({ loading: true });
        await scanApiObj.checkCoupon(formData);
        var lResponseData = scanApiObj.getRespData();
        await this.closeActivityIndicator();
        console.log(lResponseData);
        if (!lResponseData) {
            utilities.showToastMsg('Something went wrong. Please try again later');
            this.setState({ showCamera: true });
        } else if (lResponseData.status == 500 || lResponseData.status == 400 || lResponseData.status == 422
            || lResponseData.status == 501 ) {
            // utilities.showToastMsg(lResponseData.message);
            this.animatedBoxForDanger(lResponseData.message)
            this.setState({ showCamera: true });
        } 
        else if (lResponseData.status == 503) {
            console.log(lResponseData.minutes);
            this.props.navigation.navigate('HomeScreen',{ minutes:  lResponseData.minutes }); 
            return;
        } 
        else if(lResponseData.status == 451){
            console.log(lResponseData.minutes);
            this.props.navigation.navigate('HomeScreen',{ minutes:  lResponseData.minutes }); 
            return;
        }
        else if (lResponseData.status == 200) {
            redeemMethodsT = lResponseData.redeemMethods;
            console.log("lResponseData.redeemMethods" + lResponseData.redeemMethods);
            this.setState({ redeemMethods: lResponseData.redeemMethodsT, redeemType: redeemMethodsT[0].redeem_type })
            for (var i = 0; i < redeemMethodsT.length; i++) {
                if (redeemMethodsT[i].redeem_type == "1") {
                    this.setState({ offerDetails: redeemMethodsT[i].details });
                }
            }
            this._showModalOffer();

        } else {
            utilities.showToastMsg('Something went wrong. Please try again later');
            this.setState({ showCamera: true });
        }
    }

    _openFlash() {
        if (this.state.flashEnabled) {
            Torch.switchState(true);
            this.setState({ flashEnabled: false });
        } else {
            Torch.switchState(false);
            this.setState({ flashEnabled: true });
        }
    }

    ///////////////////////
    animatedBox = (msg) => {
        this.setState({ isSuccess: true, reactivateScanner: 5000, showCamera: true, scanningTitle: 'SUCCESS', scanningBody: msg }, () => {
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
                toValue: 200,
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
        this.setState({ isSuccess: false, reactivateScanner: 3000, showCamera: true, scanningTitle: 'Warning!', scanningBody: msg }, () => {
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
                toValue: 200,
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
    ///////////////////////
    _showModal() {
        if (Platform.OS == 'ios') {
            if (this.state.isModalVisible) {
                return (
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <ScrollView style={{ width: 350, paddingTop: 20 }} keyboardShouldPersistTaps="handled">
                            <Card style={{ flex: 1, borderRadius: 7, padding: 20, }}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}> {strings('login.couponDetails')}{'\n'}</Text>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
                                {this.state.redeemType === '1'
                                    ? <View style={{ paddingBottom: 10, flexDirection: 'row' }}>
                                    </View>
                                    :
                                    <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row' }}>
                                        <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                        {this.state.redeem_type}
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
                                                            {""} <Text style={{ fontSize: 14 }}>till</Text> {""}
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
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.RedeemCash')}</Text>
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
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <Card style={{ flex: 1, borderRadius: 7, padding: 20, }}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}> {strings('login.couponDetails')} {'\n'}</Text>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
                                {this.state.redeemType === '1'
                                    ? <View style={{ paddingBottom: 10, flexDirection: 'row' }}>
                                    </View>
                                    :
                                    <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row' }}>
                                        <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                        {this.state.redeem_type}
                                    </View>
                                }
                                {this.state.redeemType === '1' ?
                                    <View style={{ flex: 1, }}>

                                        <Grid style={{ marginLeft: 30 }}>
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
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalBox')}  : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_boxes} </Text></Text>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>Coupons required for this scheme : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.no_of_coupons_required} </Text></Text>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.validity')} : <Text style={{ fontSize: 14 }}>Offer is valid from
                                                        <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.from_date).format('D-MMM-YYYY')}
                                                            {""} <Text style={{ fontSize: 14 }}>till</Text> {""}
                                                            <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.to_date).format('D-MMM-YYYY')}
                                                            </Text></Text></Text></Text>
                                                </Col>
                                            </Row>
                                        </Grid>
                                        <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20 }} />
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
    render() {
        return (
            <View style={styles.container}>

                {/* {Platform.OS == 'ios' ?
                    <CustomHeader prop={this.props} bodyTitle={'Scan Coupon'} leftNavigation='HomeScreen' headerStyle={{ backgroundColor: '#0000FF' }} />
                    :
                    <CustomHeader prop={this.props} bodyTitle={'Scan Coupon'} leftNavigation='HomeScreen' headerStyle={{ backgroundColor: '#0000FF' }} bodyStyle={{ alignItems: 'center' }} />
                } */}
                <Header style={{ backgroundColor: '#0000FF' }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => { this.props.navigation.navigate('HomeScreen') }}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.8, alignItems: 'center' }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.scan_screen_title')}</Title>
                    </Body>
                </Header>
                <StatusBar
                    barStyle="light-content"
                />

                <Loader
                    loading={this.state.loading}
                    text={this.state.loaderText}
                />
                    <Text> </Text>
                    <Text> </Text>
                    <Text> </Text>
                {this.state.showCamera ?
                    <QRCodeScanner
                        onRead={this.onSuccess.bind(this)}
                        cameraStyle={{ width: '100%', height: '100%' }}
                        showMarker={true}
                    />
                    :
                    <View></View>

                }

                {/* {this.state.showCameraText ?
                    <View>
                        <Text style={{ position: 'absolute', bottom: 50, left: Dimensions.get('window').width * 0.1, zIndex: 1, color: '#FFFFFF' }}>Point the camera at QR code.</Text>
                    </View>
                    :
                    <View></View>
                } */}
                <Text> </Text>
                <Text> </Text>
                <Text> </Text>
                <Animated.View style={[{ backgroundColor: this.state.isSuccess ? '#009900' : 'red', position: 'absolute', marginTop: '45%', left: 50, }, { width: this.state.animatedWidth, height: this.state.animatedHeight }]}>
                    {/* <Animated.View style={{ opacity }}> */}
                    {this.state.isSuccess ?
                        <Icon type="FontAwesome" name="check-circle-o" style={{ fontSize: 45, color: '#FFFFFF', textAlign: 'center', marginTop: 10 }} />
                        :
                        <Icon type="FontAwesome" name="times-circle-o" style={{ fontSize: 45, color: '#FFFFFF', textAlign: 'center', marginTop: 10 }} />
                    }
                    {/* </Animated.View> */}
                    <Text style={{ color: 'white', fontSize: 30, textAlign: 'center', textAlignVertical: 'center', flex: 1, }}>{this.state.scanningTitle}</Text>
                    <Text style={{ color: 'white', fontSize: 30, textAlign: 'center', textAlignVertical: 'center', flex: 1, }}>{this.state.scanningBody}</Text>
                </Animated.View>

                {this._showModal()}

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
