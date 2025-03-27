import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

type Props = {}

const StackLayout = ({ }: Props) => {
    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center'
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