import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import BarcodeMask from 'react-native-barcode-mask';
import { useNavigation } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useToast } from 'react-native-toast-notifications';

import { ZapOffIcon } from '@/libs/icons/ZapIconOff';
import { ZapIcon } from '@/libs/icons/ZapIcon';
import useUser from '@/hooks/useUser';
import axiosInstance from '@/utils/axiosInstance';
import { CHECK_COUPON, REDEEM_COUPON, REDEEM_MECHANIC_COUPON, SCAN_RETAILER_COUPON } from '@/utils/routes';
import CouponRedeemedDialog from '@/components/CouponRedeemedDialog';
import axios from 'axios';
import CouponErrorDialog from '@/components/CouponErrorDialog';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import CouponTypeRedeemDialog from '@/components/CouponTypeRedeemDialog';

type Props = {}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Define the mask size
const MASK_WIDTH = SCREEN_WIDTH * 0.7;
const MASK_HEIGHT = SCREEN_WIDTH * 0.7;

const CameraScreen = ({ }: Props) => {

    const [flashMode, setFlashMode] = useState<boolean>(false);
    const [scanned, setScanned] = useState(false);
    const [couponValidationData, setCouponValidationData] = useState<IValidCoupon | undefined>(undefined);
    const [isCouponInvalid, setIsCouponInvalid] = useState<boolean>(false);
    const [isCouponRedeemed, setIsCouponRedeem] = useState<boolean>(false);
    const [coupondRedeemedData, setCouponRedeemedData] = useState<IRedeemedCoupon | undefined>(undefined);
    const [isCouponTypeMultiple, setIsCouponTypeMultiple] = useState<boolean>(false);
    const [qrData, setQrData] = useState<string>("");

    const toast = useToast()
    const { userDetails } = useUser();
    const qrSuccessAudio = useAudioPlayer(require("@/assets/sounds/qr-scan-success_1.wav"));
    const qrErrorAudio = useAudioPlayer(require("@/assets/sounds/qr-scan-error_2.mp3"));

    const cameraRef = useRef<CameraView | null>(null);
    const [permission, requestPermission] = useCameraPermissions();

    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({
            title: "Scan Coupons",
            headerTransparent: true,
            headerTitleStyle: {
                color: '#FFF'
            },
            headerTintColor: 'white',
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        setFlashMode(!flashMode)
                    }}
                >
                    {flashMode ? (
                        <ZapIcon color={"#FFF"} />
                    ) : (
                        <ZapOffIcon color={"#FFF"} />
                    )}
                </TouchableOpacity>
            )
        })
    }, [flashMode]);

    useEffect(() => {
        requestPermission();
    }, []);

    const getRedeemCouponEndpoint = () => {
        if (userDetails?.userType === 0) {
            return {
                endpoint: REDEEM_COUPON,
                user_id: "distributorId"
            }
        };

        if (userDetails?.userType === 1) {
            return {
                endpoint: REDEEM_MECHANIC_COUPON,
                user_id: "mechanicId"
            }
        };

        return {
            endpoint: SCAN_RETAILER_COUPON,
            user_id: "dealerId"
        }
    };

    const getCheckCouponEndpoint = () => {
        if (userDetails?.userType === 0) {
            return {
                endpoint: CHECK_COUPON,
                user_id: "distributorId"
            };
        };

        if (userDetails?.userType === 1) {
            return {
                endpoint: CHECK_COUPON,
                user_id: "mechanicId"
            };
        };

        return {
            endpoint: CHECK_COUPON,
            user_id: "dealerId"
        };
    }

    const handleBarCodeScanned = ({ bounds, data }: BarcodeScanningResult) => {
        if (scanned || isCouponRedeemed || isCouponInvalid) return;

        setScanned(true);
        fetchBarCodeDataValidation(data);
        setQrData(data);
        setTimeout(() => setScanned(false), 2000); // Enable scanning after 2 seconds
    };

    // Check if the coupon is valid via API
    const fetchBarCodeDataValidation = async (data: string) => {
        const barCodeFormData = new FormData();

        barCodeFormData.append('qrText', data);
        barCodeFormData.append(getCheckCouponEndpoint().user_id, userDetails?.id);
        barCodeFormData.append('userType', userDetails?.userType);

        try {
            const response = await axiosInstance.post(CHECK_COUPON, barCodeFormData);

            if (response.data.status != 200) {
                setCouponValidationData(response.data);
                setIsCouponInvalid(true);
                toast.show(response.data.message, {
                    data: response
                });
            };

            setCouponValidationData(response.data);
            if (response.data?.redeemMethods.length as number > 1) {
                setIsCouponTypeMultiple(true);
            } else {
                fetchCouponRedeemResults(data, response.data?.redeemMethods[0].redeem_type || "");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                qrErrorAudio.play();
                qrErrorAudio.seekTo(0);
                setCouponValidationData(error.response?.data);
                setIsCouponInvalid(true);
                setIsCouponTypeMultiple(false);
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                )
            };
            setTimeout(() => setScanned(false), 2000);
        }
    };

    // Check if the coupon can be redeemed and offer type
    const fetchCouponRedeemResults = async (data: string, redeemedType: string) => {
        if (couponValidationData?.status != 200) return;

        const redeemFormData = new FormData();

        redeemFormData.append(getRedeemCouponEndpoint().user_id, userDetails?.id as string);
        redeemFormData.append('qrText', data);
        redeemFormData.append('redeemType', redeemedType);
        redeemFormData.append('userType', userDetails?.userType);

        try {
            const response = await axiosInstance.post(getRedeemCouponEndpoint().endpoint, redeemFormData);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response.data
                });
            };

            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
            qrSuccessAudio.play();
            qrSuccessAudio.seekTo(0);
            setCouponRedeemedData(response.data)
            setIsCouponRedeem(true);
            setIsCouponTypeMultiple(false)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                qrErrorAudio.play();
                qrErrorAudio.seekTo(0);
                setCouponValidationData(error.response?.data);
                setIsCouponInvalid(true);
                setIsCouponTypeMultiple(false);
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                )
                // toast.show(error.response?.data?.message || error.message, {
                //     data: error.response || error.message
                // });
            };
            setTimeout(() => setScanned(false), 2000);
        }
    }

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View className='flex-1 bg-white items-center justify-center gap-4'>
                <Text className='font-medium'>We need your permission to show the camera</Text>
                <Button onPress={() => requestPermission()}>
                    <Text>Grant Camera Access</Text>
                </Button>
            </View>
        );
    }

    return (
        <View className='flex-1'>
            <CameraView
                style={styles.camera}
                enableTorch={flashMode}
                flash='on'
                onBarcodeScanned={handleBarCodeScanned}
            >
                <BarcodeMask
                    width={MASK_WIDTH}
                    height={MASK_HEIGHT}
                    showAnimatedLine={false}
                    edgeRadius={8}
                />

                {couponValidationData?.status != 200 && (
                    <CouponErrorDialog
                        isCouponInvalid={isCouponInvalid}
                        validationData={couponValidationData}
                        setIsCouponInvalid={setIsCouponInvalid}
                    />
                )}

                {isCouponTypeMultiple && (
                    <CouponTypeRedeemDialog
                        isCouponTypeMultiple={isCouponTypeMultiple}
                        validationData={couponValidationData}
                        fetchCouponRedeemResults={fetchCouponRedeemResults}
                        qrData={qrData}
                    />
                )}

                {isCouponRedeemed && (
                    <CouponRedeemedDialog
                        isCouponRedeemed={isCouponRedeemed}
                        redeemedData={coupondRedeemedData}
                        setIsCouponRedeem={setIsCouponRedeem}
                    />
                )}
            </CameraView>
        </View>
    )
}

export default CameraScreen

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
})