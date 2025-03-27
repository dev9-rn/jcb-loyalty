import { View, Text } from 'react-native'
import React from 'react'
import useAuth from '@/hooks/useAuth';
import { Redirect, Stack } from 'expo-router';

type Props = {}

const HomeLayout = ({ }: Props) => {

    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Redirect href="/(auth)" />;
    }
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