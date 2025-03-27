import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router';

import { OtpInput } from "react-native-otp-entry";
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useAuth from '@/hooks/useAuth';
import useUser from '@/hooks/useUser';

type Props = {}

type FormData = {
    userOtp: string;
}

const OtpVerificationScreen = ({ }: Props) => {

    const { verify } = useAuth();
    const { userFirebaseToken } = useUser()

    const { userPhone } = useLocalSearchParams();

    const { control, handleSubmit, formState: { errors } } = useForm<FormData | FieldValues>({
        defaultValues: {
            userOtp: ""
        }
    });

    const handleUserVerification: SubmitHandler<FormData | FieldValues> = async (formData) => {

        const verifyOtpFormData = new FormData();

        verifyOtpFormData.append("mobileNo", userPhone);
        verifyOtpFormData.append("otp", formData.userOtp);
        verifyOtpFormData.append('deviceToken', userFirebaseToken);
        verifyOtpFormData.append('deviceType', Platform.OS);

        verify(verifyOtpFormData)
    }

    return (
        <SafeAreaView className='flex-1'>

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
                                    pinCodeContainerStyle: styles.pinCodeContainer,
                                }}
                            />
                        )}
                    />
                </View>

                <View className='gap-4'>
                    <Button variant={"outline"}>
                        <Text>Resend code via SMS</Text>
                    </Button>
                    <Button onPress={handleSubmit(handleUserVerification)}>
                        <Text>Verify</Text>
                    </Button>
                </View>
            </View>
        </SafeAreaView>
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