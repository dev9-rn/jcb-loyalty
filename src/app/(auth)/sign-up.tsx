import { View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useUser from '@/hooks/useUser'
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller'
import { router, useLocalSearchParams } from 'expo-router'
import { signUpForm } from '@/libs/schemas/signUpFormSchemas'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import CountryDropdown from '@/components/CountryDropdown'
import StateDropdown from '@/components/StateDropdown'
import CitiesDropdown from '@/components/CitiesDropdown'
import { Textarea } from '@/components/ui/textarea'
import axiosInstance from '@/utils/axiosInstance'
import { GET_BRANDS_BY_IDS, GET_CITIES_LIST, GET_COUNTRY_LIST, GET_STATE_LIST, REGISTER_DISTRIBUTOR, REGISTER_MECHANIC, REGISTER_RETAILER } from '@/utils/routes'
import { useToast } from 'react-native-toast-notifications'
import axios from 'axios'
import SelectBrandDropdown from '@/components/SelectBrandDropdown'
import RetailerApprovalDialog from '@/components/RetailerApprovalDialog'

type Props = {}

const SignUpScreen = ({ }: Props) => {

    const [countryList, setCountryList] = useState<ILocationData[]>([]);
    const [stateList, setStateList] = useState<ILocationData[]>([]);
    const [citiesList, setCitiesList] = useState<ILocationData[]>([]);
    const [brands, setBrands] = useState<IBrandsDetails[]>([]);
    const [searchedCountry, setSearchedCountry] = useState<string>("");
    const [selected, setSelected] = useState(null);

    const { userDetails } = useUser();

    console.log(countryList, "COUNTRY_LIST");

    const { userType } = useLocalSearchParams<{ userType: string }>();

    const toast = useToast();

    const { control, handleSubmit, reset, setValue, getValues, formState: { errors, isDirty } } = useForm<z.infer<typeof signUpForm>>({
        resolver: zodResolver(signUpForm),
        defaultValues: {
            userType: userType as "distributor" | "mechanic" | "retailer",
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
        fetchCountryList();
        fetchBrands();
    }, []);

    useEffect(() => {
        if (!getValues().userCountry.id && !userDetails?.country_id) return;

        fetchStateList();
    }, [getValues().userCountry.id]);

    useEffect(() => {
        if (!getValues().userState.id && !userDetails?.state_id) return;

        fetchCitiesList();
    }, [getValues().userState.id]);

    // Get the list of the country for dropdown
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
                (response.data.message)
            };

            setStateList(response.data.states);
        } catch (error) {
            (error)
        };
    };

    // Get the list of the CITIES for dropdown
    const fetchCitiesList = async () => {

        const citiesFormData = new FormData();
        citiesFormData.append("stateId", getValues().userState.id || userDetails?.state_id)

        try {
            const response = await axiosInstance.post(GET_CITIES_LIST, citiesFormData);

            if (response.data.success != 200) {
                (response.data.message);
            };

            setCitiesList(response.data.cities);
        } catch (error) {

        };
    };

    const fetchBrands = async () => {
        try {
            const response = await axiosInstance.post(GET_BRANDS_BY_IDS);

            setBrands(response.data.brands);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
            }
        }
    }

    const getRegisterEndpoint = () => {
        if (userType === "distributor") {
            return {
                endpoint: REGISTER_DISTRIBUTOR,
            };
        };

        if (userType === "mechanic") {
            return {
                endpoint: REGISTER_MECHANIC,
            };
        };

        return {
            endpoint: REGISTER_RETAILER,
        }
    }

    const handleProfileSubmit: SubmitHandler<z.infer<typeof signUpForm>> = async (formData) => {

        const registerFormData = new FormData();

        registerFormData.append(userType !== "distributor" ? "dealerName" : "name", formData.userName);
        registerFormData.append('mobileNo', formData.userPhoneNumber);
        registerFormData.append('pinCode', formData.userPincode);
        registerFormData.append('countryId', formData.userCountry.id);
        registerFormData.append('stateId', formData.userState.id);
        registerFormData.append('cityId', formData.userCity.id);

        if (userType === "distributor") {
            registerFormData.append('companyName', formData.distributorCompanyName);
            registerFormData.append('panNo', formData.distributorPanNumber);
            registerFormData.append('gstNo', formData.distributorGstNumber);
            registerFormData.append('emailId', formData.distributorEmail);
            registerFormData.append('address', formData.distributorAddress);
            registerFormData.append('street', formData.distributorStreetAddress);
            registerFormData.append('brandId', formData.distributorBrand?.id);
        };

        if (userType === "retailer") {
            registerFormData.append('shopName', formData.retailerShopName);
            registerFormData.append('distributorCode', formData.retailerCode);
            registerFormData.append('address', formData.retailerAddress);
        }

        try {
            const response = await axiosInstance.post(getRegisterEndpoint()?.endpoint, registerFormData);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response
                });
            };

            router.navigate({
                pathname: "/(auth)/otp-verify",
                params: {
                    userPhone: formData.userPhoneNumber,
                    userType,
                    methodType: "registration",
                }
            });

        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
            };
        }
    };

    return (
        <>
            <View className='flex-1 bg-white p-4'>
                <KeyboardAwareScrollView bottomOffset={100} showsVerticalScrollIndicator={false}>
                    <Text className='text-2xl font-semibold'>
                        <Text className='capitalize text-2xl font-semibold'>
                            {userType}{" "}
                        </Text>
                        Information
                    </Text>
                    <Text className='text-gray-500 text-sm'>Provide information to create account</Text>

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

                        {userType === "distributor" && (
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

                        {userType === "distributor" && userType === "mechaninc" ? (
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
                                            placeholder={`${userType === "distributor" ? "Enter Company Name" : "Enter Shop Name"}`}
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
                                    Company name
                                </Text>

                                <Controller
                                    control={control}
                                    name='retailerShopName'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.retailerShopName && "border-red-500"}`}
                                            placeholder={`${userType === "distributor" ? "Enter Company Name" : "Enter Shop Name"}`}
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

                        {userType === "retailer" && (
                            <View className='gap-1'>
                                <Text>
                                    Distributor Code
                                </Text>

                                <Controller
                                    control={control}
                                    name='retailerCode'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.retailerCode && "border-red-500"}`}
                                            placeholder="Enter Distributor Code"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        // editable={false}
                                        />
                                    )}
                                />
                                {errors.retailerCode && <Text className='text-red-500 font-medium'>{errors.retailerCode.message}</Text>}
                            </View>
                        )}

                        {userType === "distributor" ? (
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
                        ) : userType === "mechanic" ? (
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
                        ) : null}

                        {userType === "distributor" && (
                            <View className='gap-1'>
                                <Text>GST Number</Text>

                                <Controller
                                    control={control}
                                    name='distributorGstNumber'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.distributorGstNumber && "border-red-500"}`}
                                            placeholder='Enter company name'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />

                                {errors.distributorGstNumber && <Text className='text-red-500 font-medium'>{errors.distributorGstNumber.message}</Text>}
                            </View>
                        )}

                        {userType === "distributor" && (
                            <View className='gap-1'>
                                <Text>Select Brand</Text>

                                <Controller
                                    control={control}
                                    name='distributorBrand'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <SelectBrandDropdown
                                            onValueChange={onChange}
                                            brands={brands}
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
                        {userType === "distributor" && (
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
                                        onSelect={onChange}
                                        options={countryList}
                                        selected={{
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
                                        onSelect={onChange}
                                        options={countryList}
                                        selected={{
                                            label: value.name,
                                            value: value.id
                                        }}
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
                                        onSelect={onChange}
                                        options={countryList}
                                        selected={{
                                            label: value.name,
                                            value: value.id
                                        }}
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

                        {userType === "distributor" && (
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

                        {userType === "retailer" && (
                            <View className='gap-1'>
                                <Text>Address <Text className='text-red-500'>*</Text></Text>

                                <Controller
                                    control={control}
                                    name='retailerAddress'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Textarea
                                            className={`focus:border-2 focus:border-primary ${errors.retailerAddress && "border-red-500"}`}
                                            placeholder='Enter your full address'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />

                                {errors.retailerAddress && <Text className='text-red-500 font-medium'>{errors.retailerAddress.message}</Text>}
                            </View>
                        )}
                    </View>

                    <View className='my-6'>
                        <Button
                            onPress={handleSubmit(handleProfileSubmit)}
                        // disabled={!isDirty}
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

export default SignUpScreen