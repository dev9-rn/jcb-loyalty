import React, { Component } from 'react';
import { Alert, AsyncStorage, ScrollView, View, StyleSheet, Image, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import { Accordion, Text, Icon, Card, Button } from "native-base";
import I18n from 'react-native-i18n';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLanguage, setCounterValue } from '../Redux/Actions/VerifierActions';
import { setIntituteUserData } from '../Redux/Actions/InstituteActions';
import { Grid, Row, Col } from 'react-native-easy-grid';
import SplashScreen from 'react-native-splash-screen';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { strings } from '../locales/i18n';
import * as app from '../../App';

var deviceLocale = I18n.currentLocale()
class LanguageSelection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isEnglish: false,
            isHinde: false,
            isMarathis: false,
            isPunjabi: false,
            isGuj: false,
            isTelgu: false,
            isTamil: false,
            isUrdu: false,
            isBengali: false,
            isKannada: false,
            isOdia: false,
            isFrench: false,
            isSwahili: false
        }
    }
    componentDidMount() {
        // this.props.navigation.navigate('LanguageSelection')
        if (this.props.redirectToHome || this.props.redirectToHomeFrmVeri) {
            this.props.navigation.navigate('HomeScreen')
        } else if (this.props.showHideLanguageScreen) {
            this.props.navigation.navigate('LandingScreen')
        } else {
            SplashScreen.hide()
        }
    }
    _onPressScanButton = () => {
        if (this.state.isEnglish) {
            I18n.locale = 'en'
            this.props.setLanguage('English - (English)')
            this.props.setIntituteUserData(true)
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isHinde) {
            I18n.locale = 'hi'
            this.props.setLanguage('Hindi - (हिन्दी)')
            this.props.setIntituteUserData(true)
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isSwahili) {
            this.props.setLanguage('Swahili - (Kiswahili)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'swa'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isMarathis) {
            this.props.setLanguage('Marathi - (मराठी)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'ma'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isPunjabi) {
            this.props.setLanguage('Punjabi - (ਪੰਜਾਬੀ)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'pa'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isGuj) {
            this.props.setLanguage('Gujarati - (ગુજરાતી)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'gu'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isTamil) {
            this.props.setLanguage('Tamil - (தமிழ்)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'ta'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isTelgu) {
            this.props.setLanguage('Telugu - (తెలుగు)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'tl'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isUrdu) {
            this.props.setLanguage('Urdu - (اردو)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'ur'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isBengali) {
            this.props.setLanguage('Bengali - (বাংলা)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'ben'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isKannada) {
            this.props.setLanguage('Kannada - (ಕನ್ನಡ)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'kan'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isFrench) {
            this.props.setLanguage('French - (Française)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'fr'
            this.props.navigation.navigate('LoginScreen')
        } else if (this.state.isOdia) {
            this.props.setLanguage('Odia - (ଓଡିଆ)')
            this.props.setIntituteUserData(true)
            I18n.locale = 'od'
            this.props.navigation.navigate('LoginScreen')
        }
    }
    render() {
        return (
            <ScrollView style={{ flex: 1 }}>
                <Text style={{ justifyContent: 'center', textAlign: 'center', fontWeight: 'bold', fontSize: 20, marginTop: 10 }}>Please Select Language :</Text>
                <Grid style={{ marginTop: 10 }}>
                    <Col>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isEnglish ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: true, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>English</Text>
                            <Text onPress={() => this.setState({ isEnglish: true, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>({strings('login.lang_english')})</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isFrench ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: true, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>French</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: true, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(Française)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isMarathis ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: true, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Marathi</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: true, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(मराठी)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isPunjabi ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: true, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Punjabi</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: true, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(ਪੰਜਾਬੀ)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isGuj ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: true, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Gujarati</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: true, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(ગુજરાતી)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isTelgu ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: true, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Telugu</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: true, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(తెలుగు)</Text>
                        </Card>
                    </Col>
                    <Col>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isHinde ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: true, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Hindi</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: true, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(हिन्दी)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isSwahili ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: true })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Swahili</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: true })} style={{ textAlign: 'center', fontSize: 13 }}>(Kiswahili)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isBengali ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: true, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Bengali</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: true, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(বাংলা)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isKannada ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: true, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Kannada</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: true, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(ಕನ್ನಡ)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isOdia ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: true, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Odia</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: false, isBengali: false, isKannada: false, isOdia: true, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(ଓଡିଆ)</Text>
                        </Card>
                        <Card style={{ marginLeft: 10, marginRight: 10, height: 90, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isTamil ? '#e6e6e6' : 'white' }}>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: true, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Tamil</Text>
                            <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: true, isUrdu: false, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(தமிழ்)</Text>
                        </Card>
                    </Col>
                </Grid>
                <Card style={{ marginLeft: 10, marginRight: 10, height: 90, width: 200, borderRadius: 5, justifyContent: 'center', backgroundColor: this.state.isUrdu ? '#e6e6e6' : 'white', alignSelf: 'center' }}>
                    <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: true, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontWeight: 'bold' }}>Urdu</Text>
                    <Text onPress={() => this.setState({ isEnglish: false, isHinde: false, isMarathis: false, isPunjabi: false, isGuj: false, isTelgu: false, isTamil: false, isUrdu: true, isBengali: false, isKannada: false, isOdia: false, isFrench: false, isSwahili: false })} style={{ textAlign: 'center', fontSize: 13 }}>(اردو)</Text>
                </Card>
                <View style={{ marginTop: 30, bottom: 10, justifyContent: 'center' }}>
                    <Button style={{ backgroundColor: '#ff4000', borderRadius: 20, width: 300, alignSelf: 'center' }} onPress={this._onPressScanButton}><Text style={{ textAlign: 'center', flex: 1, fontWeight: 'bold', fontSize: 18 }}>LET'S GET STARTED</Text></Button>
                </View>
            </ScrollView>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        showHideLanguageScreen: state.InstituteReducer.showHideLanguageScreen,
        redirectToHome: state.InstituteReducer.loginData == null ? "" : state.InstituteReducer.loginData.accesstoken,
        redirectToHomeFrmVeri: state.VerifierReducer.mechanicData == null ? "" : state.VerifierReducer.mechanicData.accesstoken,
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        setLanguage: setLanguage, setCounterValue: setCounterValue, setIntituteUserData: setIntituteUserData
    }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelection)