import { ActivityIndicator, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    KeyboardAwareScrollView,
    KeyboardToolbar,
} from "react-native-keyboard-controller";
import useUser from "@/hooks/useUser";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
    createProfileUpdateForm,
    createSignUpForm,
} from "@/libs/schemas/profileUpdateFromSchemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import CountryDropdown from "@/components/CountryDropdown";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/utils/axiosInstance";
import {
    GET_BRANDS_BY_IDS,
    GET_CITIES_LIST,
    GET_COUNTRY_LIST,
    GET_DISTRIBUTOR_PROFILE,
    GET_STATE_LIST,
    REGISTER_DISTRIBUTOR,
    UPDATE_DISTRIBUTOR_PROFILE,
} from "@/utils/routes";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import StateDropdown from "@/components/StateDropdown";
import CitiesDropdown from "@/components/CitiesDropdown";
import { useTranslation } from "react-i18next";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
    IBrandsDetails,
    IDistributorProfileDetails,
    ILocationData,
    IMechanicDetails,
    IRetailerDetails,
} from "@/types/response";
import { createSchema } from "@/libs/schemas/signUpFormSchemas";

type Props = {};

const userTypeMap: Record<number, "distributor" | "mechanic" | "retailer"> = {
    0: "distributor",
    1: "mechanic",
    2: "retailer",
};

const SignUpScreen = ({ }: Props) => {
    const [profileDetails, setProfileDetails] = useState<
        | (IDistributorProfileDetails & IMechanicDetails & IRetailerDetails)
        | undefined
    >(undefined);
    const [countryList, setCountryList] = useState<ILocationData[]>([]);
    const [stateList, setStateList] = useState<ILocationData[]>([]);
    const [citiesList, setCitiesList] = useState<ILocationData[]>([]);
    const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const { userDetails, fetchUserProfileDetails } = useUser();
    const { brandId } = useLocalSearchParams();
    const { t } = useTranslation();

    const toast = useToast();

    const signUpFormprofileUpdateForm = createSchema(t);
    type ProfileUpdateFormValues = z.infer<typeof signUpFormprofileUpdateForm>;
    useFocusEffect(
        useCallback(() => {
            fetchCountryList();
            // fetchUserProfile();
        }, []),
        // fetchBrands();
    );    

    const {
        control,
        handleSubmit,
        reset,
        getValues,
        resetField,
        watch,
        formState: { errors },
    } = useForm<ProfileUpdateFormValues>({
        resolver: zodResolver(createSchema(t)),
        disabled: false,
        defaultValues: {
            userName: "",
            userPincode: "",
            distributorEmail: "",
            distributorCompanyName: "",
            distributorPanNumber: "",
            distributorGstNumber: "",
            // distributorBrand: {
            //     id: "",
            //     name: "",
            // },
            distributorAddress: "",
            userCity: {
                id: "",
                name: " ",
            },
            userCountry: {
                id: "",
                name: "",
            },
            userPhoneNumber: "",
            userState: {
                id: "",
                name: "",
            },
        },
    });

    const watchedCountry = watch("userCountry");
    const watchedState = watch("userState");

    useEffect(() => {
        if (!watchedCountry.id && !userDetails?.country_id) return;

        fetchStateList();
    }, [watchedCountry.id, userDetails?.country_id]);

    useEffect(() => {
        if (!watchedState.id && !userDetails?.state_id) return;

        fetchCitiesList();
    }, [watchedState.id]);

    useEffect(() => {
        if (
            !profileDetails ||
            // !brands ||
            countryList.length === 0 ||
            stateList.length === 0 ||
            citiesList.length === 0
        )
            return;

        // const currentUserBrand = brands.find(
        //     (brand) => brand.id === profileDetails.brand_id,
        // );
        const matchedCountry = countryList.find(
            (country) => country.id == userDetails?.country_id,
        );
        const matchedState = stateList.find(
            (state) => state.id == userDetails?.state_id,
        );
        const matchedCity = citiesList.find(
            (city) => city.id == userDetails?.city_id,
        );

        reset({
            userName: profileDetails.name || profileDetails.dealer_name,
            distributorAddress: profileDetails.address,
            userPhoneNumber: profileDetails.mobile || profileDetails.mobile_no,
            distributorCompanyName: profileDetails.company_name,
            distributorEmail: profileDetails.email,
            distributorGstNumber: profileDetails.gst_no,
            distributorPanNumber: profileDetails.pan_no,
            distributorStreetAddress: profileDetails.street,
            userPincode: profileDetails.pincode || profileDetails.pin_code,
            userCountry: matchedCountry || { id: "", name: "" },
            userState: matchedState || { id: "", name: "" },
            userCity: matchedCity || { id: "", name: "" },
        });
    }, [profileDetails, countryList, stateList, citiesList]);

    // Get the list of the COUNTRIES for dropdown
    const fetchCountryList = async () => {
        try {
            const response = await axiosInstance.post(GET_COUNTRY_LIST);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response,
                });
            }
            setCountryList(response.data.countries);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response,
                });
            }
        }
    };

    // Get the list of the STATES for dropdown
    const fetchStateList = async () => {
        const stateListFormData = new FormData();
        stateListFormData.append(
            "countryId",
            watchedCountry.id || userDetails?.country_id,
        );

        try {
            const response = await axiosInstance.post(
                GET_STATE_LIST,
                stateListFormData,
            );

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response,
                });
            }

            setStateList(response.data.states);
        } catch (error) {
            error;
        }
    };

    // Get the list of the CITIES for dropdown
    const fetchCitiesList = async () => {
        const citiesFormData = new FormData();
        citiesFormData.append("stateId", watchedState.id || userDetails?.state_id);

        try {
            const response = await axiosInstance.post(
                GET_CITIES_LIST,
                citiesFormData,
            );

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response,
                });
            }

            setCitiesList(response.data.cities);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response,
                });
            }
        }
    };

    const handleProfileSubmit: SubmitHandler<ProfileUpdateFormValues> = async (
        formData,
    ) => {

        const updateProfileFormData = new FormData();
        updateProfileFormData.append("name", formData.userName);
        updateProfileFormData.append("mobileNo", formData.userPhoneNumber);
        updateProfileFormData.append("emailId", formData.distributorEmail);
        updateProfileFormData.append("address", formData.distributorAddress);
        updateProfileFormData.append("street", formData.distributorStreetAddress);
        updateProfileFormData.append("pinCode", formData.userPincode);
        updateProfileFormData.append("brandId", String(brandId));
        updateProfileFormData.append("countryId", formData.userCountry.id);
        updateProfileFormData.append("stateId", formData.userState.id);
        updateProfileFormData.append("cityId", formData.userCity.id);
        updateProfileFormData.append(
            "companyName",
            formData.distributorCompanyName,
        );
        updateProfileFormData.append(
            "panNo",
            formData.distributorPanNumber as string,
        );
        updateProfileFormData.append("gstNo", formData.distributorGstNumber);
        setIsLoading(true)

        try {
            const response = await axiosInstance.post(
                REGISTER_DISTRIBUTOR,
                updateProfileFormData,
            );

            if (response.data.status != 200) {
                toast.show(response.data.message,{
                    data:{
                        status:  400
                    }
                });
                setIsLoading(false)
                return;
            }
            if (response.data.status === 200) {
                toast.show(`${response.data?.message || 'OTP sent successfully'}`, {
                    data: { type: "success" },
                    placement: "bottom",
                });
                setIsLoading(false)
                router.navigate({
                    pathname: "/(auth)/otp-verify",
                    params: {
                        userPhone: formData.userPhoneNumber,
                    },
                });
                return
            }
        } catch (error) {
            setIsLoading(false)
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response,
                });
            }
        }
    };

    const toggleFormState = () => {
        setIsFormDisabled(!isFormDisabled);
    };

    return (
        <>
            <View className="bg-white p-4 flex-1">
                <KeyboardAwareScrollView
                    bottomOffset={100}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-semibold capitalize">
                                {t("login.profile_distributor_title")}
                            </Text>
                            {/* <Text className='text-gray-500 text-sm'>{t("signup.subtitle")}</Text> */}
                        </View>

                        {/* <Button className='flex-row items-center gap-4' onPress={() => toggleFormState()} variant={isFormDisabled ? "default" : "destructive"}>
                            <PencilLineIcon className='text-white' height={20} width={20} />
                            <Text>
                                {isFormDisabled ? "Edit" : "Discard"}
                            </Text>
                        </Button> */}
                    </View>

                    <View className="mt-4 gap-3">
                        <View className="gap-1">
                            <Text>
                                {t("login.profile_distributor_name")}{" "}
                                <Text className="text-red-500">*</Text>
                            </Text>

                            <Controller
                                control={control}
                                name="userName"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userName && "border-red-500"}`}
                                        placeholder={t("login.profile_distributor_name")}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.userName && (
                                <Text className="text-red-500 font-medium">
                                    {errors.userName.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-1">
                            <Text>
                                {t("login.profile_distributor_phnNo")}{" "}
                                <Text className="text-red-500">*</Text>
                            </Text>

                            <Controller
                                control={control}
                                name="userPhoneNumber"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userPhoneNumber && "border-red-500"}`}
                                        placeholder={t("login.profile_distributor_phnNo")}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                    />
                                )}
                            />
                            {errors.userPhoneNumber && (
                                <Text className="text-red-500 font-medium">
                                    {errors.userPhoneNumber.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-1">
                            <Text>
                                {t("login.profile_distributor_email")}{" "}
                                <Text className="text-red-500">*</Text>
                            </Text>

                            <Controller
                                control={control}
                                name="distributorEmail"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.distributorEmail && "border-red-500"}`}
                                        placeholder={t("login.profile_distributor_email")}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.distributorEmail && (
                                <Text className="text-red-500 font-medium">
                                    {errors.distributorEmail.message}
                                </Text>
                            )}
                        </View>

                        <View className="py-4">
                            <Text className="font-semibold text-lg xs:text-xl">
                                {t("signup.addressInformation")}
                            </Text>
                            <Text className="text-xs xs:text-sm text-gray-500">
                                {t("signup.addressInformationSubtitle")}
                            </Text>
                        </View>

                        <View className="gap-1">
                            <Text>
                                {t("signup.fields.address")}{" "}
                                <Text className="text-red-500">*</Text>
                            </Text>

                            <Controller
                                control={control}
                                name="distributorAddress"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Textarea
                                        className={`focus:border-2 focus:border-primary ${errors.distributorAddress && "border-red-500"}`}
                                        placeholder={t("signup.fields.addressPlaceholder")}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />

                            {errors.distributorAddress && (
                                <Text className="text-red-500 font-medium">
                                    {errors.distributorAddress.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-1">
                            <Text className="">
                                {t("signup.fields.street")}{" "}
                                <Text className="text-red-500">*</Text>
                            </Text>

                            <Controller
                                control={control}
                                name="distributorStreetAddress"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.distributorStreetAddress && "border-red-500"}`}
                                        placeholder={t("signup.fields.streetPlaceholder")}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.distributorStreetAddress && (
                                <Text className="text-red-500 font-medium">
                                    {errors.distributorStreetAddress.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-1">
                            <Text>
                                {t("signup.fields.pincode")}{" "}
                                <Text className="text-red-500">*</Text>
                            </Text>

                            <Controller
                                control={control}
                                name="userPincode"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userPincode && "border-red-500"}`}
                                        placeholder={t("signup.fields.pincodePlaceholder")}
                                        keyboardType="numeric"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.userPincode && (
                                <Text className="text-red-500 font-medium">
                                    {errors.userPincode.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View className="gap-3">
                        <View className="gap-1">
                            <Text>{t("signup.fields.selectCountry")}</Text>

                            <Controller
                                control={control}
                                name="userCountry"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <CountryDropdown
                                        onSelect={onChange}
                                        options={countryList}
                                        selected={{
                                            label: value.name,
                                            value: value.id,
                                        }}
                                    />
                                )}
                            />
                            {errors.userCountry && (
                                <Text className="text-red-500 font-medium">
                                    {errors.userCountry.id?.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-1">
                            <Text>{t("signup.fields.selectState")}</Text>

                            <Controller
                                control={control}
                                name="userState"
                                render={({ field: { onBlur, onChange, value, disabled } }) => (
                                    <StateDropdown
                                        onSelect={onChange}
                                        options={stateList}
                                        selected={{
                                            label: value.name,
                                            value: value.id,
                                        }}
                                    />
                                )}
                            />
                            {errors.userState && (
                                <Text className="text-red-500 font-medium">
                                    {errors.userState.id?.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-1">
                            <Text>{t("signup.fields.selectCity")}</Text>

                            <Controller
                                control={control}
                                name="userCity"
                                render={({ field: { onBlur, onChange, value, disabled } }) => (
                                    <CitiesDropdown
                                        onSelect={onChange}
                                        options={citiesList}
                                        selected={{
                                            label: value.name,
                                            value: value.id,
                                        }}
                                    />
                                )}
                            />
                            {errors.userCity && (
                                <Text className="text-red-500 font-medium">
                                    {errors.userCity.id?.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-1">
                            <Text>{t("signup.fields.companyName")}</Text>

                            <Controller
                                control={control}
                                name="distributorCompanyName"
                                render={({ field: { onBlur, onChange, value, disabled } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.distributorCompanyName && "border-red-500"}`}
                                        placeholder={t("signup.fields.companyNamePlaceholder")}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                        </View>

                        <View className="gap-1">
                            <Text>{t("signup.fields.panNumber")}</Text>

                            <Controller
                                control={control}
                                name="distributorPanNumber"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.distributorPanNumber && "border-red-500"}`}
                                        placeholder={t("signup.fields.panNumberPlaceholder")}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.distributorPanNumber && (
                                <Text className="text-red-500 font-medium">
                                    {errors.distributorPanNumber.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-1">
                            <Text>{t("signup.fields.gstNumber")}</Text>

                            <Controller
                                control={control}
                                name="distributorGstNumber"
                                render={({ field: { onBlur, onChange, value, disabled } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.distributorGstNumber && "border-red-500"}`}
                                        placeholder={t("signup.fields.gstNumberPlaceholder")}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />

                            {errors.distributorGstNumber && (
                                <Text className="text-red-500 font-medium">
                                    {errors.distributorGstNumber.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View className="my-6">
                        <Button onPress={handleSubmit(handleProfileSubmit)}>
                            {isLoading ? <ActivityIndicator size={'small'}/> :<Text>SIGN UP</Text>}
                        </Button>
                    </View>
                </KeyboardAwareScrollView>
            </View>
            <KeyboardToolbar />
        </>
    );
};

export default SignUpScreen;
