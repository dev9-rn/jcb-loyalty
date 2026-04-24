import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { router, Stack } from 'expo-router'
import useUser from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@/libs/icons/ArrowLeftIcon'
import Header from '@/components/Header'
import { useTranslation } from 'react-i18next'

type Props = {}

const StackLayout = ({ }: Props) => {

    const { t } = useTranslation();

    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: "#0064AF",
                },
                headerTintColor: "#FFF",
            }}
        >
            <Stack.Screen
                name='notification'
                options={{
                    title: "Notification",
                    headerStyle: {
                        backgroundColor: '#F4AE2B'
                    },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <ArrowLeftIcon color={"#FFF"} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name='camera'
                options={{
                    // headerShown: false,
                    title: 'Scan',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <ArrowLeftIcon color={"#FFF"} size={30}/>
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name='scheme-details'
                options={{
                    // headerShown: false,
                    title: 'Scheme Details',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <ArrowLeftIcon color={"#FFF"} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name='remove-account'
                options={{
                    title: "Remove Account",
                    headerTitleStyle: {
                        color: '#FFF'
                    },
                }}
            />
        </Stack>
    )
}

export default StackLayout