import { View, Image, ActivityIndicator, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Controller,
    FieldValues,
    SubmitHandler,
    useForm,
} from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import axios, { AxiosResponse } from "axios";
import { router } from "expo-router";
import { DISPLAY_NOTIFICATION_DASHBOARD, MECHANIC_LOGIN, RETAILER_LOGIN, USER_LOGIN } from "@/utils/routes";
import { useTranslation } from "react-i18next";
import UserSelectionDropdown from "@/components/UserSelectionDropdown";
import CustomModal from "@/components/CustomModel";
import axiosInstance from "@/utils/axiosInstance";

type Props = {};

type FormData = {
    userPhone: string;
};

const SignInScreen = ({ }: Props) => {
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);

    const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

    const USER_TYPES = [
        {
            value: t("login.distributor"),
            label: capitalize(t("login.distributor")),
        },
        {
            value: t("login.retailer"),
            label: capitalize(t("login.retailer")),
        },
    ];

    const [selectedSignInType, setSelectedSignInType] = useState<{
        value: string;
        label: string;
    }>(USER_TYPES[0]);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [showDisplayNotification, setShowDisplayNotification] =
        useState<boolean>(false);
    const [displayNotificationData, setDisplayNotificationData] =
        useState<string>("");

    const { login } = useAuth();

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData | FieldValues>({
        defaultValues: {
            userPhone: "",
        },
    });

    const getLoginEndpoint = () => {
        if (selectedSignInType.value === t("login.mechanic")) {
            return MECHANIC_LOGIN;
        }

        if (selectedSignInType.value === t("login.distributor")) {
            return USER_LOGIN;
        }

        return RETAILER_LOGIN;
    };

    const handleUserLogin: SubmitHandler<FormData | FieldValues> = async (
        formData,
    ) => {
        const loginFormData = new FormData();
        loginFormData.append("mobileNo", formData.userPhone.toString());

        try {
            setIsLoggingIn(true);

            const loginResponse: AxiosResponse = await login(
                USER_LOGIN,
                loginFormData,
            );

            setIsLoggingIn(false);

            if (loginResponse.status !== 200) {
                setError("userPhone", {
                    type: loginResponse.status.toString(),
                    message: loginResponse?.message,
                });
            }
        } catch (error) {
            setIsLoggingIn(false);

            if (axios.isAxiosError(error)) {
                setError("userPhone", {
                    type: error.response?.data.status,
                    message: error.response?.data.message,
                });
            }
        }
    };

    const handleChangeBarcode = (e: string) => {
        console.log(e, "TEXT BARCODE");
    };

    const fetchDisplayNotification = async () => {
        try {
            const { data } = await axiosInstance.get<IFDisplayNotification>(
                DISPLAY_NOTIFICATION_DASHBOARD,
            );
            if (data?.showNotification > 0) {
                setShowDisplayNotification(true);
                setDisplayNotificationData(data?.notification);
            } else {
                setDisplayNotificationData(data?.notification);
            }
        } catch (error) {
            console.log(error, "DISPLAY NOTIFICATION API");
        }
    };

    useEffect(() => {
        fetchDisplayNotification();
    }, [])

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar backgroundColor={"#FFF"} barStyle={"dark-content"} />
            <KeyboardAwareScrollView>
                <View className="items-center justify-center">
                    <View>
                        <Image
                            source={require("@/assets/images/logo_NPL_2.png")}
                            className="size-64"
                            resizeMode="contain"
                        />
                    </View>

                    {/* <View>
                        <Text className='text-3xl font-medium'>{t("login.signInAs")}{" "}
                            <Text className='text-3xl font-medium capitalize'>
                                {selectedSignInType.label}
                            </Text>
                        </Text>
                    </View> */}
                </View>

                <View className="mt-10 p-4">
                    <View className="my-4 gap-2">
                        {/* <Text className='font-medium'>{t("login.loginType")}</Text> */}

                        {/* <UserSelectionDropdown
                            defaultLoginType={USER_TYPES[0]}
                            userLoginTypes={USER_TYPES}
                            setSelectedSignInType={setSelectedSignInType}
                        /> */}
                    </View>

                    <View className="gap-2">
                        <Text className="font-medium">{t("login.distributorLogin")}</Text>

                        <Controller
                            control={control}
                            rules={{
                                required: t("login.errors.phoneRequired"),
                                maxLength: {
                                    value: 10,
                                    message: t("login.errors.phoneInvalid"),
                                },
                                minLength: {
                                    value: 10,
                                    message: t("login.errors.phoneInvalid"),
                                },
                            }}
                            render={({ field: { onBlur, onChange, value } }) => (
                                <Input
                                    className={`rounded-lg focus:border-2 focus:border-primary ${errors.userPhone && "border-red-500 border-2"}`}
                                    placeholder={t(
                                        "login.paymentOptions_screen_placeholder_mobileno",
                                    )}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                            )}
                            name="userPhone"
                        />

                        {errors.userPhone && (
                            <Text className="text-red-500 font-medium">
                                {errors.userPhone?.message?.toString()}
                            </Text>
                        )}
                    </View>

                    <Button
                        className="my-4"
                        onPress={handleSubmit(handleUserLogin)}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <View className="flex-row gap-2">
                                <ActivityIndicator color={"#FFF"} />
                                <Text>
                                    {t("login.distributorLogin")}
                                    {/* <Text className='capitalize'>
                                        {selectedSignInType.label}
                                    </Text> */}
                                </Text>
                            </View>
                        ) : (
                            <Text>
                                {t("login.distributorLogin")}{" "}
                                {/* <Text className='capitalize'>
                                    {selectedSignInType.label}
                                </Text> */}
                            </Text>
                        )}
                    </Button>

                    <View className="flex-row items-center gap-2">
                        {/* <Text>
                            {t("login.noAccount")}
                        </Text> */}
                        <Button
                            variant={"link"}
                            size={"sm"}
                            className="p-0"
                            onPress={() => setModalVisible(true)}
                        >
                            <Text>{t("login.clickHereToSignUp")}</Text>
                        </Button>
                    </View>
                    <CustomModal
                        visible={showDisplayNotification}
                        onClose={() => setShowDisplayNotification(false)}
                        title="Important Notice"
                        showIcon
                    >
                        <View className="p-4 bg-white rounded-md">
                            {/* <View className="flex-row gap-3 items-center">
            <TriangleAlert className="text-[#856404] mr-2" />
            <Text className="text-[16px] font-bold">Important Notice</Text>
          </View> */}
                            <Text className="">{displayNotificationData.trim()}</Text>
                        </View>
                    </CustomModal>
                    <CustomModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        title={t("login.brandCodeInsert")}
                    >
                        <View className="flex-col gap-3">
                            <Text className="font-medium text-[16px]">
                                {t("login.brandCode")} :{" "}
                            </Text>
                            <Input
                                onChangeText={handleChangeBarcode}
                                maxLength={4}
                                placeholder={t("login.brandCode")}
                            />
                            <Button
                                className="my-4"
                                // onPress={handleSubmit(handleUserLogin)}
                                disabled={isLoggingIn}
                            >
                                <Text>{t("login.profileScreenSubmit")}</Text>
                            </Button>
                        </View>
                    </CustomModal>
                </View>
            </KeyboardAwareScrollView>

            {/* <View className='self-center mb-4'>
                <Text className='text-center text-base font-medium'>Powered By</Text>
                <Image
                    source={require("@/assets/images/partner-brand.png")}
                    className='h-24 w-60'
                    resizeMode='contain'
                />
            </View> */}
        </SafeAreaView>
    );
};

export default SignInScreen;
