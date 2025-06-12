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
                options={{
                    headerBackButtonDisplayMode: "minimal",
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