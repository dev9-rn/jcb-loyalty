import { View, Text } from 'react-native'
import React from 'react'
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast';

import { CircleCheckIcon } from "@/libs/icons/CircleCheckIcon"
import { CircleAlertIcon } from "@/libs/icons/CircleAlertIcon"

type Props = {
    toastData: ToastProps;
}

const ToastNotification = ({ toastData }: Props) => {

    if (!toastData) return;

    const isActionSuccess = (toastData.data?.status || 0) <= 200

    return (
        <View className='android:shadow-lg ios:shadow-md bg-white rounded-lg p-4'>

            <View className='flex-row items-center gap-2'>
                {isActionSuccess ? (
                    <CircleCheckIcon className='text-green-600' />
                ) : (
                    <CircleAlertIcon className='text-red-500' />
                )}

                <Text className={`font-medium flex-shrink ${!isActionSuccess && "text-red-500"}`}>
                    {toastData.message}
                </Text>
            </View>
        </View>
    )
}

export default ToastNotification