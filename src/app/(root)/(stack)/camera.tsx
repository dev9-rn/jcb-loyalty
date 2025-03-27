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
import { CHECK_COUPON, REDEEM_COUPON } from '@/utils/routes';
import CouponRedeemedDialog from '@/components/CouponRedeemedDialog';

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
    const [isCouponRedeemed, setIsCouponRedeem] = useState<boolean>(false);
    const [coupondRedeemedData, setCouponRedeemedData] = useState<IRedeemedCoupon | undefined>(undefined);

    const toast = useToast()
    const { userDetails } = useUser();

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

    const handleBarCodeScanned = ({ bounds, data }: BarcodeScanningResult) => {
        if (scanned || isCouponRedeemed) return;

        setScanned(true);
        fetchBarCodeDataValidation(data);

        setTimeout(() => setScanned(false), 2000); // Enable scanning after 2 seconds
    };

    // Check if the coupon is valid via API
    const fetchBarCodeDataValidation = async (data: string) => {
        const barCodeFormData = new FormData();

        barCodeFormData.append('qrText', data);
        barCodeFormData.append('distributorId', userDetails?.id);
        barCodeFormData.append('userType', userDetails?.userType);

        try {
            const response = await axiosInstance.post(CHECK_COUPON, barCodeFormData);

            if (response.data.stauts != 200) {
                setCouponValidationData(response.data);
                fetchCouponRedeemResults(data);
            }

        } catch (error) {
            toast.show(error.response?.data?.message || error.message, {
                data: error.response?.data || error.message
            });
            setTimeout(() => setScanned(false), 2000);
        }
    };

    // Check if the coupon can be redeemed and offer type
    const fetchCouponRedeemResults = async (data: string) => {
        if (!couponValidationData) return;

        const redeemFormData = new FormData();

        redeemFormData.append('qrText', data);
        redeemFormData.append('distributorId', userDetails?.id as string);
        redeemFormData.append('redeemType', couponValidationData.redeemMethods[0].redeem_type);
        redeemFormData.append('userType', userDetails?.userType);

        try {
            const response = await axiosInstance.post(REDEEM_COUPON, redeemFormData);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response.data
                });
            };

            setCouponRedeemedData(response.data)
            setIsCouponRedeem(true);
        } catch (error) {
            toast.show(error.response?.data?.message || error.message, {
                data: error.response?.data || error.message
            });
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