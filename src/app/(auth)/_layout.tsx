import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import useAuth from '@/hooks/useAuth'
import { AppState } from 'react-native'

type Props = {}

const AuthLayout = ({ }: Props) => {
    const { fetchisMaintenanceApi } = useAuth()

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                fetchisMaintenanceApi();
            }
        });

        return () => subscription.remove();
    }, []);
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
                    headerTintColor: "#000",
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