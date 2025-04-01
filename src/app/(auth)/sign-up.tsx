import { View } from 'react-native'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { dealerFormSchema } from '../(root)/(drawer)/profile';
import CountryDropdown from '@/components/CountryDropdown';
import { Input } from '@/components/ui/input';
import StateDropdown from '@/components/StateDropdown';
import CitiesDropdown from '@/components/CitiesDropdown';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { Text } from '@/components/ui/text';
import SelectBrandDropdown from '@/components/SelectBrandDropdown';

type Props = {}

const SignUpScreen = ({ }: Props) => {

    const { control, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm<z.infer<typeof dealerFormSchema>>({
        resolver: zodResolver(dealerFormSchema),
        defaultValues: {
            dealerName: "",
            dealerCompanyName: "",
            dealerEmail: "",
            dealerPhoneNumber: "",
            dealerGstNumber: "",
            dealerPanNumber: "",
            dealerAddress: "",
            dealerPincode: "",
            dealerStreet: "",
            dealerBrand: "",
            dealerCityId: "",
            dealerCountryId: "",
            dealerStateId: "",
        }
    });

    const handleProfileSubmit: SubmitHandler<z.infer<typeof dealerFormSchema>> = async (formData) => {
        console.log(formData, "FORM_DATA");
    }

    return (
        <>
            <View className='bg-white flex-1 p-4'>
                <KeyboardAwareScrollView bottomOffset={100} showsVerticalScrollIndicator={false}>
                    <Text className='text-2xl font-semibold'>
                        Distributor Information
                    </Text>
                    <Text className='text-gray-500 text-sm'>Provide information to create account</Text>

                    <View className='mt-4 gap-3'>
                        <View className='gap-1'>
                            <Text>Full Name</Text>

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
                            <Text>Phone Number</Text>

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

                        <View className='gap-1'>
                            <Text>Email Address</Text>

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

                        <View className='gap-1'>
                            <Text>Company Name</Text>

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

                        <View className='gap-1'>
                            <Text>PAN Number</Text>

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

                        <View className='gap-1'>
                            <Text>Selecte Brand</Text>

                            <Controller
                                control={control}
                                name='dealerBrand'
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <SelectBrandDropdown
                                        onValueChange={onChange}
                                        
                                    />
                                )}
                            />

                            {errors.dealerBrand && <Text className='text-red-500 font-medium'>{errors.dealerBrand.message}</Text>}
                        </View>
                    </View>

                    {/* 
                        Address Information
                     */}
                    <View className='py-4'>
                        <Text className='font-semibold text-lg xs:text-xl'>Address Information</Text>
                        <Text className='text-xs xs:text-sm text-gray-500'>Enter the details as per the ID Proof.</Text>
                    </View>

                    {/* <View className='gap-3'>

                        <View className='gap-1'>
                            <Text>Street</Text>

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

                        <View className='gap-1'>
                            <Text>Pincode</Text>

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

                        <View className='gap-1'>
                            <Text>Select Country</Text>

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
                            <Text>Select State</Text>

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
                            <Text>Select City</Text>

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
                            <Text>Address</Text>

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
                    </View> */}

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