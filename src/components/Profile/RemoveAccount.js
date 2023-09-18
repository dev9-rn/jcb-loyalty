import React, { Component } from 'react';
import { BackHandler, Platform, View, TouchableOpacity, StatusBar, Linking, useColorScheme, Alert,StyleSheet,Modal,TextInput,Dimensions} from 'react-native';
import { Header, Left, Body, Right, Card, CardItem, Text, Title, Icon, Button, Toast, } from 'native-base';
import { connect } from 'react-redux';
import { Col, Grid } from "react-native-easy-grid";
import { COLORS } from '../../config/colors';
import { ScrollView } from 'react-navigation';
// import CircleCheckBox from 'react-native-circle-checkbox';
import CheckBox from 'react-native-check-box';
const { width } = Dimensions.get("window");
import * as utilities from '../../Utility/utilities';
// import { APIKEY } from '../../App';
// import { URL, HEADER } from '../../App';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import AsyncStorage from '@react-native-community/async-storage';
import MyColors from '../../Utility/Colors';

export default class RemoveAccount extends Component {
    constructor(props) {
        super(props);
        this.distributorId;
        this.state = {
            setNavigationScreen: '',
            backgroundColorHeader: '',
            isChecked:false,
            isModalVisible:false,
            toggleModalVisibility:true,
            // username:'',
            // password:'',
            userType: '',
            accesstoken:'',
            carpenterId:''
        };
    }
    // componentWillMount() {
    //     if (this.props.user_type === 1) {
    //         this.setState({ setNavigationScreen: 'VerifierMainScreen', backgroundColorHeader: '#ef7b12' });
    //     } else {
    //         this.setState({ setNavigationScreen: 'InstituteMainScreen', backgroundColorHeader: '#94302C' });
    //     }
    // }

    componentWillMount() { this._getAsyncData(); }

    async _getAsyncData() {
        // await AsyncStorage.getItem('USERDATA', (err, result) => {
        //     var lData = JSON.parse(result);
        //     if (lData) {
        //         this.distributorId = lData.data.id;
        //         this.setState({ userType: lData.data.userType, })
        //     }
        // });
        // await AsyncStorage.getItem('ACCESSTOKEN', (err, result) => {
        //     var lData = JSON.parse(result);
        //     if (lData) {
        //         console.log("Accesstoken data",lData);
        //         this.setState({ accesstoken: lData.ACCESSTOKEN })
        //     }
        // });

        await AsyncStorage.multiGet(['USERDATA','ACCESSTOKEN'], (err, result) => {
            console.log(result);
            var lData = JSON.parse(result[0][1]);
            var at = result[1][1];
            console.log("at",at);
            if (lData) {
                console.log(lData.data);
                this.setState({ distributorId :  lData.data.id, userType: lData.data.userType, accesstoken: lData.data.accesstoken});
                // this._getUserData();
            }
        });
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        // if (this.props.user_type === 1) {
            this.setState({ setNavigationScreen: 'VerifierMainScreen', backgroundColorHeader: COLORS.steelblue });
        // } else {
            // this.setState({ setNavigationScreen: 'InstituteMainScreen', backgroundColorHeader: COLORS.crimson });
        // }

    }
    componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); }
    handleBackPress = () => { this.props.navigation.goBack(null); return true; }
    // _sendMail() { Linking.openURL('mailto:software@scube.net.in?subject=Enquiry regarding SeQR scan.'); }
    // _openURL() { Linking.openURL('http://scube.net.in'); }
    show_dialog(){
        this.setState({ toggleModalVisibility : false });
        Alert.alert(
			'Alert!',
			'Are you sure you want to remove your account?',
			[
				{ text: 'NO' },
				{ text: 'YES', onPress: () => this.remove_account() },
			],
			{ cancelable: false }
		);
    }

    show_dialog1(){
        this.setState({ isModalVisible: true })
    }

     remove_account(){ 
        const formData = new FormData();
		formData.append('distributorId', this.state.distributorId);
		formData.append('userType', this.state.userType);
		formData.append('language', "en");
		console.log(formData+"------"+APIKEY+"---"+this.state.accesstoken);
		fetch(`https://seqrloyalty.com/npl/api/removeAccount`, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart\/form-data',
				'Accept': 'application/json',
				'apikey': APIKEY,
				'accesstoken': this.state.accesstoken 
			},
			body: formData,
		}).then(res => res.json())
			.then(response => {
				this.setState({ loading: false })
				console.log(response);
				if (response.status == 200) {
					// this.props.clearStore('clearData')
					 AsyncStorage.clear();
                    
					this.props.navigation.navigate('LoginScreen');

					utilities.showToastMsg(response.message);

				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
				else if (response.status == 422) { utilities.showToastMsg(response.message); }
				else if (response.status == 400) { utilities.showToastMsg(response.message); }
				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('LoginScreen') }
				else if (response.status == 405) { utilities.showToastMsg(response.message); }
				else if (response.status == 500) { utilities.showToastMsg(response.message); }
			})
			.catch(error => {
				this.setState({ loading: false })
				console.log(error);
			});

    }
    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor:"#e43c22"}}>
                    <Grid>
                        <Col size={1} style={{ justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.goBack(null)}>
                                <Icon type="FontAwesome5" name="arrow-left" style={{ fontSize: 18, color: '#FFFFFF' }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={10} style={{ justifyContent: 'center' }}>
                            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold' }}>Remove Account</Text>
                        </Col>
                        <Col size={1}>
                        </Col>
                    </Grid>
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: "#e43c22" }}>
                    <Grid>
                        <Col size={1} style={{ justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.goBack(null)}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF' }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={10} style={{ justifyContent: 'center' }}>
                            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold' }}>Remove Account</Text>
                        </Col>
                        <Col size={1}>
                        </Col>
                    </Grid>
                </Header>
            )
        }
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {this._showHeader()}
                <StatusBar backgroundColor="#e43c22" />
                {/* <Card style={{ marginLeft: 10, marginRight: 10 }}>
                    <CardItem>
                        
                    </CardItem>
                </Card> */}
                 <ScrollView showsVerticalScrollIndicator={true}>
                <Body style ={{ margin: 10}} >
                            <Text style={{fontWeight:"bold", textAlign:'center'}}>
                              You can remove your account from our solution using this page.
		                	</Text>
                            
                            <Text></Text>
                            <Text>Following is the data we store related to your account:</Text>
                            <Text></Text>
                            <View style={{  marginLeft:20, marginRight:10}}>
                            <Text style={{textAlign:'justify', fontSize:15 }}>{'\u2B24'} Your basic profiling details like Name, Phone Number, Email-ID and login password.</Text>
                            <Text style={{ marginTop:5, textAlign:'justify',fontSize:15 }}>{'\u2B24'} A log of all your log-ins and logout sessions with timestamp and device-id, for security reasons.</Text>
                            <Text style={{  marginTop:5,textAlign:'justify',fontSize:15 }}>{'\u2B24'} Whenever you scan a Coupon for verification, we maintain your scan history and payment history, if applicable.</Text>
                            <Text></Text>
                            </View>
                        
                            <Text>If you agree to remove your account, then we will remove all the above data.</Text>
                            <Text></Text>
                           
                            <Text>Warning: Before you remove your account, as following will be true after that:</Text>
                            <Text></Text>
                            <View style={{ marginLeft:20}}>
                                <View style={{ flexDirection:"row",marginLeft:15,marginRight:10,marginTop:5}}>
                            {/* <Icon name="times" type="FontAwesome" style={{ fontSize: 15, color: 'red' }} /> */}
                            <Text style={{ textAlign:'justify',fontSize:15 }}>{'\u274C'} You will not be able to register again to our app & web-app using your current mobile number or/and email-id.</Text>
                            </View>
                           
                            <View style={{ flexDirection:"row",marginLeft:15,marginRight:10,marginTop:5}}>
                            {/* <Icon name="times" type="FontAwesome" style={{ fontSize: 15, color: 'red' }} /> */}
                            <Text style={{ textAlign:'justify',fontSize:15 }}>{'\u274C'} Any Coupon that you have verified till date, will be removed and will no longer be associated with your account. Thus, you have to re-scan them or/and make re-payments, if applicable.</Text>
                            <Text></Text>
                            </View>
                            </View>
                            <Text></Text>
                          
                           
                            <View style={{ flexDirection:"row",marginTop:15,}}>
                               
                            
                            <View style={{ margin:10,flex:1, flexDirection:'row'}}>
                            <CheckBox
                                onClick={()=>{
                                this.setState({
                                    isChecked:!this.state.isChecked
                                })
                                }}
                                isChecked={this.state.isChecked}
                            />
                                <Text > I have read the above and agree with the above conditions.</Text></View>
                            </View>
                            <View style={{ flexDirection:"row",alignItems: 'center', marginRight: 10, marginTop: 30, marginBottom: 0, bottom: 10 }} >
                            <Button onPress={ () => { 
                                //  console.log(this.state.carpenterId+"----"+this.state.userType);
                                 this.remove_account()
                                 } } rounded disabled={!this.state.isChecked } style={{ backgroundColor:  this.state.isChecked ? COLORS.crimson : '#ccc', }} >
									<Text style={{ fontWeight: 'bold' }}> Remove My Account</Text>
							</Button>
							<Button onPress={() => {
                                this.props.navigation.goBack(null); return true;
                            }}rounded style={{  marginLeft:20,backgroundColor: COLORS.steelblue , width: 90, justifyContent: 'center' }}  >
									<Text style={{ fontWeight: 'bold' }}> Back</Text>
							</Button>
                                                
							</View>
                            { this.state.isModalVisible ? 
                            <Modal animationType="slide" 
                                transparent 
                                // visible={this.state.isModalVisible} 
                                presentationStyle="overFullScreen"
                                // onDismiss={this.state.toggleModalVisibility}
                                >
                                <View style={styles.viewWrapper}>
                                    <View style={styles.modalView}>
                                        <Text></Text>
                                        <Text>Enter Username and Password to proceed </Text>
                                        <Text></Text>
                                        <TextInput placeholder="Username" 
                                                value={this.state.username} style={styles.textInput} 
                                                onChangeText={(value) => this.setState({ username : value })} />
                                                 <TextInput placeholder="Password" 
                                                value={this.state.password} style={styles.textInput} 
                                                onChangeText={(value) => this.setState({ password : value })} />
                
                                        {/** This button is responsible to close the modal */}
                                        
                                        <Button onPress={()=> {
                                             if(this.state.username == '' )
                                             { 
                                             utilities.showToastMsg("please enter username") 
                                             return;
                                             }
                                             if(this.state.password == '' )
                                             { 
                                             utilities.showToastMsg("please enter password") 
                                             return;
                                             }
                                             this.setState({ isModalVisible : false })
                                             Alert.alert(
                                                 'Alert!',
                                                 'Are you sure you want to remove your account?',
                                                 [
                                                     { text: 'NO' },
                                                     { text: 'YES', onPress: () => 
                                                     {
                                                    //  AsyncStorage.clear();
                
                                                    //  this.props.navigation.navigate('HomeScreen');
                                                     this.remove_account()
                                                    } },
                                                 ],
                                                 { cancelable: false }
                                             )}}
                                         rounded style={ styles.buttonStyle}  >
									    <Text style={{ fontWeight: 'bold' }}>Proceed</Text>
							            </Button>
                                    </View>
                                </View>
                            </Modal>
                            :
                            <View></View>}
                            
                        </Body>
                       
                        </ScrollView>
            </View>
        )
    }
}
const mapStateToProps = (state) => {
    console.log(state);
    if (state.VerifierReducer.LoginData) {
        return {
            user_type: 1
        }
    } else {
        return {
            user_type: 2
        }
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    viewWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    modalView: {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: "50%",
        left: "50%",
        elevation: 5,
        transform: [{ translateX: -(width * 0.4) }, 
                    { translateY: -90 }],
        height: 250,
        width: width * 0.8,
        backgroundColor: "#fff",
        borderRadius: 7,
    },
    textInput: {
        width: "80%",
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 1,
        marginBottom: 8,
    },
    buttonStyle:{
       
            width: "50%",
            borderRadius: 5,
            marginTop:5,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderColor: "rgba(0, 0, 0, 0.2)",
            borderWidth: 1,
            marginBottom: 10,
            backgroundColor  : COLORS.steelblue ,
            justifyContent:'center',
            alignSelf:'center'
           
      
    }
});
// export default connect(mapStateToProps, null)(RemoveAccount)