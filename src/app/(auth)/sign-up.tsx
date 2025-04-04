import { View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Text } from '@/components/ui/text'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axiosInstance from '@/utils/axiosInstance'
import { GET_BRANDS_BY_IDS, GET_CITIES_LIST, GET_COUNTRY_LIST, GET_STATE_LIST, REGISTER_DISTRIBUTOR, REGISTER_MECHANIC, REGISTER_RETAILER } from '@/utils/routes'
import SelectBrandDropdown from '@/components/SelectBrandDropdown'
import CountryDropdown from '@/components/CountryDropdown'
import StateDropdown from '@/components/StateDropdown'
import CitiesDropdown from '@/components/CitiesDropdown'
import { useToast } from 'react-native-toast-notifications'
import axios from 'axios'
import { router, useLocalSearchParams } from 'expo-router'

type Props = {}

// const signUpForm = z.object({
//     userName: z.string().nonempty({
//         message: "Please enter your full name"
//     }).refine((value) => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value ?? ""), {
//         message: "Name should only contain letters"
//     }),
//     userPhoneNumber: z.string().nonempty({
//         message: "Please enter your phone number"
//     }).refine((value) => /^[0-9]{10}$/.test(value), {
//         message: "Enter a valid 10-digit phone number"
//     }),
//     userEmail: z.string().nonempty({
//         message: "Please enter your email address",
//     }).email({
//         message: "Please enter a valid email address"
//     }),
//     userCompanyName: z.string(),
//     userPanNumber: z.string().optional().refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
//         message: "Please enter a valid PAN Number"
//     }),
//     userGstNumber: z.string(),
//     userBrand: z.object({
//         id: z.string({
//             message: "Please select a brand id"
//         }).nonempty(),
//         name: z.string({
//             message: "Please select a brand name"
//         }).nonempty(),
//     }),
//     userStreet: z.string({
//         required_error: "Please enter your street address"
//     }).nonempty(),
//     userPincode: z.string({
//         required_error: "Please enter a pincode"
//     }).nonempty().refine((value) => /^[0-9]{6}$/.test(value), {
//         message: "Please enter a valid 6-digit pincode"
//     }),
//     userCountry: z.string({
//         required_error: "Please select your country",
//     }).nonempty(),
//     userState: z.string({
//         required_error: "Please select your state",
//     }).nonempty(),
//     userCity: z.string({
//         required_error: "Please select your city",
//     }).nonempty(),
// });

// Base schema for common fields
const baseSchema = z.object({
    userType: z.enum(["distributor", "mechanic"]),
    userName: z.string().nonempty("Please enter your full name"),
    userPhoneNumber: z
        .string()
        .nonempty("Please enter your phone number")
        .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
    userPincode: z
        .string()
        .nonempty("Please enter a pincode")
        .regex(/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"),
    userCountry: z.string().nonempty("Please select your country"),
    userState: z.string().nonempty("Please select your state"),
    userCity: z.string().nonempty("Please select your city"),
});

// Distributor schema
const distributorSchema = baseSchema.extend({
    userType: z.literal("distributor"),
    userCompanyName: z.string().nonempty("Please enter your company name"),
    userPanNumber: z
        .string()
        .optional()
        .refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value), {
            message: "Please enter a valid PAN Number",
        }),
    userGstNumber: z.string().nonempty("Please enter GST Number"),
    userBrand: z.object({
        id: z.string().nonempty("Please select a brand id"),
        name: z.string().nonempty("Please select a brand name"),
    }),
    userEmail: z.string().email("Please enter a valid email address"),
    userStreet: z.string().nonempty("Please enter your street address"),
});

// Mechanic schema
const mechanicSchema = baseSchema.extend({
    userType: z.literal("mechanic"),
    userCompanyName: z.string().optional(),
    userPanNumber: z.string().optional(),
});

// Final schema for validation
const signUpForm = z.discriminatedUnion("userType", [
    distributorSchema,
    mechanicSchema,
]);

const SignUpScreen = ({ }: Props) => {

    const toast = useToast();

    const { userType } = useLocalSearchParams();

    const [brands, setBrands] = useState<IBrandsDetails[]>();
    const [userBrand, setUserBrand] = useState();
    const [countryList, setCountryList] = useState<ILocationData[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<ILocationData | undefined>(undefined);
    const [stateList, setStateList] = useState<ILocationData[]>([]);
    const [selectedState, setSelectedState] = useState<ILocationData | undefined>(undefined);
    const [citiesList, setCitiesList] = useState<ILocationData[]>([]);
    const [selectedCity, setSelectedCity] = useState<ILocationData | undefined>(undefined);

    useEffect(() => {
        fetchCountryList();
        fetchBrands();
    }, []);

    useEffect(() => {
        if (!selectedCountry) return;

        fetchStateList();
    }, [selectedCountry]);

    useEffect(() => {
        if (!selectedState) return;

        fetchCitiesList();
    }, [selectedState]);

    const { control, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm<z.infer<typeof signUpForm>>({
        resolver: zodResolver(signUpForm),
        defaultValues: {
            userBrand: {
                id: "",
                name: ""
            },
            userCompanyName: "",
            userEmail: "",
            userGstNumber: "",
            userName: "",
            userPanNumber: "",
            userPhoneNumber: "",
            userCity: "",
            userCountry: "",
            userPincode: "",
            userState: "",
            userStreet: "",
            userType
        },
    });

    /**
     * Get brands
     */
    const fetchBrands = async () => {

        try {
            const response = await axiosInstance.post(GET_BRANDS_BY_IDS);

            if (response.data.status != 200) {
                console.log(response.data.message);
            };

            setBrands(response.data.brands);
        } catch (error) {
            console.log(error, "ERROR_MSG");
        }
    };

    const fetchCountryList = async () => {
        try {
            const response = await axiosInstance.post(GET_COUNTRY_LIST);

            if (response.data.status != 200) {
                console.log(response.data.message)
            };

            setCountryList(response.data.countries);
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

    const getRegisterEndpoint = () => {
        if (userType === "distributor") {
            return {
                endpoint: REGISTER_DISTRIBUTOR,
            }
        };

        if (userType === "mechanic") {
            return {
                endpoint: REGISTER_MECHANIC,
            };
        };

        return {
            endpoint: REGISTER_RETAILER
        };
    }

    const handleProfileSubmit: SubmitHandler<z.infer<typeof signUpForm>> = async (formData) => {

        const registerFormData = new FormData();
        if (userType === "distributor") {
            registerFormData.append('name', formData.userName);
            registerFormData.append('mobileNo', formData.userPhoneNumber);
            registerFormData.append('emailId', formData.userEmail);
            registerFormData.append('address', formData.userEmail);
            registerFormData.append('street', formData.userStreet);
            registerFormData.append('pinCode', formData.userPincode);
            registerFormData.append('brandId', formData.userBrand.id);
            registerFormData.append('countryId', formData.userCountry);
            registerFormData.append('stateId', formData.userState);
            registerFormData.append('cityId', formData.userCity);
            registerFormData.append('companyName', formData.userCompanyName);
            registerFormData.append('panNo', formData.userPanNumber as string);
            registerFormData.append('gstNo', formData.userGstNumber);
        };

        if (userType === "mechanic") {
            registerFormData.append('name', formData.userName);
            registerFormData.append('mobileNo', formData.userPhoneNumber);
            registerFormData.append('pinCode', formData.userPincode);
            registerFormData.append('countryId', formData.userCountry);
            registerFormData.append('stateId', formData.userState);
            registerFormData.append('cityId', formData.userCity);
            registerFormData.append('shopName', formData.userCompanyName);
            registerFormData.append('panNo', formData.userPanNumber as string);
        };

        if (userType === "retailer") {
            registerFormData.append('name', formData.userName);
            registerFormData.append('mobileNo', formData.userPhoneNumber);
            registerFormData.append('pinCode', formData.userPincode);
            registerFormData.append('countryId', formData.userCountry);
            registerFormData.append('stateId', formData.userState);
            registerFormData.append('cityId', formData.userCity);
            registerFormData.append('shopName', formData.userCompanyName);
            registerFormData.append('panNo', formData.userPanNumber as string);
        };

        try {
            const response = await axiosInstance.post(getRegisterEndpoint().endpoint, registerFormData);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response
                });
                reset();
                return;
            };

            toast.show(response.data.message, {
                data: response
            });
            router.navigate({
                pathname: '/(auth)/otp-verify',
                params: {
                    userPhone: formData.userPhoneNumber,
                    userType
                }
            })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                })
            }
        }
    };

    console.log(errors, "ERROR_FORMDATA");

    return (
        <>
            <View className='bg-white flex-1 p-4'>
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
                                    name='userEmail'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.userEmail && "border-red-500"}`}
                                            placeholder='Enter email address'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.userEmail && <Text className='text-red-500 font-medium'>{errors.userEmail.message}</Text>}
                            </View>
                        )}

                        <View className='gap-1'>
                            <Text>
                                {userType === "distributor" ? "Company Name" : "Shop Name"}
                            </Text>

                            <Controller
                                control={control}
                                name='userCompanyName'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userCompanyName && "border-red-500"}`}
                                        placeholder={`${userType === "distributor" ? "Enter Company Name" : "Enter Shop Name"}`}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    // editable={false}
                                    />
                                )}
                            />
                        </View>

                        <View className='gap-1'>
                            <Text>PAN Number</Text>

                            <Controller
                                control={control}
                                name='userPanNumber'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userPanNumber && "border-red-500"}`}
                                        placeholder='Ex. AXNP7853G'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.userPanNumber && <Text className='text-red-500 font-medium'>{errors.userPanNumber.message}</Text>}
                        </View>

                        {userType === "distributor" && (
                            <View className='gap-1'>
                                <Text>GST Number</Text>

                                <Controller
                                    control={control}
                                    name='userGstNumber'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.userGstNumber && "border-red-500"}`}
                                            placeholder='Enter company name'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />

                                {errors.userGstNumber && <Text className='text-red-500 font-medium'>{errors.userGstNumber.message}</Text>}
                            </View>
                        )}

                        {userType === "distributor" && (
                            <View className='gap-1'>
                                <Text>Select Brand</Text>

                                <Controller
                                    control={control}
                                    name='userBrand'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <SelectBrandDropdown
                                            onValueChange={onChange}
                                            brands={brands}
                                        />
                                    )}
                                />

                                {errors.userBrand && <Text className='text-red-500 font-medium'>{errors.userBrand.id?.message}</Text>}
                            </View>
                        )}

                        {/* <View className='gap-1'>
                            <Text>Dealer Brand</Text>

                            <Controller
                                control={control}
                                name='userBrand'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <Input
                                        className={`focus:border-2 focus:border-primary ${errors.userBrand && "border-red-500"}`}
                                        placeholder='Enter company name'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        editable={false}
                                    />
                                )}
                            />

                            {errors.userBrand && <Text className='text-red-500 font-medium'>{errors.userBrand.message}</Text>}
                        </View> */}
                    </View>

                    <View className='py-4'>
                        <Text className='font-semibold text-lg xs:text-xl'>Address Information</Text>
                        <Text className='text-xs xs:text-sm text-gray-500'>Enter the details as per the ID Proof.</Text>
                    </View>

                    <View className='gap-3'>

                        {userType === "distributor" && (
                            <View className='gap-1'>
                                <Text>Street</Text>

                                <Controller
                                    control={control}
                                    name='userStreet'
                                    render={({ field: { onBlur, onChange, value } }) => (
                                        <Input
                                            className={`focus:border-2 focus:border-primary ${errors.userStreet && "border-red-500"}`}
                                            placeholder='Enter street'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.userStreet && <Text className='text-red-500 font-medium'>{errors.userStreet.message}</Text>}
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
                                        setSelectedCountry={setSelectedCountry}
                                        countryList={countryList}
                                    />
                                )}
                            />
                            {errors.userCountry && <Text className='text-red-500 font-medium'>{errors.userCountry.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Select State</Text>

                            <Controller
                                control={control}
                                name='userState'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <StateDropdown
                                        onValueChange={onChange}
                                        setSelectedState={setSelectedState}
                                        stateList={stateList}
                                    />
                                )}
                            />
                            {errors.userState && <Text className='text-red-500 font-medium'>{errors.userState?.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Select City</Text>

                            <Controller
                                control={control}
                                name='userCity'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <CitiesDropdown
                                        onValueChange={onChange}
                                        setSelectedCity={setSelectedCity}
                                        citiesList={citiesList}
                                    />
                                )}
                            />
                            {errors.userCity && <Text className='text-red-500 font-medium'>{errors.userCity?.message}</Text>}
                        </View>

                        <View className='gap-1'>
                            <Text>Pincode</Text>

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