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

type Props = {}

const DrawerLayout = ({ }: Props) => {

    const { userDetails } = useUser();

    return (
        <Drawer
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
                    drawerLabel: 'Profile',
                    title: 'Profile',
                    drawerIcon: ({ focused, color }) => (
                        <UserIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="index" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: 'Dashboard',
                    title: 'Dashboard',
                    headerRight: ({ tintColor }) => (
                        <Button variant={"ghost"} size={"icon"} onPress={() => router.navigate("/(root)/(stack)/notification")}>
                            <BellIcon color={tintColor} />
                        </Button>
                    ),
                    drawerIcon: ({ focused, color }) => (
                        <HouseIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name='camera'
                options={{
                    drawerLabel: 'Scan Coupons',
                    drawerIcon: ({ focused, color }) => (
                        <QrCodeIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="coupon-history" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: 'Coupon History',
                    title: 'Coupon History',
                    drawerIcon: ({ focused, color }) => (
                        <HistoryIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="cash-batch" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: 'Cash Batch Report',
                    title: 'Cash Batch Reports',
                    drawerIcon: ({ focused, color }) => (
                        <ClipboardList color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="report" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: 'Report',
                    title: 'Reports',
                    drawerIcon: ({ focused, color }) => (
                        <ClipboardPlusIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name="report-history" // This is the name of the page and must match the url from root
                options={{
                    drawerLabel: 'Report History',
                    title: 'Reports History',
                    drawerIcon: ({ focused, color }) => (
                        <FileClockIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />

            <Drawer.Screen
                name='my-dealers'
                options={{
                    drawerLabel: 'My Retailers',
                    title: 'Retailers',
                    drawerIcon: ({ focused, color }) => (
                        <TruckIcon color={focused ? "#FFF" : color} />
                    )
                }}
            />
        </Drawer>
    )
}

export default DrawerLayout