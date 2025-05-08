import { View, Text } from 'react-native'
import React from 'react'
import { router, Stack } from 'expo-router'
import useUser from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@/libs/icons/ArrowLeftIcon'

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
                    headerLeft: () => (
                        <Button variant={"ghost"} size={"icon"} onPress={() => router.back()}>
                            <ArrowLeftIcon color={"#FFF"} />
                        </Button>
                    ),
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