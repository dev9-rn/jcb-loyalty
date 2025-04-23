import React, { Component } from 'react';
import { Alert, ScrollView, StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Header, Left, Body, Right, Title, Icon } from 'native-base';
import Loader from '../../Utility/Loader';
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import * as utilities from '../../Utility/utilities';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';

class BankDetailScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bank_name: '',
            account_no: "",
            confirm_account_no: "", // New state for confirm account number
            beneficiary_name: "",
            branch_name: "",
            ifsc_code: "",
            id: "",
            created_date: "",
            loading: false,
            loaderText: 'Loading',
            noMoreDataError: '',
            distributorId: '',
            isEditable: false, // To toggle edit mode
            accountNoChanged: false, // Track if account number has changed
        }
    }

    async _getAsyncData() {
        await AsyncStorage.getItem('USERDATA', (err, result) => {
            var lData = JSON.parse(result);
            if (lData) {
                this.setState({ distributorId: lData.data.id }, () => {
                    this._callApiForReportHistory(lData.data.id);
                })
            }
        });
    }

    componentDidMount = () => {
        this._getAsyncData();
    }

    _callApiForReportHistory = (distributorId) => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('distributorId', distributorId);

        var lUrl = URL + 'getDistributorBankDetails';
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
                this.setState({ loading: false })
                if (!lResponseData) {
                    Alert.alert('Error', 'Something went wrong. Please try again later');
                } else if ([400, 403, 404, 500].includes(lResponseData.status)) {
                    this.setState({ noMoreDataError: lResponseData.message || "No more data." });
                } else if (lResponseData.status === 200) {
                    const { bank_name, account_no, beneficiary_name, branch_name, ifsc_code } = lResponseData.bankDetails;
                    this.setState({ bank_name, account_no, beneficiary_name, branch_name, ifsc_code });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    _showHeader() {
        return (
            <Header style={{ backgroundColor: '#0000FF' }} hasTabs>
                <Left style={{ flex: 0.2 }}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                        <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF' }} />
                    </TouchableOpacity>
                </Left>
                <Body style={{ flex: 0.6, alignItems: 'center' }}>
                    <Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.payment_screen_waller_details')}</Title>
                </Body>
                <Right style={{ flex: 0.2 }} />
            </Header>
        );
    }

    toggleEdit = () => {
        this.setState(prevState => ({
            isEditable: !prevState.isEditable,
            accountNoChanged: prevState.account_no !== this.state.account_no // Check if account number was changed
        }));
    }

    handleUpdate = () => {
        const { account_no, confirm_account_no } = this.state;

        // Validate account numbers match
        if (this.state.accountNoChanged && account_no !== confirm_account_no) {
            Alert.alert('Error', 'Account number and confirm account number do not match');
            return;
        }

        console.log(this.state);

        this.setState({ loading: true });

        const formData = new FormData();
        formData.append('distributorId', this.state.distributorId);
        formData.append('beneficiaryName', this.state.beneficiary_name);
        formData.append('bankName', this.state.bank_name);
        formData.append('accountNo', this.state.account_no);
        formData.append('ifscCode', this.state.ifsc_code);
        formData.append('branchName', this.state.branch_name);

        var lUrl = URL + 'saveBankDetailsForDistributor';
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
            } else if (lResponseData.status == 500 || lResponseData.status == 400 || lResponseData.status == 403) {
                this.setState({ noMoreDataError: "" });
                utilities.showToastMsg(lResponseData.message);
            } else if (lResponseData.status == 404) {
                this.setState({ noMoreDataError: "No more data." });
                return;
            } else if (lResponseData.status == 200) {
                utilities.showToastMsg(lResponseData.message);
                this.props.navigation.navigate('HomeScreen');
            }
        })
        .catch((error) => {
            console.log(error);
            this.setState({ loading: false });
        });
    }

    render() {
        const { isEditable, accountNoChanged } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                {this._showHeader()}
                <Loader loading={this.state.loading} text={this.state.loaderText} />

                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Bank Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Bank Name"
                            value={this.state.bank_name}
                            onChangeText={(text) => this.setState({ bank_name: text })}
                            editable={isEditable}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Account Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Account Number"
                            value={this.state.account_no}
                            onChangeText={(text) => this.setState({ account_no: text, accountNoChanged: true })} // Update accountNoChanged when account number changes
                            editable={isEditable}
                        />
                    </View>

                    {/* Conditionally render Confirm Account Number Field */}
                    {accountNoChanged && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirm Account Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter Account Number"
                                value={this.state.confirm_account_no}
                                onChangeText={(text) => this.setState({ confirm_account_no: text })}
                                editable={isEditable}
                            />
                        </View>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Beneficiary Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Beneficiary Name"
                            value={this.state.beneficiary_name}
                            onChangeText={(text) => this.setState({ beneficiary_name: text })}
                            editable={isEditable}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Branch Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Branch Name"
                            value={this.state.branch_name}
                            onChangeText={(text) => this.setState({ branch_name: text })}
                            editable={isEditable}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>IFSC Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter IFSC Code"
                            value={this.state.ifsc_code}
                            onChangeText={(text) => this.setState({ ifsc_code: text })}
                            editable={isEditable}
                        />
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={isEditable ? this.handleUpdate : this.toggleEdit}>
                        <Text style={styles.buttonText}>
                            {isEditable ? 'Update Bank Details' : 'Edit Bank Details'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    submitButton: {
        backgroundColor: '#0000FF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BankDetailScreen;
