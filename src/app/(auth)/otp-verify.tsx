import { View, StyleSheet, Platform } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router';

import { OtpInput } from "react-native-otp-entry";
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useAuth from '@/hooks/useAuth';
import axios, { AxiosResponse } from 'axios';
import { RETAILER_LOGIN, VERIFY_MECHANIC, VERIFY_OTP, VERIFY_RETAILER, VERIFY_VALID_RETAILER } from '@/utils/routes';
import RetailerApprovalDialog from '@/components/RetailerApprovalDialog';
import useNotification from '@/hooks/useNotification';
import { useTranslation } from 'react-i18next';

type Props = {}

type FormData = {
    userOtp: string;
}

const OtpVerificationScreen = ({ }: Props) => {

    const [isApprovalDialogVisible, setIsApprovalDialogVisible] = useState<boolean>(false);
    const [approvalDialogContent, setApprovalDialogContent] = useState<{ status: number, message: string } | undefined>(undefined);

    const { verify, login } = useAuth();
    const { expoPushToken } = useNotification();
    const { t } = useTranslation()

    const { userPhone, userType, methodType } = useLocalSearchParams();

    const { control, handleSubmit, setError, formState: { errors } } = useForm<FormData | FieldValues>({
        defaultValues: {
            userOtp: ""
        }
    });

    const getVerifyEndpoint = () => {
        if (userType === t("login.mechanic")) {
            return VERIFY_MECHANIC
        };

        if (userType === t("login.distributor")) {
            return VERIFY_OTP
        };

        return methodType === t("login.retailer") ? VERIFY_VALID_RETAILER : VERIFY_RETAILER;
    };

    const handleUserVerification: SubmitHandler<FormData | FieldValues> = async (formData) => {

        const verifyOtpFormData = new FormData();

        verifyOtpFormData.append("mobileNo", userPhone as string);
        verifyOtpFormData.append("otp", formData.userOtp);
        verifyOtpFormData.append('deviceToken', expoPushToken as string);
        verifyOtpFormData.append('deviceType', Platform.OS);

        const verifyResponse: AxiosResponse = await verify(getVerifyEndpoint(), verifyOtpFormData, userType as string);

        if ((!verifyResponse.data.accesstoken || !verifyResponse.headers.accesstoken) && verifyResponse.data.status === 200) {
            setIsApprovalDialogVisible(true)
            setApprovalDialogContent(verifyResponse.data);
        };

        if (axios.isAxiosError(verifyResponse)) {
            setError("userOtp", {
                type: verifyResponse.response?.data.satus,
                message: verifyResponse.response?.data.message,
            })
        }

        if (verifyResponse.data.status != 200) {
            setError("userOtp", {
                type: verifyResponse.data.satus,
                message: verifyResponse.data.message,
            })
        }
    };

    const getLoginEndpoint = () => {
        if (userType === t("login.mechanic")) {
            return VERIFY_MECHANIC
        };

        if (userType === t("login.distributor")) {
            return VERIFY_OTP
        };

        return RETAILER_LOGIN
    };

    const handleResendCode = async () => {
        const resendFormData = new FormData();

        resendFormData.append("mobileNo", userPhone as string);

        // setIsLoggingIn(true);
        const loginResponse: AxiosResponse = await login(getLoginEndpoint(), resendFormData, userType as string);
        // setIsLoggingIn(false);
        if (axios.isAxiosError(loginResponse)) {
            setError("userPhone", {
                type: loginResponse.response?.data.satus,
                message: loginResponse.response?.data.message,
            })
        }

        if (loginResponse.data.status != 200) {
            setError("userPhone", {
                type: loginResponse.data.satus,
                message: loginResponse.data.message,
            });
        };
    };

    console.log(errors, "FORM_ERROR");

    return (
        <View className='flex-1 bg-white'>

            <View className='p-4 flex-1'>
                <Text className='text-3xl font-semibold'>
                    Verify your phone number
                </Text>

                <View className='my-10 gap-4'>
                    <Text className='text-lg font-medium'>
                        Enter the 4-digit code sent to you at{"\n"}
                        <Text className='text-primary font-semibold text-lg'>
                            +91 {userPhone}
                        </Text>
                    </Text>
                    <Controller
                        control={control}
                        name='userOtp'
                        render={({ field: { onBlur, onChange, value } }) => (
                            <OtpInput
                                numberOfDigits={4}
                                focusColor={"#14479c"}
                                blurOnFilled={true}
                                type='numeric'
                                onTextChange={onChange}
                                onBlur={onBlur}
                                theme={{
                                    containerStyle: styles.container,
                                    pinCodeContainerStyle: errors.userOtp ? { ...styles.pinCodeContainer, borderColor: "#ef4444", borderWidth: 2 } : styles.pinCodeContainer,
                                }}
                            />
                        )}
                    />
                    {errors.userOtp && <Text className='text-red-500 font-medium'>{errors.userOtp.message?.toString()}</Text>}
                </View>

                <View className='gap-4'>
                    <Button variant={"outline"} onPress={() => handleResendCode()}>
                        <Text>Resend code via SMS</Text>
                    </Button>
                    <Button onPress={handleSubmit(handleUserVerification)}>
                        <Text>Verify</Text>
                    </Button>
                </View>


                <RetailerApprovalDialog
                    isApprovalDialogVisible={isApprovalDialogVisible}
                    setIsApprovalDialogVisible={setIsApprovalDialogVisible}
                    approvalDialogContent={approvalDialogContent}
                />
            </View>
        </View>
    )
}

export default OtpVerificationScreen

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    pinCodeContainer: {
        flexGrow: 1,
    },
})