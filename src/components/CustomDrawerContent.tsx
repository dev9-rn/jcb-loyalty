import { View, Image, Platform, Linking } from "react-native";
import React from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Button } from "./ui/button";

import { MenuIcon } from "@/libs/icons/MenuIcon";
import useUser from "@/hooks/useUser";
import { Text } from "./ui/text";
import { LogOutIcon } from "@/libs/icons/LogoutIcon";
import useAuth from "@/hooks/useAuth";
import MultiLangualDropdown from "./MultiLangualDropdown";
import { useTranslation } from "react-i18next";
import { FileDownIcon } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import VersionCheck from 'react-native-version-check-expo';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { userDetails } = useUser();
  const { logout } = useAuth();
  const { t } = useTranslation();
  // const currentVersion = VersionCheck.getCurrentVersion()
  // VersionCheck.getCountry().then(country => console.log(country))
  // console.log(userDetails, "userDetails");

  return (
    <SafeAreaView className="flex-1">
      <DrawerContentScrollView {...props}>
        <Button
          size={"icon"}
          variant={"ghost"}
          onPress={() => props.navigation.closeDrawer()}
          className="mb-4"
        >
          <MenuIcon className="text-primary" />
        </Button>
        <View className="items-center mb-4 rounded-md p-4 pt-0">
          <Image
            source={{ uri: userDetails?.brand_logo }}
            className="size-40"
            resizeMode="contain"
          />

          <View className="items-center">
            {/* <Text className="text-lg font-medium">
              {t("layout.drawer.welcome")}
            </Text> */}
            <Text className="text-xl font-semibold text-primary">
              {userDetails?.company_name}
            </Text>
          </View>
        </View>
        <DrawerItemList {...props} />

        <DrawerItem
          label="Manual"
          icon={({ color, focused }) => (
            <FileDownIcon color={focused ? "#FFF" : color} />
          )}
          onPress={() => Linking.openURL('https://seqrloyalty.com/jcb/usermanual/JCB_mobile%20user_doc_28.11.2024.pdf')}
        />

        <DrawerItem
          label="Logout"
          labelStyle={{
            color: "#ef4444",
          }}
          icon={({ color, focused }) => <LogOutIcon className="text-red-500" />}
          onPress={() => logout()}
        />
      </DrawerContentScrollView>

      <View className="p-4 m-4 border-t border-gray-200">
        {/* <Text className='mb-2 text-primary font-medium'>V {currentVersion}</Text> */}
        <MultiLangualDropdown />
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawerContent;
