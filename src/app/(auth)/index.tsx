import { View, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import useAuth from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

type Props = {}

type FormData = {
    userPhone: string;
}

const SignInScreen = ({ }: Props) => {

    const [selectedSignInType, setSelectedSignInType] = useState<string>("distributor");

    const { login } = useAuth();

    const { control, handleSubmit, setError, formState: { errors } } = useForm<FormData | FieldValues>({
        defaultValues: {
            userPhone: "",
        }
    });

    const toggleSignInType = () => {
        setSelectedSignInType((prevType) => (prevType === "distributor" ? "mechanic" : "distributor"));
    };

    const handleUserLogin: SubmitHandler<FormData | FieldValues> = async (formData) => {
        const loginFormData = new FormData();

        loginFormData.append("mobileNo", formData.userPhone);

        login(loginFormData);
    };

    return (
        <SafeAreaView className='flex-1 bg-white'>

            <KeyboardAwareScrollView>
                <View className='items-center justify-center'>
                    <View>
                        <Image source={require("@/assets/images/app-logo.png")} className='size-64' resizeMode='contain' />
                    </View>

                    <View>
                        <Text className='text-3xl font-medium'>Sign in as {selectedSignInType}</Text>
                    </View>
                </View>

                <View className='mt-10 p-4'>
                    <View className='gap-2'>
                        <Text className='font-medium'>Phone Number</Text>

                        <Controller
                            control={control}
                            rules={{
                                required: true,
                                maxLength: 10
                            }}
                            render={({ field: { onBlur, onChange, value } }) => (
                                <Input
                                    className='rounded-lg'
                                    placeholder='Phone Number'
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                            name='userPhone'
                        />
                    </View>

                    <Button
                        className='my-4'
                        onPress={handleSubmit(handleUserLogin)}
                    >
                        <Text>Login</Text>
                    </Button>

                    <View className='flex-row items-center gap-2'>
                        <Text>
                            Don't have an account?
                        </Text>
                        <Button variant={"link"} size={"sm"} className='p-0'>
                            <Text>Sign Up</Text>
                        </Button>
                    </View>

                    <View className='flex-row items-center gap-4 my-6'>
                        <Separator className='flex-1' />
                        <Text className='text-sm text-gray-600'>Or Sign In as</Text>
                        <Separator className='flex-1' />
                    </View>

                    <Button onPress={() => toggleSignInType()}>
                        <Text>Switch to {selectedSignInType === "distributor" ? "mechanic" : "distributor"}</Text>
                    </Button>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default SignInScreen