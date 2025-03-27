import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

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
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name='otp-verify'
                options={{ headerShown: false }}
            />
        </Stack>
    )
}

export default AuthLayout