import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import useUser from '@/hooks/useUser'

type Props = {}

const StackLayout = ({ }: Props) => {

    const { userDetails } = useUser();

    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: userDetails?.userType === 0 ? "#144799" : '#f0a028',
                },
                headerTintColor: "#FFF",
            }}
        >
            <Stack.Screen
                name='notification'
                options={{
                    title: "Notification",
                    headerBackVisible: true,
                }}
            />

            <Stack.Screen
                name='camera'
                options={{
                    headerTitleStyle: {
                        color: '#FFF'
                    },
                }}
            />
        </Stack>
    )
}

export default StackLayout