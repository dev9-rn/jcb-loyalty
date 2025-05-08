import { View, Text, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import axiosInstance from '@/utils/axiosInstance'
import { GET_USER_NOTIFICATIONS } from '@/utils/routes'
import useUser from '@/hooks/useUser'
import { FlatList } from 'react-native-gesture-handler'
import formatDateTime from '@/utils/formatDateTime'

type Props = {}

const NotificationScreen = ({ }: Props) => {

    const [notificationHistory, setNotificationHistory] = React.useState<INotificationHistory[]>([]);

    const { userDetails } = useUser();

    useEffect(() => {
        fetchUserNotificaitonHistory();
    }, []);

    const fetchUserNotificaitonHistory = async () => {
        const notificationFormData = new FormData();
        notificationFormData.append("distributorId", userDetails?.id);

        try {
            const response = await axiosInstance.post(GET_USER_NOTIFICATIONS, notificationFormData);

            if (response.data.status !== 200) {
                console.log(response.data.message);
            };

            setNotificationHistory(response.data.notifications);
            console.log(response.data);
        } catch (error) {

        };
    };

    return (
        <ScrollView className='flex-1 bg-white p-4'>
            <Text className='text-2xl font-semibold mb-4'>
                Notification history
            </Text>

            <FlatList
                scrollEnabled={false}
                data={notificationHistory}
                renderItem={({ item }) => (
                    <View className='bg-gray-50 p-4 rounded-md my-2'>
                        <Text className='text-lg font-semibold mb-3'>{item.title}</Text>
                        <Text className='text-gray-800'>{item.notification}</Text>
                        <Text className='text-xs text-gray-400 mt-2'>{formatDateTime(item.created_date)}</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className='flex-1 items-center justify-center'>
                        <Text className='text-2xl font-medium text-gray-500'>No new notification avilable!</Text>
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />

        </ScrollView>
    )
}

export default NotificationScreen