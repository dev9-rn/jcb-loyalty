import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
     Alert,  BackHandler, Dimensions,
    TouchableHighlight, Modal, Platform, StyleSheet, View, TouchableOpacity, StatusBar, Linking
} from 'react-native';
import { Header, Left, Body, Text, Title, Icon } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AndroidOpenSettings from 'react-native-android-open-settings';
import ScanService from '../../services/ScanService/ScanService';
import CustomHeader from '../../Utility/CustomHeader';
import Loader from '../../Utility/Loader';
import * as utilities from '../../Utility/utilities';
import * as app from '../../App';
// import Moment from 'moment';

var redeemMethodsT = [];
export default class ScreenForScan extends Component {
    constructor(props) {
        super(props);
        this.distributorId;
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
            modalVisible: false,
        };
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible});
      }
    
      render() {
        return (
            <View>
            <Modal>
              <View style={{ flex: 1 }}>
                <Text>I am the modal content!</Text>
              </View>
            </Modal>
          </View>
        );
      }
      
    }