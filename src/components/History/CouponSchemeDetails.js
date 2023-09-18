import React, { Component } from 'react';
import { Alert,  FlatList, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity } from 'react-native';
import { Container, Header, Left, Body, Right, Content, ListItem, Card, CardItem, Text, Title, Item, Icon, Toast, Tab, Tabs } from 'native-base';
import { Col, Grid, Row } from "react-native-easy-grid";
import AsyncStorage from '@react-native-community/async-storage';

export default class CouponSchemeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redeemedCouponsDetails: this.props.navigation.state.params.redeemedCouponsDetails ? this.props.navigation.state.params.redeemedCouponsDetails : []
        }
        console.log(this.props);
    }
    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#0000FF' }} hasTabs>
                    <Left style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HistoryScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.6, alignItems: 'center' }}>
                        <Title style={{ textAlign: 'center', color: '#FFFFFF' }}>Scheme Details</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>
                    </Right>
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: '#0000FF' }} hasTabs>
                    <Left style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HistoryScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.6, alignItems: 'center' }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Scheme Details</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>

                    </Right>
                </Header>
            )
        }
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {this._showHeader()}
                {this.state.redeemedCouponsDetails.length > 0 ? this.state.redeemedCouponsDetails.map((item) => (
                    <Card style={{ height: 150, borderColor: '#f4b826', padding: 10, margin: 10 }}>
                        <View style={{ flex: 1, flexDirection: 'row', }}>
                            <View style={{ flex: 0.9, }} >
                                <Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Serial No : {item.id}</Text>
                            </View>
                            <View style={{ flex: 0.1, flexDirection: 'row' }}>
                                <Text style={{ fontSize: 12, color: 'green', paddingRight: 3 }}>{'\u20B9'}</Text>
                                <Text style={{ fontSize: 14 }}>{item.value}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 0.9, }} >
                                <Text style={{ alignSelf: 'flex-start', fontSize: 14 }}>Item Code : {item.item_code}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, }} >
                            <Text style={{ fontSize: 14 }}>Redemtion Date : {item.distributor_redemption_date}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14 }}>Status : {item.sap_interface_flag}</Text>
                        </View>
                    </Card>
                ))
                    : <Text style={{ fontSize: 28, color: '#BDBDBD', textAlign: 'center', textAlignVertical: 'center' }}>No data available!</Text>}
            </View>
        )
    }
}