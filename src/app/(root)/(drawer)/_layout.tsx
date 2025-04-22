import React from 'react'

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

type Props = {}

const DrawerLayout = ({ }: Props) => {

    const { userDetails } = useUser();
    const { t } = useTranslation();

    return (
        <Drawer
            initialRouteName='index'
            backBehavior='initialRoute'
            screenOptions={({ route }) => ({
                headerTitleAlign: "center",
                drawerActiveTintColor: "#FFF",
                drawerActiveBackgroundColor: userDetails?.userType === 0 ? "#144799" : '#f0a028',
                headerStyle: {
                    backgroundColor: userDetails?.userType === 0 ? "#144799" : '#f0a028',
                },
                headerTintColor: "#FFF",
                headerTitleStyle: {
                    color: "#FFF"
                },
                drawerItemStyle: {
                    borderRadius: 8,
                    display: ["cash-batch", "report", "report-history", "my-dealers"].includes(route.name) && (userDetails?.userType != 0) ? "none" : "flex"
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
                    // headerRight: ({ tintColor }) => (
                    //     <Button variant={"ghost"} size={"icon"} onPress={() => router.navigate("/(root)/(stack)/notification")}>
                    //         <BellIcon color={tintColor} />
                    //     </Button>
                    // ),
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