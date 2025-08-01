import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity } from 'react-native';
import {View, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import { isMaintenance } from '../services/MaintenanceService/MaintenanceService';
import Loader from '../Utility/Loader';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';

const {width : deviceWidth , height : deviceHeight} = Dimensions.get('screen');

const MaintenancePage = ({navigation}) => {
    const [isLoading , setIsLoading] = useState(false);
    const [lastRefresh , setLastRefresh] = useState();
    const [systemStatus , setSystemStatus] = useState('');
    const onRefresh = async()=>{
        setIsLoading(true);
        await isMaintenance({navigation , isRefresh :true})
        setLastRefresh(new Date());
        setTimeout(()=>{
            setIsLoading(false);
        },2000)
    }

    useEffect(()=>{
        AsyncStorage.getItem('ISMAINTENANCE', async (err, result) => {   // USERDATA is set on VerifierLoginScreen
            var lData = JSON.parse(result);
            setLastRefresh(lData?.lastRefreshOn)
            setSystemStatus(lData?.systemStatus)
            console.log("===========lData?.lastRefreshOn" ,lData)
        })
    })

    return (
        <View style={{
            // borderWidth : 1,
            flexDirection : 'column',
            flex : 1,
            justifyContent : 'center'
        }}>
            <View style={{
                flexDirection : 'column',
                justifyContent : 'center',
            }}>   
                <Text style={{
                    textAlign : 'center',
                    fontSize : 12,
                    marginTop : 10,
                    marginHorizontal : 10,
                    letterSpacing : 1.1,
                    color : 'red'
                }}>System status : {systemStatus}</Text>
                <FastImage
                    source={require('../images/maintenance.jpg')}
                    style={{
                        width : deviceWidth,
                        // borderWidth : 1,
                        aspectRatio : 1/1
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={{
                    textAlign : 'center',
                    fontSize : 18,
                    color : '#000',
                    fontWeight : '600',
                    letterSpacing : 1.1,
                    textTransform : 'uppercase'
                }}>Under Maintenance</Text>
                <Text style={{
                    textAlign : 'center',
                    fontSize : 12,
                    marginTop : 10,
                    marginHorizontal : 10,
                    letterSpacing : 1.1,
                }}>Temporarily offline for improvements.</Text>
                <Text style={{
                    textAlign : 'center',
                    fontSize : 12,
                    marginTop : 5,
                    marginHorizontal : 10,
                    letterSpacing : 1.1,
                }}>We'll be back soon!</Text>
                <TouchableOpacity 
                    onPress={()=>{onRefresh()}}
                    style={{
                        backgroundColor : '#0096FF',
                        borderRadius : 8,
                        paddingHorizontal : 4,
                        paddingVertical : 5,
                        marginVertical : 15,
                        alignSelf: 'center'
                    }}
                >
                    <Text style={{
                        textAlign : 'center',
                        fontSize : 14,
                        // lineHeight : 19,
                        color : '#FFF',
                        fontWeight : '600',
                        marginHorizontal : 10,
                        letterSpacing : 1.1,
                    }}>Refresh</Text>
                </TouchableOpacity>

                <Text style={{
                    textAlign : 'center',
                    fontSize : 12,
                    fontWeight : '500',
                    marginHorizontal : 10,
                    letterSpacing : 1.1,
                }}>Last Refreshed : {moment.utc(lastRefresh).local().startOf('seconds').fromNow()}</Text>
            </View>
            {isLoading ? 
            <Loader
                text={'Loading'}
            /> : null}
        </View>
    );
}

const styles = StyleSheet.create({})

export default MaintenancePage;
