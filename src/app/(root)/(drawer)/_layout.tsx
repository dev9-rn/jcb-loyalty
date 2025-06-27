import React, { useEffect, useState } from 'react'

import { Drawer } from 'expo-router/drawer';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import CustomDrawerContent from '@/components/CustomDrawerContent';

import { BellIcon } from '@/libs/icons/BellIcon';
import { HouseIcon } from '@/libs/icons/HouseIcon';
import { UserIcon } from '@/libs/icons/UserIcon';
import { QrCodeIcon } from '@/libs/icons/QrCodeIcon';
import { HistoryIcon } from '@/libs/icons/HistoryIcon';
import { ClipboardList } from '@/libs/icons/ClipboardList';
import { ClipboardPlusIcon } from '@/libs/icons/ClipboardPlus';
import { FileClockIcon } from '@/libs/icons/FileClockIcon';
import { TruckIcon } from '@/libs/icons/TruckIcon';
import useUser from '@/hooks/useUser';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@/utils/axiosInstance';
import { GET_USER_NOTIFICATIONS_COUNT } from '@/utils/routes';
import axios from 'axios';
import { useToast } from 'react-native-toast-notifications';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type Props = {}

const DrawerLayout = ({ }: Props) => {

    const [notificationCount, setNotificationCount] = useState<number>(0);

    const { userDetails } = useUser();
    const { t } = useTranslation();

    const toast = useToast();

    useEffect(() => {
        if (userDetails?.userType === 2) return;
        fetchNotificationCount();
    }, [])

    const fetchNotificationCount = async () => {
        const notificationCountFormData = new FormData();

        notificationCountFormData.append("distributorId", userDetails?.id);

        try {
            const response = await axiosInstance.post(GET_USER_NOTIFICATIONS_COUNT, notificationCountFormData);
            setNotificationCount(response.data.notificationsCount)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message)
            }
        }
    }

    return (
        <Drawer
            initialRouteName='index'
            backBehavior='initialRoute'
            screenOptions={({ route }) => ({
                headerTitleAlign: "center",
                drawerActiveTintColor: "#FFF",
                drawerActiveBackgroundColor: "#0064AF",
                headerStyle: {
                    backgroundColor: "#0064AF",
                },
                headerTintColor: "#FFF",
                headerTitleStyle: {
                    color: "#FFF"
                },
                drawerItemStyle: {
                    borderRadius: 8,
                    display: ["cash-batch", "report", "report-history", "my-dealers", "foc-coupon-history"].includes(route.name) && (userDetails?.userType != 0) ? "none" : "flex"
                },
            })}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen
                name="profile" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: t('layout.headerTitle.profile'),
                    title: t('layout.headerTitle.profile'),
                    drawerIcon: ({ focused, color }) => (
                        <UserIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="index" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: t('layout.headerTitle.dashboard'),
                    title: t('layout.headerTitle.dashboard'),
                    headerRight: ({ tintColor }) => (
                        <>
                            {userDetails?.userType != 2 ? (
                                <Button variant={"ghost"} size={"icon"} onPress={() => router.navigate("/(root)/(stack)/notification")}>
                                    {notificationCount > 0 && (
                                        <View className='absolute bg-white rounded-lg size-5 items-center justify-center top-0 right-0'>
                                            <Text className='!text-sm text-black font-semibold'>
                                                {notificationCount}
                                            </Text>
                                        </View>
                                    )}
                                    <BellIcon color={tintColor} />
                                </Button>
                            ) : (
                                <></>
                            )}
                        </>
                    ),
                    drawerIcon: ({ focused, color }) => (
                        <HouseIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name='camera'
                options={{
                    drawerLabel: t('layout.headerTitle.scan_coupons'),
                    drawerIcon: ({ focused, color }) => (
                        <QrCodeIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="coupon-history" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: t('layout.headerTitle.coupon_history'),
                    title: t('layout.headerTitle.coupon_history'),
                    drawerIcon: ({ focused, color }) => (
                        <HistoryIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name='foc-coupon-history'
                options={{
                    drawerLabel: t('layout.headerTitle.foc_coupon_history'),
                    title: t('layout.headerTitle.foc_coupon_history'),
                    drawerIcon: ({ focused, color }) => (
                        <HistoryIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="cash-batch" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: t('layout.headerTitle.cash_batch_report'),
                    title: t('layout.headerTitle.cash_batch_report'),
                    drawerIcon: ({ focused, color }) => (
                        <ClipboardList color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="report" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: t('layout.headerTitle.report_coupon'),
                    title: t('layout.headerTitle.report_coupon'),
                    drawerIcon: ({ focused, color }) => (
                        <ClipboardPlusIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="report-history" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: t('layout.headerTitle.report_history'),
                    title: t('layout.headerTitle.report_history'),
                    drawerIcon: ({ focused, color }) => (
                        <FileClockIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name='my-dealers'
                options={{
                    drawerLabel: t('layout.headerTitle.my_retailers'),
                    title: t('layout.headerTitle.my_retailers'),
                    drawerIcon: ({ focused, color }) => (
                        <TruckIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />
        </Drawer>
    )
}

export default DrawerLayout