import { View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller'
import useUser from '@/hooks/useUser'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { signUpForm } from '@/libs/schemas/profileUpdateFromSchemas'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import CountryDropdown from '@/components/CountryDropdown'
import { Textarea } from '@/components/ui/textarea'
import axiosInstance from '@/utils/axiosInstance'
import { GET_BRANDS_BY_IDS, GET_CITIES_LIST, GET_COUNTRY_LIST, GET_STATE_LIST, UPDATE_DISTRIBUTOR_PROFILE, UPDATE_MECHANIC_PROFILE, UPDATE_RETAILER_PROFILE } from '@/utils/routes'
import { useToast } from 'react-native-toast-notifications'
import axios from 'axios'
import StateDropdown from '@/components/StateDropdown'
import CitiesDropdown from '@/components/CitiesDropdown'
import { getProfileEndpoint } from '@/libs/utils'

type Props = {}

const userTypeMap: Record<number, "distributor" | "mechanic" | "retailer"> = {
    0: "distributor",
    1: "mechanic",
    2: "retailer",
};

const ProfileScreen = ({ }: Props) => {

    const [profileDetails, setProfileDetails] = useState<IDistributorProfileDetails & IMechanicDetails & IRetailerDetails | undefined>(undefined);
    const [countryList, setCountryList] = useState<ILocationData[]>([]);
    const [stateList, setStateList] = useState<ILocationData[]>([]);
    const [citiesList, setCitiesList] = useState<ILocationData[]>([]);

    const { userDetails, fetchUserProfileDetails } = useUser();

    const toast = useToast();

    useEffect(() => {
        fetchCountryList();
        fetchUserProfile();
        // fetchBrands();
    }, []);

    const { control, handleSubmit, reset, getValues, formState: { errors, isDirty } } = useForm<z.infer<typeof signUpForm>>({
        resolver: zodResolver(signUpForm),
        defaultValues: {
            userType: userTypeMap[userDetails?.userType || 0],
            userName: "",
            userPincode: "",
            distributorEmail: "",
            distributorCompanyName: "",
            retailerShopName: "",
            mechanicPanNumber: "",
            distributorPanNumber: "",
            distributorGstNumber: "",
            distributorBrand: {
                id: "",
                name: ""
            },
            distributorAddress: "",
            userCity: {
                id: "",
                name: " "
            },
            userCountry: {
                id: "",
                name: ""
            },
            userPhoneNumber: "",
            userState: {
                id: "",
                name: ""
            },
        }
    });

    useEffect(() => {
        if (!getValues().userCountry.id && !userDetails?.country_id) return;

        fetchStateList();
    }, [getValues().userCountry.id]);

    useEffect(() => {
        if (!getValues().userState.id && !userDetails?.state_id) return;

        fetchCitiesList();
    }, [getValues().userState.id]);

    // Get the list of the COUNTRIES for dropdown
    const fetchCountryList = async () => {
        try {
            const response = await axiosInstance.post(GET_COUNTRY_LIST);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response
                })
            };
            setCountryList(response.data.countries)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
            };
        };
    };

    // Get the list of the STATES for dropdown
    const fetchStateList = async () => {

        const stateListFormData = new FormData();
        stateListFormData.append("countryId", getValues().userCountry.id || userDetails?.country_id)

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

    // Get the list of the CITIES for dropdown
    const fetchCitiesList = async () => {

        const citiesFormData = new FormData();
        citiesFormData.append("stateId", getValues().userState.id || userDetails?.state_id)

        try {
            const response = await axiosInstance.post(GET_CITIES_LIST, citiesFormData);

            if (response.data.success != 200) {
                console.log(response.data.message);
            };

            setCitiesList(response.data.cities);
        } catch (error) {

        };
    };

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

    const fetchUserProfile = async () => {

        const profileFormData = new FormData();
        profileFormData.append(getProfileEndpoint(userDetails).user_id, userDetails?.id);

        try {
            const response = await axiosInstance.post(getProfileEndpoint(userDetails).endpoint, profileFormData);
            const brandResponse = await axiosInstance.post(GET_BRANDS_BY_IDS);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: { response }
                })
            };

            const currentUserBrand = brandResponse.data.brands.find((brand) => brand.id === userDetails?.brand_id);
            const matchedCountry = countryList.find(
                (country) => country.id === response.data.data.country_id
            );

            const matchedState = stateList.find(
                (state) => state.id === response.data.data.state_id
            );

            const matchedCity = citiesList.find(
                (city) => city.id === response.data.data.city_id
            );

            setProfileDetails(response.data.data);
            reset({
                userType: userTypeMap[userDetails?.userType || 0],
                userName: response.data.data.name || response.data.data.dealer_name,
                distributorAddress: response.data.data.address,
                userPhoneNumber: response.data.data.mobile || response.data.data.mobile_no,
                distributorBrand: currentUserBrand,
                distributorCompanyName: response.data.data.company_name,
                retailerShopName: response.data.data.shop_name,
                distributorEmail: response.data.data.email,
                distributorGstNumber: response.data.data.gst_no,
                mechanicPanNumber: response.data.data.pan_no,
                distributorPanNumber: response.data.data.pan_no,
                distributorStreetAddress: response.data.data.street,
                userPincode: response.data.data.pincode || response.data.data.pin_code,
                userCountry: matchedCountry || { id: "", name: "" },
                userState: matchedState || { id: "", name: "" },
                userCity: matchedCity || { id: "", name: "" }
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

    const handleProfileSubmit: SubmitHandler<z.infer<typeof signUpForm>> = async (formData) => {

        const updateProfileFormData = new FormData();

        updateProfileFormData.append(getUpdateProfileEnpoint().user_id, userDetails?.id)
        updateProfileFormData.append('name', formData.userName);
        updateProfileFormData.append('mobileNo', formData.userPhoneNumber);
        updateProfileFormData.append('pinCode', formData.userPincode);
        updateProfileFormData.append('countryId', formData.userCountry.id);
        updateProfileFormData.append('stateId', formData.userState.id);
        updateProfileFormData.append('cityId', formData.userCity.id);

        if (userDetails?.userType === 0) {
            updateProfileFormData.append('companyName', formData.distributorCompanyName);
            updateProfileFormData.append('panNo', formData.distributorPanNumber);
            updateProfileFormData.append('gstNo', formData.distributorGstNumber);
            updateProfileFormData.append('emailId', formData.distributorEmail);
            updateProfileFormData.append('address', formData.distributorAddress);
            updateProfileFormData.append('street', formData.distributorStreetAddress);
            updateProfileFormData.append('brandId', userDetails.brand_id);
        }

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
    };

    return (
        <>
            <View className='bg-white p-4 flex-1'>
                <KeyboardAwareScrollView bottomOffset={100} showsVerticalScrollIndicator={false}>
                    <Text className='text-2xl font-semibold'>
                        {userDetails?.userType === 0 ? "Distributor" : userDetails?.userType === 1 ? "Mechanic" : "Retailer"} Information
                    </Text>
                    <Text className='text-gray-500 text-sm'>Provide information to edit your account</Text>

                    <View className='mt-4 gap-3'>
                        <View className='gap-1'>
                            <Text>Full Name</Text>

                            <Controller
                                control={control}
                                name='userName'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userName && "border-red-500"}`}
                                        placeholder='Enter full name'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.userName && <Text className='text-red-500 font-medium'>{errors.userName.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Phone Number</Text>

                            <Controller
                                control={control}
                                name='userPhoneNumber'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userPhoneNumber && "border-red-500"}`}
                                        placeholder='Enter phone number'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType='numeric'
                                    />
                                )}
                            />
                            {errors.userPhoneNumber && <Text className='text-red-500 font-medium'>{errors.userPhoneNumber.message}</Text>}
                        </View>

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>Email Address</Text>

                                <Controller
                                    control={control}
                                    name='distributorEmail'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.distributorEmail && "border-red-500"}`}
                                            placeholder='Enter email address'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.distributorEmail && <Text className='text-red-500 font-medium'>{errors.distributorEmail.message}</Text>}
                            </View>
                        )}

                        {userDetails?.userType === 0 ? (
                            <View className='gap-1'>
                                <Text>
                                    Company name
                                </Text>

                                <Controller
                                    control={control}
                                    name='distributorCompanyName'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.distributorCompanyName && "border-red-500"}`}
                                            placeholder="Enter Company Name"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        // editable={false}
                                        />
                                    )}
                                />
                            </View>
                        ) : (
                            <View className='gap-1'>
                                <Text>
                                    Shop name
                                </Text>

                                <Controller
                                    control={control}
                                    name='retailerShopName'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.retailerShopName && "border-red-500"}`}
                                            placeholder="Enter Shop Name"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        // editable={false}
                                        />
                                    )}
                                />
                                {errors.retailerShopName && <Text className='text-red-500 font-medium'>{errors.retailerShopName.message}</Text>}
                            </View>
                        )}

                        {userDetails?.userType === 0 ? (
                            <View className='gap-1'>
                                <Text>PAN Number</Text>

                                <Controller
                                    control={control}
                                    name='distributorPanNumber'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.distributorPanNumber && "border-red-500"}`}
                                            placeholder='Ex. AXNP7853G'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.distributorPanNumber && <Text className='text-red-500 font-medium'>{errors.distributorPanNumber.message}</Text>}
                            </View>
                        ) : (
                            <View className='gap-1'>
                                <Text>PAN Number</Text>

                                <Controller
                                    control={control}
                                    name='mechanicPanNumber'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.mechanicPanNumber && "border-red-500"}`}
                                            placeholder='Ex. AXNP7853G'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.mechanicPanNumber && <Text className='text-red-500 font-medium'>{errors.mechanicPanNumber.message}</Text>}
                            </View>
                        )}

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>GST Number</Text>

                                <Controller
                                    control={control}
                                    name='distributorGstNumber'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.distributorGstNumber && "border-red-500"}`}
                                            placeholder='Enter GSTIN number'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />

                                {errors.distributorGstNumber && <Text className='text-red-500 font-medium'>{errors.distributorGstNumber.message}</Text>}
                            </View>
                        )}

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>Brand</Text>

                                <Controller
                                    control={control}
                                    name='distributorBrand'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.distributorBrand && "border-red-500"}`}
                                            placeholder='Enter company name'
                                            value={value.name}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            editable={false}
                                        />
                                    )}
                                />

                                {errors.distributorBrand && <Text className='text-red-500 font-medium'>{errors.distributorBrand.id?.message}</Text>}
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
                                <Text className=''>Street</Text>

                                <Controller
                                    control={control}
                                    name='distributorStreetAddress'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.distributorStreetAddress && "border-red-500"}`}
                                            placeholder='Enter street'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.distributorStreetAddress && <Text className='text-red-500 font-medium'>{errors.distributorStreetAddress.message}</Text>}
                            </View>
                        )}

                        <View className='gap-1'>
                            <Text>Select Country</Text>

                            <Controller
                                control={control}
                                name='userCountry'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <CountryDropdown
                                        onValueChange={onChange}
                                        countryList={countryList}
                                        defaultValue={{
                                            label: value.name,
                                            value: value.id
                                        }}
                                    />
                                )}
                            />
                            {errors.userCountry && <Text className='text-red-500 font-medium'>{errors.userCountry.id?.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Select State</Text>

                            <Controller
                                control={control}
                                name='userState'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <StateDropdown
                                        defaultValue={{
                                            value: value.id,
                                            label: value.name,
                                        }}
                                        onValueChange={onChange}
                                        stateList={stateList}
                                    />
                                )}
                            />
                            {errors.userState && <Text className='text-red-500 font-medium'>{errors.userState.id?.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Select City</Text>

                            <Controller
                                control={control}
                                name='userCity'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <CitiesDropdown
                                        onValueChange={onChange}
                                        citiesList={citiesList}
                                    />
                                )}
                            />
                            {errors.userCity && <Text className='text-red-500 font-medium'>{errors.userCity.id?.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Pincode <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                control={control}
                                name='userPincode'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userPincode && "border-red-500"}`}
                                        placeholder='Enter your pincode'
                                        keyboardType='numeric'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.userPincode && <Text className='text-red-500 font-medium'>{errors.userPincode.message}</Text>}
                        </View>

                        {userDetails?.userType === 0 && (
                            <View className='gap-1'>
                                <Text>Address <Text className='text-red-500'>*</Text></Text>

                                <Controller
                                    control={control}
                                    name='distributorAddress'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Textarea
                                            className={`focus:border-2 focus:border-primary ${errors.distributorAddress && "border-red-500"}`}
                                            placeholder='Enter your full address'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />

                                {errors.distributorAddress && <Text className='text-red-500 font-medium'>{errors.distributorAddress.message}</Text>}
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