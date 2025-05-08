import { View, Image, Platform, Linking } from 'react-native'
import React from 'react'
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer'
import { Button } from './ui/button'

import { MenuIcon } from '@/libs/icons/MenuIcon'
import useUser from '@/hooks/useUser'
import { Text } from './ui/text'
import { LogOutIcon } from '@/libs/icons/LogoutIcon';
import useAuth from '@/hooks/useAuth'
import MultiLangualDropdown from './MultiLangualDropdown'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CustomDrawerContent = (props: DrawerContentComponentProps) => {

    const { userDetails } = useUser();
    const insets = useSafeAreaInsets();
    const { logout } = useAuth()
    const { t } = useTranslation();

    return (
        <View className='flex-1'>


            <DrawerContentScrollView {...props}>
                <Button size={"icon"} variant={"ghost"} onPress={() => props.navigation.closeDrawer()} className='mb-4'>
                    <MenuIcon className='text-primary' />
                </Button>
                <View className='items-center mb-4 bg-primary/20 rounded-md p-4 pt-0'>
                    <Image source={require("@/assets/images/app-logo.png")} className='size-40' resizeMode='contain' />

                    <View className='items-center'>
                        <Text className='text-lg font-medium'>{t("layout.drawer.welcome")}</Text>
                        <Text className='text-xl font-semibold text-primary'>{userDetails?.name || userDetails?.full_name || userDetails?.dealer_name}</Text>
                    </View>
                </View>
                <DrawerItemList
                    {...props}
                />

                {/* <DrawerItem
                    label="Manual"
                    icon={({ color, focused }) => (
                        <FileDownIcon color={focused ? "#FFF" : color} />
                    )}
                    onPress={() => Linking.openURL('https://mywebsite.com/help')}
                /> */}

                <DrawerItem
                    label="Logout"
                    labelStyle={{
                        color: "#ef4444"
                    }}
                    icon={({ color, focused }) => (
                        <LogOutIcon className='text-red-500' />
                    )}
                    onPress={() => logout()}
                />
            </DrawerContentScrollView>

            <View className='p-4 m-4 border-t border-gray-200'>
                <MultiLangualDropdown />
            </View>
        </View >
    )
}

export default CustomDrawerContent