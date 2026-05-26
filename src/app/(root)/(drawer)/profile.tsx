import { TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    KeyboardAwareScrollView,
    KeyboardToolbar,
} from "react-native-keyboard-controller";
import useUser from "@/hooks/useUser";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
    createProfileUpdateForm,
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
    UPDATE_DISTRIBUTOR_PROFILE,
} from "@/utils/routes";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import StateDropdown from "@/components/StateDropdown";
import CitiesDropdown from "@/components/CitiesDropdown";
import { useTranslation } from "react-i18next";
import { router, useFocusEffect } from "expo-router";
import { IBrandsDetails, IDistributorProfileDetails, ILocationData, IRetailerDetails } from "@/types/response";
import i18n from "@/libs/i18n";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {};

const userTypeMap: Record<number, "distributor" | "mechanic" | "retailer"> = {
    0: "distributor",
    1: "mechanic",
    2: "retailer",
};

const ProfileScreen = ({ }: Props) => {
    const [profileDetails, setProfileDetails] = useState<
        | (IDistributorProfileDetails & IRetailerDetails)
        | undefined
    >(undefined);
    const [countryList, setCountryList] = useState<ILocationData[]>([]);
    const [stateList, setStateList] = useState<ILocationData[]>([]);
    const [citiesList, setCitiesList] = useState<ILocationData[]>([]);
    const [brands, setBrands] = useState<IBrandsDetails[]>([]);
    const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
    const [discardChanges, setDiscardChanges] = useState<boolean>(true);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const { userDetails, fetchUserProfileDetails } = useUser();
    const { t } = useTranslation();

    const toast = useToast();

    const insets = useSafeAreaInsets();

    const signUpFormprofileUpdateForm = createProfileUpdateForm(t);
    type ProfileUpdateFormValues = z.infer<typeof signUpFormprofileUpdateForm>;
    useFocusEffect(
        useCallback(() => {
            setIsInitialized(false); // Reset initialization flag to allow form refresh
            fetchCountryList();
            fetchUserProfile();
        }, []),
        // fetchBrands()
    );

    const {
        control,
        handleSubmit,
        reset,
        getValues,
        resetField,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ProfileUpdateFormValues>({
        resolver: zodResolver(signUpFormprofileUpdateForm),
        disabled: false,
        defaultValues: {
            userName: "",
            userPincode: "",
            distributorEmail: "",
            distributorCompanyName: "",
            distributorPanNumber: "",
            distributorGstNumber: "",
            distributorBrand: {
                id: "",
                name: "",
            },
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
    }, [watchedState.id, userDetails?.state_id]);

    useEffect(() => {
        if (
            !profileDetails ||
            !brands ||
            countryList.length === 0
        )
            return;

        const currentUserBrand = brands.find(
            (brand) => String(brand.id) === String(profileDetails.brand_id),
        );
        const matchedCountry = countryList.find(
            (country) => String(country.id) === String(profileDetails?.country_id),
        );

        reset({
            userName: profileDetails?.name || profileDetails?.dealer_name,
            distributorAddress: profileDetails?.address,
            userPhoneNumber: profileDetails?.mobile || profileDetails?.mobile_no,
            distributorBrand: currentUserBrand || { id: "", name: "" },
            distributorCompanyName: profileDetails?.company_name,
            distributorEmail: profileDetails?.email,
            distributorGstNumber: profileDetails?.gst_no,
            distributorPanNumber: profileDetails?.pan_no,
            distributorStreetAddress: profileDetails?.street,
            userPincode: profileDetails?.pincode || profileDetails?.pin_code,
            userCountry: matchedCountry || { id: "", name: "" },
            userState: { id: "", name: "" },
            userCity: { id: "", name: "" },
        });

        setIsInitialized(true);
    }, [profileDetails, brands, countryList, reset]);


    // Separate effect to update state and city options based on watched values
    useEffect(() => {
        if (!isInitialized) return;

        const matchedState = stateList.find(
            (state) => String(state.id) === String(profileDetails?.state_id),
        );
        const matchedCity = citiesList.find(
            (city) => String(city.id) === String(profileDetails?.city_id),
        );

        // Update state/city with matched values from profile data
        const currentStateValue = getValues("userState");
        const currentCityValue = getValues("userCity");

        if (!currentStateValue?.id && matchedState) {
            resetField("userState", { defaultValue: matchedState });
        }

        if (!currentCityValue?.id && matchedCity) {
            resetField("userCity", { defaultValue: matchedCity });
        }
    }, [stateList, citiesList, isInitialized, userDetails?.state_id, userDetails?.city_id, getValues, resetField]);

    // Get the list of the COUNTRIES for dropdown
    const fetchCountryList = async () => {
        try {
            const response = await axiosInstance.post(GET_COUNTRY_LIST);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response,
                });
            }
            setCountryList((response.data.countries || []).map((c: any) => ({ ...c, id: String(c.id) })));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response,
                });
            }
            setCountryList([]);
        }
    };

    // Get the list of the STATES for dropdown
    const fetchStateList = async () => {
        const stateListFormData = new FormData();
        stateListFormData.append(
            "countryId",
            watchedCountry.id || String(profileDetails?.country_id || userDetails?.country_id || ""),
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

            setStateList((response.data.states || []).map((s: any) => ({ ...s, id: String(s.id) })));
        } catch (error) {
            setStateList([]);
        }
    };

    // Get the list of the CITIES for dropdown
    const fetchCitiesList = async () => {
        const citiesFormData = new FormData();
        citiesFormData.append("stateId", watchedState.id || String(profileDetails?.state_id || userDetails?.state_id || ""));

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

            setCitiesList((response.data.cities || []).map((c: any) => ({ ...c, id: String(c.id) })));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response,
                });
            }
            setCitiesList([]);
        }
    };

    const fetchUserProfile = async () => {
        const profileFormData = new FormData();
        profileFormData.append("distributorId", String(userDetails?.id));

        try {
            const response = await axiosInstance.post(
                GET_DISTRIBUTOR_PROFILE,
                profileFormData,
            );
            const brandResponse = await axiosInstance.post(GET_BRANDS_BY_IDS);

            if (response.data.status != 200) {
                toast.show(response.data.message, { data: { response } });
            }

            setBrands(brandResponse.data.brands);
            setProfileDetails(response.data.data);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, { data: error.response });
            }
        }
    };

    const handleProfileSubmit: SubmitHandler<ProfileUpdateFormValues> = async (
        formData,
    ) => {
        console.log(formData, "formData ---");

        // Disabled fields are excluded from formData by RHF, so fall back to getValues
        const country = formData.userCountry ?? getValues("userCountry");
        const state = formData.userState ?? getValues("userState");
        const city = formData.userCity ?? getValues("userCity");

        const updateProfileFormData = new FormData();
        updateProfileFormData.append("distributorId", String(userDetails?.id));
        updateProfileFormData.append("name", formData.userName);
        updateProfileFormData.append("mobileNo", formData.userPhoneNumber);
        updateProfileFormData.append("emailId", formData.distributorEmail);
        updateProfileFormData.append("address", formData.distributorAddress);
        updateProfileFormData.append("street", formData.distributorStreetAddress);
        updateProfileFormData.append("pinCode", formData.userPincode);
        updateProfileFormData.append("brandId", userDetails?.brand_id);
        updateProfileFormData.append("countryId", country.id); 
        updateProfileFormData.append("stateId", state.id);      
        updateProfileFormData.append("cityId", city.id);        
        updateProfileFormData.append("companyName", formData.distributorCompanyName);
        updateProfileFormData.append("panNo", formData.distributorPanNumber as string);
        updateProfileFormData.append("gstNo", formData.distributorGstNumber);

        try {
            const response = await axiosInstance.post(
                UPDATE_DISTRIBUTOR_PROFILE,
                updateProfileFormData,
            );

            if (response.data.status != 200) {
                toast.show(response.data.message);
                return;
            }

            toast.show(response.data.message, { data: response });
            fetchUserProfileDetails();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, { data: error.response });
            }
        }
    };

    const toggleFormState = () => {
        setIsFormDisabled(!isFormDisabled);
    };

    return (
        <>
            <View className="bg-white p-4 flex-1" style={{ paddingBottom: insets.bottom }}>
                <KeyboardAwareScrollView
                    bottomOffset={100}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-semibold capitalize">
                                {t("login.profile_distributor_title")}
                            </Text>
                        </View>
                    </View>

                    <View className="mt-4 gap-3">
                        <View className="gap-1">
                            <Text>{t("login.profile_distributor_name")}</Text>

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
                            <Text>{t("login.profile_distributor_phnNo")}</Text>

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
                            <Text>{t("login.profile_distributor_email")}</Text>

                            <Controller
                                control={control}
                                name="distributorEmail"
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.distributorEmail && "border-red-500"}`}
                                        placeholder={t("login.profile_distributor_emaill")}
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
                            <Text className="">{t("signup.fields.street")}</Text>

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

                        <View className="gap-1">
                            <Text>{t("signup.fields.selectBrand")}</Text>

                            <Controller
                                control={control}
                                name="distributorBrand"
                                disabled={true}
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.distributorBrand && "border-red-500"}`}
                                        placeholder="Enter company name"
                                        value={value.name}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        editable={false}
                                    />
                                )}
                            />
                            {errors.distributorBrand && (
                                <Text className="text-red-500 font-medium">
                                    {errors.distributorBrand.id?.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View className="gap-3">
                        {/* ── Country ── */}
                        <View className="gap-1">
                            <Text>{t("signup.fields.selectCountry")}</Text>

                            <Controller
                                control={control}
                                name="userCountry"
                                disabled={true}
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <CountryDropdown
                                        onSelect={onChange}
                                        options={countryList}
                                        selected={{
                                            label: value.name,
                                            value: value.id,
                                        }}
                                        disabled={true}
                                    />
                                )}

                            />
                            {errors.userCountry && (
                                <Text className="text-red-500 font-medium">
                                    {errors.userCountry.id?.message}
                                </Text>
                            )}
                        </View>

                        {/* ── State (only shown after a country is selected) ── */}
                        <View className="gap-1">
                            <Text>{t("signup.fields.selectState")}</Text>

                            <Controller
                                control={control}
                                name="userState"
                                render={({ field: { onBlur, onChange, value } }) => (
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

                        {/* ── City (only shown after a state is selected) ── */}
                        <View className="gap-1">
                            <Text>{t("signup.fields.selectCity")}</Text>

                            <Controller
                                control={control}
                                name="userCity"
                                render={({ field: { onBlur, onChange, value } }) => (
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
                                render={({ field: { onBlur, onChange, value } }) => (
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
                                render={({ field: { onBlur, onChange, value } }) => (
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
                            <Text>Submit</Text>
                        </Button>

                        <View className="flex-row items-center my-4">
                            <View className="h-px flex-1 bg-gray-500" />
                            <Text className="uppercase mx-2">or</Text>
                            <View className="h-px flex-1 bg-gray-500" />
                        </View>

                        <Button
                            onPress={() => router.navigate("/remove-account")}
                            variant={"destructive"}
                        >
                            <Text>Remove Account</Text>
                        </Button>
                    </View>
                </KeyboardAwareScrollView>
                {/* <DiscardFormDialog
                    open={discardChanges}
                    setIsFormDisabled={setIsFormDisabled}
                    setDiscardChanges={setDiscardChanges}
                /> */}
            </View>


            {userDetails?.userType == 2 && <View className="mt-6 px-6 mb-5">
                <TouchableOpacity className="w-full py-3 border border-red-500 rounded-lg items-center justify-center" onPress={() => router.navigate('/remove-account')}>
                    <Text className="text-base text-red-600 font-semibold">
                        Remove My Account
                    </Text>
                </TouchableOpacity>
            </View>}
            {userDetails?.userType !== 2 && <KeyboardToolbar />}
        </>
    );
};

export default ProfileScreen;
