import { View, Text, AppState } from 'react-native'
import React, { useEffect } from 'react'
import useAuth from '@/hooks/useAuth';
import { Redirect, Stack } from 'expo-router';

type Props = {}

const HomeLayout = ({ }: Props) => {

    const { isAuthenticated, fetchisMaintenanceApi } = useAuth();

    if (!isAuthenticated) {
        return <Redirect href="/(auth)" />;
    }

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                // fetchisMaintenanceApi();
            }
        });

        return () => subscription.remove();
    }, []);
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="(drawer)"
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name='(stack)'
            />
        </Stack>
    );
}

export default HomeLayout