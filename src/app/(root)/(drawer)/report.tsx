import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
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

type Props = {}

type ReportFormData = {
    couponSerial: "",
    couponDescription: "",
}

const ReportCouponScreen = ({ }: Props) => {

    const [pickedCouponImage, setPickedCouponImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { userDetails } = useUser();

    const toast = useToast();

    const { control, handleSubmit, setError, reset, formState: { errors } } = useForm<ReportFormData | FieldValues>({
        defaultValues: {
            couponSerial: '',
            couponDescription: ''
        }
    });

    const handleCouponReportSubmit: SubmitHandler<ReportFormData | FieldValues> = async (formData) => {

        const uploadReportFormData = new FormData();

        uploadReportFormData.append("srNo", formData.couponSerial);
        uploadReportFormData.append("description", formData.couponDescription);
        uploadReportFormData.append('distributorId', userDetails?.id);
        uploadReportFormData.append('couponFile', {
            uri: pickedCouponImage,
            type: 'image/jpeg',
            name: "abc.jpeg",
        });

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

    const handleCouponImagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.85,
        });

        if (!result.canceled) {
            setPickedCouponImage(result.assets[0].uri);
        };
    };

    return (
        <View className='flex-1 p-4 bg-white'>
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <View className='gap-2'>
                    <Text className='text-3xl font-bold text-primary'>
                        Upload the report
                    </Text>
                    <Text className='text-gray-600'>
                        Make sure the file format meets the requirement. It must be .*png or .*jpg
                    </Text>
                </View>

                <TouchableOpacity onPress={() => handleCouponImagePicker()}>
                    <View className='bg-primary/20 rounded-lg items-center justify-center my-6 h-52 border border-dashed border-primary'>
                        {!pickedCouponImage ? (
                            <>
                                <CloudUploadIcon className='text-primary' height={55} width={55} />
                                <Text className='font-medium text-gray-600'>
                                    Tap here to upload your images
                                </Text>
                            </>
                        ) : (
                            <View className='p-4 gap-2 items-center relative w-full'>
                                <Button size={"icon"} variant={"ghost"} className='absolute right-0 m-4' onPress={() => setPickedCouponImage(null)}>
                                    <X className='text-white' />
                                </Button>
                                <Image source={{ uri: pickedCouponImage }} className='w-48 h-36 rounded-lg' resizeMode='contain' />
                                <Text className='font-medium text-gray-600 opacity-40 text-sm'>
                                    Tap here again to edit your selection
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <View className='gap-4 my-6'>
                    <View className='gap-2'>
                        <Text className='font-medium'>Serial number of Coupon</Text>
                        <Controller
                            control={control}
                            rules={{
                                required: "Please enter your coupon's serial no."
                            }}
                            name='couponSerial'
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    className={`rounded-lg focus:border-primary focus:border-2 ${errors.couponSerial && "border-2 border-red-500"}`}
                                    placeholder="Enter coupon's serial no."
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
                        <Text className='font-medium'>Description about coupon.</Text>
                        <Controller
                            control={control}
                            rules={{
                                required: "Please enter the description of the report"
                            }}
                            name='couponDescription'
                            render={({ field: { onBlur, onChange, value } }) => (
                                <Input
                                    className={`rounded-lg focus:border-primary focus:border-2 ${errors.couponDescription && "border-2 border-red-500"}`}
                                    placeholder="Enter description about coupon."
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
                            <Text>Submitting report</Text>
                        </>
                    ) : (
                        <Text>
                            Submit Report
                        </Text>
                    )}
                </Button>
            </KeyboardAwareScrollView>
        </View >
    )
}

export default ReportCouponScreen