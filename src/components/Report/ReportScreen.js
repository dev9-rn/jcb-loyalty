import React, { Component } from 'react';
import { View, Button, Image, ScrollView, TouchableOpacity, TextInput, Platform ,Alert, PermissionsAndroid, BackHandler, Linking} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import IMG from '../../images/camera1.png'
import { Header, Left, Body, Title, Icon, Label } from 'native-base';
import { URL, APIKEY, ACCESSTOKEN } from '../../App';
import Loader from '../../Utility/Loader';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import AndroidOpenSettings from 'react-native-android-open-settings';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request } from 'react-native-permissions';

class ReportScreen extends Component {
    state = {
        pickedImage: IMG,
        isImage: false,
        SrNo: '',
        Description: '',
        distributorId: '',
        loaderText: 'Loading...',
        showHideLoading: false,
        isPermissionGranted : false,
    }
    getDataFromAPi = () => {
        AsyncStorage.getItem('USERDATA')
            .catch(err => { alert("Error") })
            .then(res => {
                var lData = JSON.parse(res);
                this._onPressSendButton(lData.data.id);
            })
    }

    imagePickerHandler = async (type) => {
        try {
          if (this.state.isPermissionGranted) {
            const options = {
              mediaType: 'photo',
              saveToPhotos: true,
            };
      
            let result;
            if (type === 'capture') {
              result = await launchCamera(options);
            } else {
              result = await launchImageLibrary(options);
            }
      
            if (result.didCancel) {
              console.log('User canceled image picker');
            } else if (result.errorCode) {
              console.log('Error:', result.errorMessage);
            } else if (result.assets && result.assets.length > 0) {
              this.setState({
                isImage: true,
                pickedImage: { uri: result.assets[0].uri },
              });
            }
          } else {
            Alert.alert('Need Camera Permission', '', [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed') },
              { text: 'Open Settings', onPress: this._openSettings },
            ]);
          }
        } catch (e) {
          console.error('Image picker error:', e);
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

    componentDidMount() {
        this._requestPermission();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.props.navigation.navigate('HomeScreen');
        return true;
    }

    _requestPermission = async () =>{
        request(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA).then((result) => {
            if(result == "granted"){
                this.setState({isPermissionGranted : true})
            }
            console.log(result)
        });
    
    }
    _onPressSendButton = (distributorId) => {
        this.setState({ showHideLoading: true })
        const photo = {
            uri: this.state.pickedImage.uri,
            type: 'image/jpeg',
            name: "abc.jpeg"
        }
        const formData = new FormData();
        formData.append('srNo', this.state.SrNo);
        formData.append('description', this.state.Description);
        formData.append('distributorId', distributorId);
        formData.append('couponFile', photo);
        console.log(formData);

        var lUrl = URL + 'reportCoupon';
        fetch(lUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application\/json',
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
                'accesstoken': ACCESSTOKEN
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                this.setState({ showHideLoading: false })
                if (responseJson.status === 403) {
                    this.props.navigation.navigate('LoginScreen')
                    return;
                }
                else if (responseJson.message) {
                    // alert(JSON.stringify(responseJson.message))
                    Alert.alert(
                        strings('login.ScanScreenAlertTitle'),
                        responseJson.message,
                        [
                            // { text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                            { text: strings('login.OK'), onPress: () => { this.props.navigation.navigate('HomeScreen') } },
                        ],
                        { cancelable: false }
                    );

                    return;
                }
                else {
                    alert(JSON.stringify(responseJson))
                    return;
                }
            })
            .catch((error) => {
                this.setState({ showHideLoading: false })
                alert(error)
            });
    }
    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#fab032', display: 'flex' }}>
                    <Grid>
                        <Col style={{ justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF' }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={15} style={{ justifyContent: 'center', paddingRight: 20 }}>
                            <Title style={{ color: '#FFFFFF' }}>{strings('login.report_screen_titled')}</Title>
                        </Col>
                    </Grid>
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
                        <Title style={{ color: '#FFFFFF', fontSize: 16, marginLeft: -10 }}>{strings('login.report_screen_title')}</Title>
                    </Body>
                </Header>
            )
        }
    }
    render() {
        return (
            <ScrollView keyboardShouldPersistTaps="handled">
                {this._showHeader()}
                <TouchableOpacity onPress={()=>{
                    Alert.alert('Pick an image ', '', [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel Pressed'),
                        },
                        {
                          text: 'Take Photo..',
                          onPress: () => this.imagePickerHandler('capture'),
                        },
                        {
                            text: 'choose from Gallery...', 
                            onPress: () => this.imagePickerHandler('gellery')
                        },
                      ])
                }} style={{ alignItems: 'center', padding: 0, margin: 0 }}>
                    <Image source={this.state.pickedImage} style={{ width: 200, height: 200, marginTop: 25, resizeMode: 'contain' }} />
                </TouchableOpacity>

                {this.state.showHideLoading ? <Loader loading={this.state.loading} text={this.state.loaderText} /> : null}

                <Label style={{ marginLeft: 10, fontWeight: 'bold', marginTop: "20%" }}>{strings('login.report_screen_srNo')}:</Label>
                <TextInput
                    style={{ borderBottomColor: 'blue', borderBottomWidth: 2, marginBottom: 30, marginLeft: 20, marginRight: 20, marginTop: 10 }}
                    placeholder={strings('login.report_screen_srNo')}
                    // autoFocus={true}
                    onChangeText={(SrNo) => this.setState({ SrNo })}
                />
                <Label style={{ marginLeft: 10, fontWeight: 'bold' }}>{strings('login.report_screen_descr')}:</Label>
                <TextInput
                    style={{ borderBottomColor: 'blue', borderBottomWidth: 2, marginBottom: 30, marginLeft: 20, marginRight: 20, marginTop: 10 }}
                    placeholder={strings('login.report_screen_descr')}
                    onChangeText={(Description) => this.setState({ Description })}
                />

                <View style={{ marginTop: 20, marginLeft: 40, marginRight: 40, marginBottom: 20 }}>
                    <Button onPress={this.getDataFromAPi} title={strings('login.sendButton')} disabled={this.state.SrNo.trim().length > 0 && this.state.Description.trim().length > 0
                        && this.state.pickedImage.uri ? false : true} />
                </View>
            </ScrollView>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        enableDarkTheme: state.VerifierReducer.enableDarkTheme,
        languageControl: state.VerifierReducer.languageEnglish,
    }
}
export default connect(mapStateToProps, null)(ReportScreen)