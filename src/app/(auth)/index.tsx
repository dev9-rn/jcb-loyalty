import { View, Image, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import useAuth from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import axios, { AxiosResponse } from 'axios';
import { router } from 'expo-router';
import { MECHANIC_LOGIN, RETAILER_LOGIN, USER_LOGIN } from '@/utils/routes';

type Props = {}

type FormData = {
    userPhone: string;
};

const USER_TYPES = ["distributor", "mechanic", "retailer"];


const SignInScreen = ({ }: Props) => {

    const [selectedSignInType, setSelectedSignInType] = useState<string>("distributor");
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

    const { login } = useAuth();

    const { control, handleSubmit, setError, formState: { errors } } = useForm<FormData | FieldValues>({
        defaultValues: {
            userPhone: "",
        }
    });

    const toggleSignInType = () => {
        setSelectedSignInType((prevType) => {
            const currentIndex = USER_TYPES.indexOf(prevType);
            const nextIndex = (currentIndex + 1) % USER_TYPES.length; // Cycle to the next type
            return USER_TYPES[nextIndex];
        });
    };

    const getLoginEndpoint = () => {
        if (selectedSignInType === "mechanic") {
            return MECHANIC_LOGIN
        };

        if (selectedSignInType === "distributor") {
            return USER_LOGIN
        };

        return RETAILER_LOGIN
    };

    const handleUserLogin: SubmitHandler<FormData | FieldValues> = async (formData) => {
        const loginFormData = new FormData();

        loginFormData.append("mobileNo", formData.userPhone);

        setIsLoggingIn(true);
        const loginResponse: AxiosResponse = await login(getLoginEndpoint(), loginFormData, selectedSignInType);
        setIsLoggingIn(false);
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
            })
        }
    };

    return (
        <SafeAreaView className='flex-1 bg-white'>

            <KeyboardAwareScrollView>
                <View className='items-center justify-center'>
                    <View>
                        <Image source={require("@/assets/images/app-logo.png")} className='size-64' resizeMode='contain' />
                    </View>

                    <View>
                        <Text className='text-3xl font-medium'>Sign in as{" "}
                            <Text className='text-3xl font-medium capitalize'>
                                {selectedSignInType}
                            </Text>
                        </Text>
                    </View>
                </View>

                <View className='mt-10 p-4'>
                    <View className='gap-2'>
                        <Text className='font-medium'>Phone Number</Text>

                        <Controller
                            control={control}
                            rules={{
                                required: "Please enter your phone number",
                                maxLength: {
                                    value: 10,
                                    message: "Please enter a 10-digit phone number"
                                },
                                minLength: {
                                    value: 10,
                                    message: "Please enter a 10-digit phone number"
                                }
                            }}
                            render={({ field: { onBlur, onChange, value } }) => (
                                <Input
                                    className={`rounded-lg focus:border-2 focus:border-primary ${errors.userPhone && "border-red-500 border-2"}`}
                                    placeholder='Phone Number'
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                            name='userPhone'
                        />

                        {errors.userPhone && <Text className='text-red-500 font-medium'>{errors.userPhone?.message?.toString()}</Text>}
                    </View>

                    <Button
                        className='my-4'
                        onPress={handleSubmit(handleUserLogin)}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <View className='flex-row gap-2'>
                                <ActivityIndicator color={"#FFF"} />
                                <Text>
                                    Logging In
                                </Text>
                            </View>
                        ) : (
                            <Text>Login</Text>
                        )}
                    </Button>

                    <View className='flex-row items-center gap-2'>
                        <Text>
                            Don't have an account?
                        </Text>
                        <Button
                            variant={"link"}
                            size={"sm"}
                            className='p-0'
                            onPress={() => router.navigate({
                                pathname: "/(auth)/sign-up",
                                params: {
                                    userType: selectedSignInType
                                }
                            })}
                        >
                            <Text>Sign Up</Text>
                        </Button>
                    </View>

                    <View className='flex-row items-center gap-4 my-6'>
                        <Separator className='flex-1' />
                        <Text className='text-sm text-gray-600'>Or Sign In as</Text>
                        <Separator className='flex-1' />
                    </View>

                    <Button onPress={() => toggleSignInType()}>
                        <Text>
                            <Text>Switch to {USER_TYPES[(USER_TYPES.indexOf(selectedSignInType) + 1) % USER_TYPES.length]}</Text>
                        </Text>
                    </Button>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default SignInScreen