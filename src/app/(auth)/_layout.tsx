import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { router, Stack } from 'expo-router'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@/libs/icons/ArrowLeftIcon'

type Props = {}

const AuthLayout = ({ }: Props) => {
    return (
        <Stack>
            <Stack.Screen
                name='index'
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name='sign-up'
                options={{
                    headerTitle: "Sign Up",
                    headerTitleAlign: 'center',
                    headerTintColor: "#FFF",
                }}
            />

            <Stack.Screen
                name='otp-verify'
                options={{
                    headerTitle: "Verify Otp"
                }}
            />
        </Stack>
    )
}

export default AuthLayout