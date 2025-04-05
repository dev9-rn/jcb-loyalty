import { View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller'
import { Textarea } from '@/components/ui/textarea'
import axiosInstance from '@/utils/axiosInstance'
import useUser from '@/hooks/useUser'
import { z } from "zod";

import {
    GET_BRANDS_BY_IDS,
    GET_CITIES_LIST,
    GET_COUNTRY_LIST,
    GET_DISTRIBUTOR_PROFILE,
    GET_MECHANIC_PROFILE,
    GET_RETAILER_PROFILE,
    GET_STATE_LIST,
    UPDATE_DISTRIBUTOR_PROFILE,
    UPDATE_MECHANIC_PROFILE,
    UPDATE_RETAILER_PROFILE
} from '@/utils/routes'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useToast } from 'react-native-toast-notifications'
import axios from 'axios'
import CountryDropdown from '@/components/CountryDropdown'
import StateDropdown from '@/components/StateDropdown'
import CitiesDropdown from '@/components/CitiesDropdown'
import { getProfileEndpoint } from '@/libs/utils'

type Props = {}

// 0 = des, 1 = mech, 2 = delearde

export const dealerFormSchema = z.object({
    dealerName: z.string({
        required_error: "Please enter your full name",
    }).nonempty({
        message: "Please enter your full name"
    }).refine((value) => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value ?? ""), {
        message: "Name should only contain letters"
    }),
    dealerPhoneNumber: z.string({
        required_error: "Please enter your phone number"
    }).nonempty().refine((value) => /^[0-9]{10}$/.test(value), {
        message: "Enter a valid 10-digit phone number"
    }),
    dealerEmail: z.string({
        required_error: "Please enter your Email Address",
    }).nonempty({
        message: "Please enter your email address"
    }).email({
        message: "Please enter a valid e-mail address"
    }),
    dealerCompanyName: z.string({
        required_error: "Please enter your company's name",
    }),
    dealerPanNumber: z.string()
        .optional()
        .refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
            message: "Please enter a valid PAN Number"
        }),
    dealerGstNumber: z.string({
        required_error: "Please enter your GST Number"
    }),
    dealerBrand: z.string({
        required_error: "Please select your brand"
    }).nonempty(),
    dealerStreet: z.string({
        required_error: "Please enter your street address"
    }).nonempty(),
    dealerPincode: z.string({
        required_error: "Please enter your pincode"
    }).nonempty().refine((value) => /^[0-9]{6}$/.test(value), {
        message: "Please enter a valid 6-digit pincode"
    }),
    dealerAddress: z.string({
        required_error: "Please enter your full address"
    }).nonempty(),
    dealerCountryId: z.string({
        required_error: "Please select your country",
    }).nonempty(),
    dealerStateId: z.string({
        required_error: "Please select your state",
    }).nonempty(),
    dealerCityId: z.string({
        required_error: "Please select your city",
    }).nonempty(),
})

const ProfileScreen = ({ }: Props) => {

    const { userDetails, fetchUserProfileDetails } = useUser();

    const [profileDetails, setProfileDetails] = useState<IDistributorProfileDetails & IMechanicDetails | undefined>(undefined);
    const [userBrand, setUserBrand] = useState();
    const [countryList, setCountryList] = useState<ILocationData[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<ILocationData | undefined>(undefined);
    const [stateList, setStateList] = useState<ILocationData[]>([]);
    const [selectedState, setSelectedState] = useState<ILocationData | undefined>(undefined);
    const [citiesList, setCitiesList] = useState<ILocationData[]>([]);
    const [selectedCity, setSelectedCity] = useState<ILocationData | undefined>(undefined);

    const toast = useToast();

    useEffect(() => {
        fetchUserProfile();
        fetchCountryList();
    }, []);

    useEffect(() => {
        if (!selectedCountry) return;

        fetchStateList();
    }, [selectedCountry]);

    useEffect(() => {
        if (!selectedState) return;

        fetchCitiesList();
    }, [selectedState]);

    const { control, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm<z.infer<typeof dealerFormSchema>>({
        resolver: zodResolver(dealerFormSchema),
        defaultValues: {
            dealerName: profileDetails?.name || profileDetails?.full_name,
            dealerCompanyName: profileDetails?.company_name || profileDetails?.shop_name,
            dealerEmail: profileDetails?.email,
            dealerPhoneNumber: profileDetails?.mobile || profileDetails?.mobile_no,
            dealerGstNumber: profileDetails?.gst_no,
            dealerPanNumber: profileDetails?.pan_no,
            dealerAddress: profileDetails?.address,
            dealerPincode: profileDetails?.pincode || profileDetails?.pin_code,
            dealerStreet: profileDetails?.street,
        }
    });

    const getUpdateProfileEnpoint = () => {
        if (userDetails?.userType === 0) {
            return {
                endpoint: UPDATE_DISTRIBUTOR_PROFILE,
                user_id: "distributorId"
            }
        };

        if (userDetails?.userType === 1) {
            return {
                endpoint: UPDATE_MECHANIC_PROFILE,
                user_id: "mechanicId"
            }
        };

        return {
            endpoint: UPDATE_RETAILER_PROFILE,
            user_id: "dealerId"
        };
    };

    const handleProfileSubmit: SubmitHandler<z.infer<typeof dealerFormSchema>> = async (formData) => {
        const updateProfileFormData = new FormData();
        updateProfileFormData.append(getUpdateProfileEnpoint().user_id, userDetails?.id)
        updateProfileFormData.append('name', formData.dealerName);
        updateProfileFormData.append('mobileNo', formData.dealerPhoneNumber);
        updateProfileFormData.append('emailId', formData.dealerEmail);
        updateProfileFormData.append('address', formData.dealerAddress);
        updateProfileFormData.append('street', formData.dealerStreet);
        updateProfileFormData.append('pinCode', formData.dealerPincode);
        updateProfileFormData.append('brandId', userDetails?.brand_id);
        updateProfileFormData.append('countryId', formData.dealerCountryId);
        updateProfileFormData.append('stateId', formData.dealerStateId);
        updateProfileFormData.append('cityId', formData.dealerCityId);
        updateProfileFormData.append('companyName', formData.dealerCompanyName);
        updateProfileFormData.append('panNo', formData.dealerPanNumber);
        updateProfileFormData.append('gstNo', formData.dealerGstNumber);

        try {
            const response = await axiosInstance.post(getUpdateProfileEnpoint().endpoint, updateProfileFormData);

            if (response.data.status != 200) {
                toast.show(response.data.message)
                return
            };

            toast.show(response.data.message, {
                data: response
            });
            fetchUserProfileDetails();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
            }
        };
    }

    const fetchUserProfile = async () => {

        const profileFormData = new FormData();
        profileFormData.append(getProfileEndpoint(userDetails).user_id, userDetails.id);

        try {
            const response = await axiosInstance.post(getProfileEndpoint(userDetails).endpoint, profileFormData);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: { response }
                })
            };

            setProfileDetails(response.data.data);
            fetchBrandById();
            reset({
                dealerName: response.data.data.name || response.data.data.full_name,
                dealerCompanyName: response.data.data.company_name || response.data.data.shop_name,
                dealerEmail: response.data.data.email,
                dealerPhoneNumber: response.data.data.mobile || response.data.data.mobile_no,
                dealerGstNumber: response.data.data.gst_no,
                dealerPanNumber: response.data.data.pan_no,
                dealerAddress: response.data.data.address,
                dealerPincode: response.data.data.pincode || response.data.data.pin_code,
                dealerStreet: response.data.data.street,
                dealerCountryId: response.data.data.country_id,
                dealerCityId: response.data.data.state_id,
                dealerStateId: response.data.data.city_id
            });
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
                return;
            }
            console.log(error, "SOMETHING_WENT_WRONG_PROFILE");
        };
    };

    const fetchCountryList = async () => {
        try {
            const response = await axiosInstance.post(GET_COUNTRY_LIST);

            if (response.data.status != 200) {
                console.log(response.data.message)
            };

            setCountryList(response.data.countries);
            const selectedUserCountry = countryList.filter((country) => country.id === profileDetails?.country_id);
            // setSelectedCountry(selectedUserCountry);
        } catch (error) {
            console.log(error, "COUNTRY_GET_ERROR");
        }
    };

    const fetchStateList = async () => {

        const stateListFormData = new FormData();
        stateListFormData.append("countryId", selectedCountry?.id)

        try {
            const response = await axiosInstance.post(GET_STATE_LIST, stateListFormData);

            if (response.data.status != 200) {
                console.log(response.data.message)
            };

            setStateList(response.data.states);
        } catch (error) {
            console.log(error)
        };
    };

    const fetchCitiesList = async () => {

        const citiesFormData = new FormData();
        citiesFormData.append("stateId", selectedState?.id)

        try {
            const response = await axiosInstance.post(GET_CITIES_LIST, citiesFormData);

            if (response.data.success != 200) {
                console.log(response.data.message);
            };

            setCitiesList(response.data.cities);

        } catch (error) {

        };
    };

    const fetchBrandById = async () => {
        try {
            const response = await axiosInstance.post(GET_BRANDS_BY_IDS);

            if (response.data.status != 200) {
                toast.show(response.data.message);
                return;
            };

            const currentUserBrand = response.data.brands.find((brand) => brand.id === profileDetails?.brand_id);
            const brandName = currentUserBrand ? currentUserBrand.name : "Unknown Brand";
            setUserBrand(brandName);
            setValue("dealerBrand", brandName)
        } catch (error) {
            console.log(error, "");
        }
    };

    return (
        <>
            <View className='bg-white flex-1 p-4'>
                <KeyboardAwareScrollView bottomOffset={100} showsVerticalScrollIndicator={false}>
                    <Text className='text-2xl font-semibold'>
                        {userDetails?.userType === 0 ? "Distributor" : userDetails?.userType === 1 ? "Mechanic" : "Retailer"} Information
                    </Text>
                    <Text className='text-gray-500 text-sm'>Provide information to edit your account</Text>

                    <View className='mt-4 gap-3'>
                        <View className='gap-1'>
                            <Text>Full Name <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                control={control}
                                name='dealerName'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.dealerName && "border-red-500"}`}
                                        placeholder='Enter full name'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.dealerName && <Text className='text-red-500 font-medium'>{errors.dealerName.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Phone Number <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                control={control}
                                name='dealerPhoneNumber'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.dealerPhoneNumber && "border-red-500"}`}
                                        placeholder='Enter phone number'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType='numeric'
                                    />
                                )}
                            />
                            {errors.dealerPhoneNumber && <Text className='text-red-500 font-medium'>{errors.dealerPhoneNumber.message}</Text>}
                        </View>

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>Email Address <Text className='text-red-500'>*</Text></Text>

                                <Controller
                                    control={control}
                                    name='dealerEmail'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.dealerEmail && "border-red-500"}`}
                                            placeholder='Enter email address'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.dealerEmail && <Text className='text-red-500 font-medium'>{errors.dealerEmail.message}</Text>}
                            </View>
                        )}

                        <View className='gap-1'>
                            <Text>
                                {userDetails?.userType === 0
                                    ? "Company Name"
                                    : (
                                        <>
                                            <Text>
                                                Shop Name{" "}
                                                <Text className='text-red-500'>*</Text>
                                            </Text>
                                        </>
                                    )}
                            </Text>

                            <Controller
                                control={control}
                                name='dealerCompanyName'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.dealerCompanyName && "border-red-500"}`}
                                        placeholder='Enter company name'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    // editable={false}
                                    />
                                )}
                            />
                        </View>

                        {/* {userDetails?.userType === 1 && (
                            <View className='gap-1'>
                                <Text>Retailer Name <Text className='text-red-500'>*</Text></Text>

                                <Controller
                                    control={control}
                                    name='dealerEmail'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.dealerEmail && "border-red-500"}`}
                                            placeholder='Enter retailer name'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.dealerEmail && <Text className='text-red-500 font-medium'>{errors.dealerEmail.message}</Text>}
                            </View>
                        )} */}

                        <View className='gap-1'>
                            <Text>
                                PAN Number{" "}
                                {userDetails?.userType !== 0 && (
                                    <Text className='text-red-500'>*</Text>
                                )}
                            </Text>

                            <Controller
                                control={control}
                                name='dealerPanNumber'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.dealerPanNumber && "border-red-500"}`}
                                        placeholder='Ex. AXNP7853G'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.dealerPanNumber && <Text className='text-red-500 font-medium'>{errors.dealerPanNumber.message}</Text>}
                        </View>

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>GST Number</Text>

                                <Controller
                                    control={control}
                                    name='dealerGstNumber'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.dealerGstNumber && "border-red-500"}`}
                                            placeholder='Enter company name'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />

                                {errors.dealerGstNumber && <Text className='text-red-500 font-medium'>{errors.dealerGstNumber.message}</Text>}
                            </View>
                        )}

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>Brand</Text>

                                <Controller
                                    control={control}
                                    name='dealerBrand'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.dealerBrand && "border-red-500"}`}
                                            placeholder='Enter company name'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            editable={false}
                                        />
                                    )}
                                />

                                {errors.dealerBrand && <Text className='text-red-500 font-medium'>{errors.dealerBrand.message}</Text>}
                            </View>
                        )}
                    </View>

                    <View className='py-4'>
                        <Text className='font-semibold text-lg xs:text-xl'>Address Information</Text>
                        <Text className='text-xs xs:text-sm text-gray-500'>Enter the details as per the ID Proof.</Text>
                    </View>

                    <View className='gap-3'>

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>Street <Text className='text-red-500'>*</Text></Text>

                                <Controller
                                    control={control}
                                    name='dealerStreet'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.dealerStreet && "border-red-500"}`}
                                            placeholder='Enter street'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.dealerStreet && <Text className='text-red-500 font-medium'>{errors.dealerStreet.message}</Text>}
                            </View>
                        )}

                        <View className='gap-1'>
                            <Text>Select Country <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                control={control}
                                name='dealerCountryId'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <CountryDropdown
                                        onValueChange={onChange}
                                        setSelectedCountry={setSelectedCountry}
                                        countryList={countryList}
                                        userDefaultCountryId={profileDetails?.country_id}
                                    />
                                )}
                            />
                            {errors.dealerCountryId && <Text className='text-red-500 font-medium'>{errors.dealerCountryId.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Select State <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                control={control}
                                name='dealerStateId'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <StateDropdown
                                        onValueChange={onChange}
                                        setSelectedState={setSelectedState}
                                        stateList={stateList}
                                    />
                                )}
                            />
                            {errors.dealerStateId && <Text className='text-red-500 font-medium'>{errors.dealerStateId.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Select City <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                control={control}
                                name='dealerCityId'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <CitiesDropdown
                                        onValueChange={onChange}
                                        setSelectedCity={setSelectedCity}
                                        citiesList={citiesList}
                                    />
                                )}
                            />
                            {errors.dealerCityId && <Text className='text-red-500 font-medium'>{errors.dealerCityId.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Pincode <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                control={control}
                                name='dealerPincode'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.dealerPincode && "border-red-500"}`}
                                        placeholder='Enter your pincode'
                                        keyboardType='numeric'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.dealerPincode && <Text className='text-red-500 font-medium'>{errors.dealerPincode.message}</Text>}
                        </View>

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>Address <Text className='text-red-500'>*</Text></Text>

                                <Controller
                                    control={control}
                                    name='dealerAddress'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Textarea
                                            className={`focus:border-2 focus:border-primary ${errors.dealerAddress && "border-red-500"}`}
                                            placeholder='Enter your full address'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />

                                {errors.dealerAddress && <Text className='text-red-500 font-medium'>{errors.dealerAddress.message}</Text>}
                            </View>
                        )}
                    </View>

                    <View className='my-6'>
                        <Button
                            onPress={handleSubmit(handleProfileSubmit)}
                            disabled={!isDirty}
                        >
                            <Text>Submit</Text>
                        </Button>
                    </View>
                </KeyboardAwareScrollView>
            </View>

            <KeyboardToolbar />
        </>
    )
}

export default ProfileScreen