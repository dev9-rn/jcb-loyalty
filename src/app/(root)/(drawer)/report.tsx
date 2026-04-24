import { View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker';

import { CloudUploadIcon } from "@/libs/icons/CloudUploadIcon"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import useUser from '@/hooks/useUser'

import { X } from "@/libs/icons/X"
import axiosInstance from '@/utils/axiosInstance';
import { POST_REPORT_COUPON } from '@/utils/routes';
import { useToast } from 'react-native-toast-notifications';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {}

type ReportFormData = {
    couponSerial: "",
    couponDescription: "",
}

const ReportCouponScreen = ({ }: Props) => {

    const [pickedFrontsideCouponImage, setPickedFrontsideCouponImage] = useState<string | null>(null);
    const [pickedBacksideCouponImage, setPickedBacksideCouponImage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { userDetails } = useUser();
    const { t } = useTranslation();

    const toast = useToast();
    const insets = useSafeAreaInsets();

    const { control, handleSubmit, setError, reset, formState: { errors } } = useForm<ReportFormData | FieldValues>({
        defaultValues: {
            couponSerial: '',
            couponDescription: ''
        }
    });

    const handleCouponReportSubmit: SubmitHandler<ReportFormData | FieldValues> = async (formData) => {

        if (!pickedFrontsideCouponImage) {
            toast.show(t("reportCoupon.missingImages"), {
                data: { status: 400 }
            });
            return;
        };

        const uploadReportFormData = new FormData();

        uploadReportFormData.append("srNo", formData.couponSerial);
        uploadReportFormData.append("description", formData.couponDescription);
        uploadReportFormData.append('distributorId', String(userDetails?.id));
        uploadReportFormData.append('couponFile', {
            uri: pickedFrontsideCouponImage,
            type: 'image/jpeg',
            name: "abc.jpeg",
        });
        console.log(uploadReportFormData, "uploadReportFormData");
        
        try {
            setIsSubmitting(true);
            const response = await axiosInstance.post(POST_REPORT_COUPON, uploadReportFormData);

            if (response.data.status != 200) {
                setIsSubmitting(false)
                toast.show(response.data.message, {
                    data: response
                });
            };

            toast.show(response.data.message, {
                data: response
            });
            reset();
            setPickedBacksideCouponImage(null)
            setPickedFrontsideCouponImage(null);
            setIsSubmitting(false);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError("couponSerial", {
                    type: error.response?.data.status,
                    message: error.response?.data.message
                });
                if (error.response?.data.status === 422) {
                    setError("couponSerial", {
                        type: error.response?.data.status,
                        message: error.response?.data.message
                    });
                    setError("couponDescription", {
                        type: error.response?.data.status,
                        message: error.response?.data.message
                    });
                }
                setIsSubmitting(false)
                return toast.show(error.response?.data.message, {
                    data: error.response
                });
            }
            setIsSubmitting(false)
            toast.show(error?.message);
        }
    };

    const handleFrontsideCouponImagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.85,
        });

        if (!result.canceled) {
            setPickedFrontsideCouponImage(result.assets[0].uri);
        };
    };

    const handleFrontsideCouponImageFromCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (!permissionResult.granted) {
            Alert.alert(t("common.permission"), t("common.cameraPermissionRequired"));
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.85,
        });

        if (!result.canceled) {
            setPickedFrontsideCouponImage(result.assets[0].uri);
        };
    };

    const showFrontsideCouponImageOptions = () => {
        Alert.alert(
            t("reportCoupon.selectImage"),
            t("reportCoupon.chooseOption"),
            [
                {
                    text: t("reportCoupon.camera"),
                    onPress: handleFrontsideCouponImageFromCamera,
                },
                {
                    text: t("reportCoupon.gallery"),
                    onPress: handleFrontsideCouponImagePicker,
                },
                {
                    text: t("common.cancel"),
                    onPress: () => { },
                    style: "cancel",
                },
            ]
        );
    };

    const handleBacksideCouponImageFromCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(t("common.permission"), t("common.cameraPermissionRequired"));
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.85,
        });

        if (!result.canceled) {
            setPickedBacksideCouponImage(result.assets[0].uri);
        };
    };
    return (
        <View className='flex-1 p-4 bg-white' style={{paddingBottom: insets.bottom}}>
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <View className='gap-2'>
                    <Text className='text-3xl font-bold text-primary'>{t("reportCoupon.title")}</Text>
                    <Text className='text-gray-600'>{t("reportCoupon.subtitle")}</Text>
                </View>

                <View className='flex-1 items-center justify-between'>
                    <TouchableOpacity onPress={() => showFrontsideCouponImageOptions()}>
                        <View className='bg-primary/20 rounded-lg items-center justify-center my-6 size-44 xs:size-48 sm:size-52 border border-dashed border-primary'>
                            {!pickedFrontsideCouponImage ? (
                                <View className='items-center'>
                                    <CloudUploadIcon className='text-primary' height={55} width={55} />
                                    <Text className='font-medium text-gray-600 text-center'>{t("reportCoupon.frontImagePlaceholder")}</Text>
                                </View>
                            ) : (
                                <View className='p-4 gap-2 items-center relative w-full'>
                                    <Button size={"icon"} variant={"ghost"} className='absolute right-0 m-4' onPress={() => setPickedFrontsideCouponImage(null)}>
                                        <X className='text-white' />
                                    </Button>
                                    <Image source={{ uri: pickedFrontsideCouponImage }} className='w-48 h-36 rounded-lg' resizeMode='contain' />
                                    <Text className='font-medium text-gray-600 opacity-40 text-sm'>{t("reportCoupon.editImageHint")}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <View className='gap-4 my-6'>
                    <View className='gap-2'>
                        <Text className='font-medium'>{t("reportCoupon.serialLabel")}</Text>
                        <Controller
                            control={control}
                            rules={{ required: t("reportCoupon.serialError") }}
                            name='couponSerial'
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    className={`rounded-lg focus:border-primary focus:border-2 ${errors.couponSerial && "border-2 border-red-500"}`}
                                    placeholder={t("reportCoupon.serialPlaceholder")}
                                    keyboardType='default'
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.couponSerial && <Text className='text-red-500 font-medium'>{errors.couponSerial.message?.toString()}</Text>}
                    </View>

                    <View className='gap-2'>
                        <Text className='font-medium'>{t("reportCoupon.descriptionLabel")}</Text>
                        <Controller
                            control={control}
                            rules={{ required: t("reportCoupon.descriptionError") }}
                            name='couponDescription'
                            render={({ field: { onBlur, onChange, value } }) => (
                                <Input
                                    className={`rounded-lg focus:border-primary focus:border-2 ${errors.couponDescription && "border-2 border-red-500"}`}
                                    placeholder={t("reportCoupon.descriptionPlaceholder")}
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.couponDescription && <Text className='text-red-500 font-medium'>{errors.couponDescription.message?.toString()}</Text>}
                    </View>
                </View>

                <Button className='my-6 flex-row items-center' onPress={handleSubmit(handleCouponReportSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <ActivityIndicator className='mr-2' color={"#FFF"} />
                            <Text>{t("reportCoupon.submitting")}</Text>
                        </>
                    ) : (
                        <Text>{t("reportCoupon.submit")}</Text>
                    )}
                </Button>
            </KeyboardAwareScrollView>
        </View >
    )
}

export default ReportCouponScreen