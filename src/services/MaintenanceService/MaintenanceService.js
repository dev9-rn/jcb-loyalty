import { createNavigationContainerRef } from '@react-navigation/native';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../App';
import AsyncStorage from '@react-native-community/async-storage';
import NavigationService from '../NavigationService';

export const isMaintenance = async ({navigation , isRefresh = false}) =>{
    // console.log("Function executed at: " + new Date());
    let isMaintenanceEnabled = false;
    let systemStatus = '';
    var lUrl = URL + 'getSiteStatus';
    await fetch(lUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application\/json',
            'Content-Type': 'multipart\/form-data',
        },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        console.log(responseJson);
        // console.log(Boolean(responseJson?.maintenanceStatus))
        isMaintenanceEnabled = Boolean(responseJson?.maintenanceStatus);
        systemStatus = responseJson?.systemStatus;
    })
    .catch((error) => {
        console.log(error);
    });
    if(isMaintenanceEnabled){
        await AsyncStorage.setItem('ISMAINTENANCE', JSON.stringify({"isMaintenanceEnabled" : isMaintenanceEnabled , lastRefreshOn : new Date() ,systemStatus : systemStatus }));
        NavigationService?.navigate('MaintenancePage')
    }else{
        if(isRefresh){
            await AsyncStorage.getItem('USERDATA', (err, result) => {   // USERDATA is set on VerifierLoginScreen
                var lData = JSON.parse(result);
                if (lData) {
                  if (lData.data.id) {
                    NavigationService.navigate('HomeScreen');
                  }
                  else{
                    NavigationService.navigate('LoginScreen');
                  }
                }else{
                    NavigationService.navigate('LoginScreen');
                }
              });
            // navigation.navigate('LoginScreen');
        }
        await AsyncStorage.setItem('ISMAINTENANCE', JSON.stringify({"isMaintenanceEnabled" : isMaintenanceEnabled}));
    }
    return isMaintenanceEnabled;
}
