import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import { Header, Left, Body, Content, Card, Text, Title, Item, Label, Input, Icon, Form } from 'native-base';

import LinearGradient from 'react-native-linear-gradient';
import LoginService from '../../services/LoginService/LoginService';
import ProfileService from '../../services/ProfileService/ProfileService';
import * as app from '../../App';
import { Dropdown } from 'react-native-material-dropdown';
var _ = require('lodash');
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import * as utilities from "../../Utility/utilities";
import AsyncStorage from '@react-native-community/async-storage';
import { Picker } from 'native-base';

var isBrandData = false;
var isCountryData = false;
var isStatesData = false;
var isCityData = false;
class MechanicProfileScreen extends Component {

    constructor(props) {
        super(props);
        this.brandData = [];
        this.countryList = [];
        this.statesList = [];
        this.citiesList = [];
        this.state = {
            isConnected: true,
            name: '',
            email: '',
            phoneNumber: '',
            address: '',
            street: '',
            pincode: '',
            brandId: '',
            borderBottomColorPassword: '#757575',
            borderBottomColorUserName: '#757575',
            loaderText: 'Please wait...',
            nameError: null,
            emailError: null,
            phoneNumberError: null,
            addressError: null,
            streetError: null,
            pincodeError: null,
            panNoError: null,
            btnOTP: 'active',
            btnEmail: 'inactive',
            brandName: '',
            country_id: '',
            country_name: '',
            state_id: '',
            state_name: '',
            city_id: '',
            city_name: '',
            companyName: '',
            gstNo: '',
            selectedCity: '',
            shop_name: ''
        };
    }

    componentWillMount() {
        this.setState({ isConnected: app.ISNETCONNECTED });
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        // this._showNetErrMsg();
        this.getAsyncUserData();
        this._getAsyncData();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.props.navigation.navigate('HomeScreen');
        return true;
    }

    _showNetErrMsg() {
        if (!this.state.isConnected || !app.ISNETCONNECTED) {
            Alert.alert(
                'No network available',
                'Connect to internet',
                [
                    { text: 'SETTINGS', onPress: () => { } },
                    { text: 'BACK', onPress: () => { this.props.navigation.navigate('VerifierMainScreen') } },
                    { text: 'CONTINUE', onPress: () => { this.setState({ isConnected: false }) } },
                ],
                { cancelable: false }
            )
        }
    }

    async getAsyncUserData() {
        await AsyncStorage.multiGet(['USERDATA'], (err, result) => {
            var lData = JSON.parse(result[0][1]);
            if (lData) {
                console.log(lData.data);

                this.distributorId = lData.data.id;
                this.setState({
                    selectedBrandId: lData.data.brand_id
                })
                this._getUserData();
            }
        });
    }

    async _getUserData() {
        const formData = new FormData();
        formData.append('mechanicId', this.distributorId);
        if (this.props.languageControl) {
            formData.append('language', 'en');
        } else {
            formData.append('language', 'hi');
        }

        var profileApiObj = new ProfileService();
        await profileApiObj.getMechanicProfile(formData);
        var lResponseData = profileApiObj.getRespData();
        if (!lResponseData) {
            alert('Something went wrong. Please try again later');
        } else if (lResponseData.status == 500 || lResponseData.status == 400) {
            alert(lResponseData.message);
        } else if (lResponseData.status == 403) {
            alert(lResponseData.message);
            this.props.navigation.navigate('LoginScreen');
            AsyncStorage.clear();
            return;
        }
        else if (lResponseData.status == 200) {
            console.log(lResponseData);
            this._getStatesByCountry(101);
            this.userdata = lResponseData.data;
            this.setState({
                name: lResponseData.data.full_name,
                phoneNumber: lResponseData.data.mobile_no,
                shop_name: lResponseData.data.shop_name,
                pincode: lResponseData.data.pin_code,
                panNo: lResponseData.data.pan_no,
                selectedCity: lResponseData.data.city_id,
                selectedStates: lResponseData.data.state_id,

            });

        } else {
            alert('Something went wrong. Please try again later');
        }
    }

    _setPickerData(pResponseData) {
        var lData;
        var lBrandData = [];
        var lCountriesData = [];
        var lStateData = [];
        var lCitiesData = [];
        if (pResponseData.hasOwnProperty('brands')) {
            lData = pResponseData.brands;
            lBrandData = lData;
        } else if (pResponseData.hasOwnProperty('countries')) {
            lData = pResponseData.countries;
            lCountriesData = lData;
        } else if (pResponseData.hasOwnProperty('states')) {
            console.log(pResponseData.states);
            lData = pResponseData.states;
            lStateData = lData;
        } else if (pResponseData.hasOwnProperty('cities')) {
            lData = pResponseData.cities;
            lCitiesData = lData;
        }
        var arrayData = [];
        for (var i = 0; i < lData.length; i++) {
            var dataObj = {};
            dataObj.id = parseInt(lData[i].id);
            dataObj.value = lData[i].name;
            arrayData.push(dataObj);

        }
        for (var j = 0; j < lBrandData.length; j++) {
            var dataObj = {};
            dataObj.id = parseInt(lBrandData[j].id);
            dataObj.value = lBrandData[j].name;
            if (dataObj.id === parseInt(this.state.selectedBrandId)) {
                this.setState({ brandName: dataObj.value })
                // arrayData.push(dataObj);
            }
        }
        for (var l = 0; l < lStateData.length; l++) {
            var dataObj = {};
            dataObj.id = parseInt(lStateData[l].id);
            dataObj.value = lStateData[l].name;
            if (dataObj.id == parseInt(this.state.selectedStates)) {
                this._setStates(parseInt(this.state.selectedStates))
                this.setState({ state_name: dataObj.value })
                // arrayData.push(dataObj);
            }
        }
        for (var m = 0; m < lCitiesData.length; m++) {
            var dataObj = {};
            dataObj.id = parseInt(lCitiesData[m].id);
            dataObj.value = lCitiesData[m].name;
            if (dataObj.id == parseInt(this.state.selectedCity)) {
                this._setCity(parseInt(this.state.selectedCity))
                this.setState({ city_name: dataObj.value })
                // arrayData.push(dataObj);
            }
        }

        if (pResponseData.hasOwnProperty('brands')) {
            isBrandData = true;
            let initialData = {};
            initialData.id = this.state.selectedBrandId;
            initialData.value = this.state.brandName;
            arrayData.unshift(initialData);
            this.brandData = arrayData;
            this.setState({ brand: arrayData });

        } else if (pResponseData.hasOwnProperty('states')) {
            isStatesData = true;
            let initialData = {};
            initialData.id = this.state.selectedStates;
            initialData.value = this.state.state_name;
            arrayData.unshift(initialData);
            this.statesList = arrayData;

            // let StateItems = this.statesList.map( (s, i) => {
            //        	return <Picker.Item key={i} value={s.id} label={s.value} />
            //    	});
            this.setState({ states: arrayData });
        } else if (pResponseData.hasOwnProperty('cities')) {
            isCityData = true;
            let initialData = {};
            initialData.id = this.state.selectedCity;
            initialData.value = 'Select City';
            arrayData.unshift(initialData);
            this.citiesList = arrayData;

            // let CityItems = this.citiesList.map( (s, i) => {
            //         return <Picker.Item key={i} value={s.id} label={s.value} />
            //     });
            this.setState({ city: arrayData });
        }
        // this.setState({brand: arrayData, country: arrayData, states: arrayData, city: arrayData});
    }

    async callForAPIBrandId() {
        var brandApiObj = new LoginService();
        await brandApiObj.getBrands();
        var lResponseData = brandApiObj.getRespData();
        this.closeActivityIndicator();
        this._setPickerData(lResponseData);
    }

    async callForAPICountrty() {
        var countryApiObj = new LoginService();
        await countryApiObj.getCountries();
        var lResponseData = countryApiObj.getRespData();
        this.closeActivityIndicator();
        this._setPickerData(lResponseData);
    }

    async callForAPIStates(pCountryId) {
        var statesApiObj = new LoginService();
        const formData = new FormData();
        formData.append('countryId', parseInt(pCountryId));
        if (this.props.languageControl) {
            formData.append('language', 'en');
        } else {
            formData.append('language', 'hi');
        }
        await statesApiObj.getStatesByCountry(formData);
        var lResponseData = statesApiObj.getRespData();
        this.closeActivityIndicator();
        this._setPickerData(lResponseData);
    }

    async callForAPICity(pStateId) {
        var statesApiObj = new LoginService();
        const formData = new FormData();
        formData.append('stateId', parseInt(pStateId));
        if (this.props.languageControl) {
            formData.append('language', 'en');
        } else {
            formData.append('language', 'hi');
        }
        await statesApiObj.getCitiesByState(formData);
        var lResponseData = statesApiObj.getRespData();
        this.closeActivityIndicator();
        this._setPickerData(lResponseData);
    }

    async _getAsyncData() {
        await this.callForAPIBrandId();
        await this.callForAPICountrty();
    }

    _getStatesByCountry(pCountryId) {
        this.callForAPIStates(pCountryId);
    }

    _getCitiesByState(pStateId) {
        this.callForAPICity(pStateId);
    }


    _setStates(pStates, statesList) {
        if (statesList) {
            if (pStates != 0) {
                let idForState = _.filter(statesList, { value: pStates })[0].id
                this.setState({ selectedStates: idForState });
                this._getCitiesByState(idForState);
            } else {
                this.setState({ selectedStates: idForState });
            }
        } else {
            if (pStates != 0) {
                this.setState({ selectedStates: pStates });
                this._getCitiesByState(pStates);
            } else {
                this.setState({ selectedStates: pStates });
            }
        }
    }

    _setCity(city, citiesList) {
        if (citiesList) {
            let idForState = _.filter(citiesList, { value: city })[0].id
            this.setState({ selectedCity: idForState });
        } else {
            this.setState({ selectedCity: city });
        }
    }

    _validateName() {
        let lName = this.state.name;
        let res = utilities.checkSpecialChar(lName);
        if (!res) {
            this.setState({ nameError: strings('login.spcError') });
        }
        return res;
    }

    _validateMobileNumber() {
        let lPhoneNumber = this.state.phoneNumber;
        let res = '';
        res = utilities.checkMobileNumber(lPhoneNumber);
        if (!res || lPhoneNumber.trim().length < 10) {
            this.setState({ phoneNumberError: strings('login.phnInvalid') });
        }
        return res;
    }

    _validateState() {
        let lState = this.state.selectedStates;
        if (!lState) {
            lState = false;
            this.setState({ stateError: "Select state" });
        }
        return lState;
    }

    _validatePanNo() {
        let lPanNo = this.state.panNo;
        let res = '';
        res = utilities.checkPanNo(lPanNo);
        if (!res) {
            this.setState({ panNoError: strings('login.panNoInvalid') });
        }
        return res;
    }

    closeActivityIndicator() {
        setTimeout(() => {
            this.setState({ loading: false });
        });
    }

    async callForAPI() {
        let lName = this.state.name.trim();
        // let lEmail = this.state.email.trim();
        let lPhoneNumber = this.state.phoneNumber;
        let lAddress = this.state.shop_name;
        // let lStreet = this.state.street;
        let lPinCode = this.state.pincode;
        let lBrand = this.state.selectedBrandId;
        // let lCountry = this.state.selectedCountry;
        let lStates = this.state.selectedStates;
        let lCity = this.state.selectedCity;
        let lCompanyName = this.state.companyName;
        let lPanNo = this.state.panNo;
        // let lGstNo = this.state.gstNo;

        const formData = new FormData();
        formData.append('mechanicId', this.distributorId)
        formData.append('name', lName);
        formData.append('mobileNo', lPhoneNumber);
        // formData.append('emailId', lEmail);
        formData.append('shopName', lAddress);
        // formData.append('street', lStreet);
        formData.append('pinCode', lPinCode);
        // formData.append('brandId', lBrand);
        // formData.append('countryId', lCountry);
        formData.append('stateId', lStates);
        formData.append('cityId', lCity);
        // formData.append('companyName', lCompanyName);
        formData.append('panNo', lPanNo);
        // formData.append('gstNo', lGstNo);
        if (this.props.languageControl) {
            formData.append('language', 'en');
        } else {
            formData.append('language', 'hi');
        }
        console.log(formData);

        var profileApiObj = new ProfileService();
        // this.props.navigation.navigate('OTPVerification');

        await profileApiObj.updateProfileMechanic(formData);
        var lResponseData = profileApiObj.getRespData();

        if (!lResponseData || lResponseData.status == 500) {
            this.closeActivityIndicator();
            alert('Something went wrong. Please try again later');
        } else if (lResponseData.status == 400 || lResponseData.status == 409 || lResponseData.status == 422) {
            this.closeActivityIndicator();
            this.setState({ phoneNumberError: lResponseData.message });
            alert(lResponseData.message);
        } else if (lResponseData.status == 200) {
            this.closeActivityIndicator();
            alert(lResponseData.message);
            this.props.navigation.navigate('HomeScreen');
        } else {
            this.closeActivityIndicator();
            alert('Something went wrong. Please try again later');
        }
    }

    _onPressButton() {
        let lName = this.state.name;
        // let lEmail = this.state.email;
        let lPhoneNumber = this.state.phoneNumber;
        let lAddress = this.state.shop_name;
        // let lStreet = this.state.street;
        let lPincode = this.state.pincode;
        let lBrand = this.state.selectedBrandId;
        // let lCountry = this.state.selectedCountry;
        let lStates = this.state.selectedStates;
        let lCity = this.state.selectedCity;
        let lPanNo = this.state.panNo;

        var isValidName = '';
        var isValidMobileNumber = '';
        var isValidState = '';
        var isValidPanNo = '';

        if (lName === "") {
            this.setState({ nameError: strings('login.nameError') });
            return;
        } else {
            this.setState({ nameError: null });
        }

        if (lPhoneNumber === "") {
            this.setState({ phoneNumberError: strings('login.phnError') });
            return;
        } else {
            this.setState({ phoneNumberError: null });
        }

        if (lAddress === "") {
            this.setState({ addressError: strings('login.addError') });
            return;
        } else {
            this.setState({ addressError: null });
        }

        // if (lStreet === "") {
        //     this.setState({ streetError: strings('login.streetError') });
        //     return;
        // } else {
        //     this.setState({ streetError: null });
        // }

        if (lPincode === "") {
            this.setState({ pincodeError: strings('login.PinCodeError') });
            return;
        } else {
            this.setState({ pincodeError: null });
        }

        // if (!lBrand || lBrand == 0) {
        // 	alert('Please select Brand');
        // 	this.setState({ brandError: "Brand required." });
        // } else {
        // 	this.setState({ brandError: null });
        // }

        // if (!lCountry || lCountry == 0) {
        //     alert('Please select Country');
        //     this.setState({ countryError: "Select Country." });
        // } else {
        //     this.setState({ countryError: null });
        // }

        if (!lStates || lStates == 0) {
            Alert.alert(
                'Alert',
                strings('login.stateError'),
                [
                    { text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
            );
            this.setState({ stateError: strings('login.stateError') });
        } else {
            this.setState({ stateError: null });
        }

        if (!lCity || lCity == 0) {
            Alert.alert(
                'Alert',
                strings('login.cityError'),
                [
                    { text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
            );
            this.setState({ cityError: strings('login.cityError') });
        } else {
            this.setState({ cityError: null });
        }

        if (this.state.nameError == null && this.state.emailError == null && this.state.phoneNumberError == null && this.state.addressError == null && this.state.streetError == null && this.state.pincodeError == null) {
            ;
            isValidName = this._validateName();
            // isValidUserName = this._validateUserName();
            isValidMobileNumber = this._validateMobileNumber();
            // isValidEmail = this._validateEmail();
            // isValidBrand = this._validateBrand();
            // isValidCountry = this._validateCountry();
            isValidState = this._validateState();
            // isValidCity = this._validCity();

            if (lPanNo) {
                isValidPanNo = this._validatePanNo();
            }

            if (isValidName && isValidMobileNumber && isValidState && lPanNo) {
                this.callForAPI();
            }

        } else {
            if (lName != "") {
                lName = '';
                isValidName = this._validateName();
            }
            if (lPhoneNumber != '') {
                lPhoneNumber = '';
                isValidMobileNumber = this._validateMobileNumber();
            }
            // if (lUserName) {
            // 	lUserName = '';
            // 	isValidUserName = this._validateUserName();
            // }
            // if (lPassword != '') {
            // 	lPassword = '';
            // 	isValidPassword = this._validatePassword();
            // }
        }
    }

    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#fab032' }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.9, paddingRight: 23 }}>
                        <Title style={{ color: '#FFFFFF' }}>{strings('login.profile_screen_title')}</Title>
                    </Body>

                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: '#fab032' }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.9, alignItems: 'center', }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, marginLeft: -10 }}>{strings('login.profile_screen_title')}</Title>
                    </Body>

                </Header>
            )
        }
    }

    render() {
        var BrandItems;
        var CountryItems;
        var StateItems;
        var CityItems;

        if (isBrandData) {
            BrandItems = this.brandData.map((s, i) => {
                return <Picker.Item key={i} value={s.id} label={s.value} />
            });
        }
        if (isCountryData) {
            CountryItems = this.countryList.map((s, i) => {
                return <Picker.Item key={i} value={s.id} label={s.value} />
            });
        }
        if (isStatesData) {
            StateItems = this.statesList.map((s, i) => {
                return <Picker.Item key={i} value={s.id} label={s.value} />
            });
        }
        if (isCityData) {
            CityItems = this.citiesList.map((s, i) => {
                return <Picker.Item key={i} value={s.id} label={s.value} />
            });
        }

        return (
            <View style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? 'black' : 'white' }}>
                {this._showHeader()}
                <View style={styles.signUpViewContainer}>
                    <ScrollView keyboardShouldPersistTaps="always">
                        <Card style={{
                            // padding: 10,
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 10,
                            // marginTop: 20,
                            marginLeft: 10,
                            marginRight: 10,
                            backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white'
                        }}>

                            <Content>
                                <Form>

                                    {!!this.state.nameError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1, }}>
                                                <Input
                                                    placeholder={strings('login.profile_screen_name_field')}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ nameError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.nameError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_screen_name_field')}</Label>
                                            <Input
                                                value={this.state.name}
                                                style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'black' }}
                                                autoFocus={true}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(name) => this.setState({ name })}
                                            />
                                        </Item>
                                    }

                                    {!!this.state.phoneNumberError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder={strings('login.profile_screen_phn_field')}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ phoneNumberError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.phoneNumberError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_screen_phn_field')}</Label>
                                            <Input
                                                value={this.state.phoneNumber}
                                                style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'black' }}
                                                keyboardType='number-pad'
                                                maxLength={10}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
                                            />
                                        </Item>
                                    }

                                    {/* {!!this.state.emailError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder='Email'
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ emailError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.emailError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label>Email</Label>
                                            <Input
                                                value={this.state.email}
                                                style={{ marginTop: 3 }}
                                                keyboardType='email-address'
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(email) => this.setState({ email })}
                                            />
                                        </Item>
                                    } */}

                                    {!!this.state.addressError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder={strings('login.profile_screen_shopName_field')}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ addressError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.addressError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_screen_shopName_field')}</Label>
                                            <Input
                                                value={this.state.shop_name}
                                                style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'black' }}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(shop_name) => this.setState({ shop_name })}
                                            />
                                        </Item>
                                    }

                                    {/* {!!this.state.streetError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    style={{ paddingBottom: 5 }}
                                                    placeholder='Street'
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ streetError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.streetError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label>Street</Label>
                                            <Input
                                                value={this.state.street}
                                                style={{ marginTop: 3 }}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(street) => this.setState({ street })}
                                            />
                                        </Item>
                                    } */}

                                    {!!this.state.pincodeError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder={strings('login.profile_screen_pincode_field')}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ pincodeError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.pincodeError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_screen_pincode_field')}</Label>
                                            <Input
                                                value={this.state.pincode}
                                                style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'black' }}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(pincode) => this.setState({ pincode })}
                                            />
                                        </Item>
                                    }














                                    {/* <View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07 }}> */}
                                    {/* <Picker
											selectedValue={this.state.selectedCountry}
											style={{ flex: 0.3 }}
											onValueChange={(country) => this._setCountry(country)}>
											{CountryItems}
										</Picker> */}
                                    {/* <Dropdown
                                            label={this.state.country_name}
                                            data={this.countryList}
                                            baseColor="(default: rgba(0, 0, 0, 5))"
                                            onChangeText={(value) => { this._setCountry(value, this.countryList) }}
                                        /> */}
                                    {/* </View> */}

                                    <View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07 }}>
                                        {/* <Picker
											selectedValue={this.state.selectedStates}
											style={{ flex: 0.3 }}
											onValueChange={(states) => this._setStates(states)}>
											{StateItems}
										</Picker> */}
                                        <Dropdown
                                            label={this.state.state_name}
                                            data={this.statesList}
                                            style={{ color: this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))" }}
                                            baseColor={this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))"}
                                            onChangeText={(states) => this._setStates(states, this.statesList)}
                                        />
                                    </View>

                                    <View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07 }}>
                                        {/* <Picker
											selectedValue={this.state.selectedCity}
											style={{ flex: 0.3 }}
											onValueChange={(city) => this._setCity(city)}>
											{CityItems}
										</Picker> */}
                                        <Dropdown
                                            label={this.state.city_name}
                                            data={this.citiesList}
                                            style={{ color: this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))" }}
                                            baseColor={this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))"}
                                            onChangeText={(city) => this._setCity(city, this.citiesList)}
                                        />
                                    </View>

                                    {/* <Item floatingLabel>
                                        <Label>Company Name</Label>
                                        <Input
                                            value={this.state.companyName}
                                            style={{ marginTop: 3 }}
                                            onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                            onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                            onChangeText={(companyName) => this.setState({ companyName })}
                                        />
                                    </Item> */}

                                    {!!this.state.panNoError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder={strings('login.profile_screen_panNo_field')}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ panNoError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.panNoError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_screen_panNo_field')}</Label>
                                            <Input
                                                value={this.state.panNo}
                                                style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'black' }}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(panNo) => this.setState({ panNo })}
                                            />
                                        </Item>
                                    }
                                    {/* <Item floatingLabel>
                                        <Label>GST Number</Label>
                                        <Input
                                            value={this.state.gstNo}
                                            style={{ marginTop: 3 }}
                                            onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                            onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                            onChangeText={(gstNo) => this.setState({ gstNo })}
                                        />
                                    </Item> */}

                                    <Content padder>
                                        <TouchableOpacity onPress={() => this._onPressButton()}>
                                            <View style={styles.buttonSignUp}>
                                                <LinearGradient colors={['#fab032', '#fab032', '#fab032']} style={styles.linearGradient}>
                                                    <Text style={styles.buttonTextSignUp}>{strings('login.profileScreenSubmit')}</Text>
                                                </LinearGradient>
                                            </View>
                                        </TouchableOpacity>
                                        { Platform.OS === 'ios' ? 
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('RemoveAccount')}>
										<Text  style={{ color:'red' }}> Remove My Account</Text>
									</TouchableOpacity> 
                                    : null }

                                    </Content>

                                </Form>
                            </Content>
                        </Card>
                    </ScrollView>
                </View>
            </View>
        )
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    signUpViewContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingTop: 5
    },
    cardContainer: {
        padding: 15,
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10
    },
    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
    },
    inputContainer: {
        height: 100,
        marginBottom: 15,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    inputs: {
        height: 45,
        marginLeft: 5,
        borderBottomWidth: 1,
        flex: 1,
    },
    buttonSignUp: {
        marginTop: 20,
        marginBottom: 50,
        backgroundColor: '#fab032',
        borderRadius: 5,
        flex: 1
    },
    buttonTextSignUp: {
        padding: 10,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'

    },
    buttonOTP: {
        flex: 1,
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        backgroundColor: '#33B5E5',
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        borderWidth: 0.7,
        borderColor: '#33B5E5',
    },
    buttonTextOTP: {
        paddingLeft: 5,
        color: 'white',
        fontSize: 12,
    },
    buttonEmail: {
        flex: 1,
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        backgroundColor: '#33B5E5',
        borderBottomRightRadius: 10,
        borderTopRightRadius: 10,
        borderWidth: 0.7,
        borderColor: '#33B5E5',
    },
    buttonTextEmail: {
        padding: 2,
        color: '#FFFFFF',
        fontSize: 12,
    },
    buttonEmailOff: {
        flex: 1,
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderBottomRightRadius: 10,
        borderTopRightRadius: 10,
        borderWidth: 0.7,
        borderColor: '#33B5E5',
    },
    buttonTextEmailOff: {
        padding: 2,
        color: '#33B5E5',
        fontSize: 12,

    },
    buttonOTPOff: {
        flex: 1,
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        borderWidth: 0.7,
        borderColor: '#33B5E5',
    },
    buttonTextOTPOff: {
        fontSize: 12,
        padding: 2,
        color: '#33B5E5',
    },
    errorMsg: {
        marginLeft: 18,
        fontSize: 12,
        color: 'red'
    }
})
const mapStateToProps = (state) => {
    return {
        enableDarkTheme: state.VerifierReducer.enableDarkTheme,
        languageControl: state.VerifierReducer.languageEnglish,
    }
}
export default connect(mapStateToProps, null)(MechanicProfileScreen)