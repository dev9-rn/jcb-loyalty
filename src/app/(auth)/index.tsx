import { View, Image, ScrollView, ActivityIndicator, StatusBar } from 'react-native'
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
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from 'react-i18next';

type Props = {}

type FormData = {
    userPhone: string;
};

const SignInScreen = ({ }: Props) => {

    const { t } = useTranslation();

    const USER_TYPES = [t("login.distributor"), t("login.retailer")];

    const [selectedSignInType, setSelectedSignInType] = useState(t("login.distributor"));
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

    const { isDarkColorScheme, setColorScheme, colorScheme } = useColorScheme();

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

        const newTheme = isDarkColorScheme ? 'light' : 'dark';
        setColorScheme(newTheme);
    };

    const getLoginEndpoint = () => {
        if (selectedSignInType === t("login.mechanic")) {
            return MECHANIC_LOGIN
        };

        if (selectedSignInType === t("login.distributor")) {
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
            <StatusBar backgroundColor={"#FFF"} barStyle={"dark-content"} />
            <KeyboardAwareScrollView>
                <View className='items-center justify-center'>
                    <View>
                        <Image source={require("@/assets/images/app-logo.png")} className='size-64' resizeMode='contain' />
                    </View>

                    <View>
                        <Text className='text-3xl font-medium'>{t("login.signInAs")}{" "}
                            <Text className='text-3xl font-medium capitalize'>
                                {selectedSignInType}
                            </Text>
                        </Text>
                    </View>
                </View>

                <View className='mt-10 p-4'>
                    <View className='gap-2'>
                        <Text className='font-medium'>{t("login.phoneNumber")}</Text>

                        <Controller
                            control={control}
                            rules={{
                                required: t("login.phoneRequired"),
                                maxLength: {
                                    value: 10,
                                    message: t("login.phoneInvalid")
                                },
                                minLength: {
                                    value: 10,
                                    message: t("login.phoneInvalid")
                                }
                            }}
                            render={({ field: { onBlur, onChange, value } }) => (
                                <Input
                                    className={`rounded-lg focus:border-2 focus:border-primary ${errors.userPhone && "border-red-500 border-2"}`}
                                    placeholder={t("login.phoneNumber")}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType='numeric'
                                    maxLength={10}
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
                                    {t("login.loggingIn")}
                                </Text>
                            </View>
                        ) : (
                            <Text>{t("login.login")}</Text>
                        )}
                    </Button>

                    <View className='flex-row items-center gap-2'>
                        <Text>
                            {t("login.noAccount")}
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
                            <Text>{t("login.signUp")}</Text>
                        </Button>
                    </View>

                    <View className='flex-row items-center gap-4 my-6'>
                        <Separator className='flex-1' />
                        <Text className='text-sm text-gray-600'>{t("login.orSignInAs")}</Text>
                        <Separator className='flex-1' />
                    </View>

                    <Button onPress={() => toggleSignInType()} className={`${colorScheme !== "light" ? "bg-[#144799]" : "bg-[#f0a028]"}`}>
                        <Text>
                            {t("login.switchTo")}{" "}
                            <Text>{USER_TYPES[(USER_TYPES.indexOf(selectedSignInType) + 1) % USER_TYPES.length]}</Text>
                        </Text>
                    </Button>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default SignInScreen