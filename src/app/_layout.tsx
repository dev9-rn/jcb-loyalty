import { SplashScreen, Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from 'react-native-toast-notifications'
import { PortalHost } from '@rn-primitives/portal';
import * as Notifications from "expo-notifications";

import AuthProvider from "@/providers/AuthProvider";
import UserProvider from "@/providers/UserProvider";
import ToastNotification from "@/components/ToastNotification";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NotificationProvider } from "@/providers/NotificationProvider";

import "./globals.css"
import '../libs/i18n';
import { useEffect, useState } from "react";
import CustomSplashScreen from "@/components/CustomSplashScreen";

if (__DEV__) {
  require("../../ReactotronConfig");
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  return (
    <>
      <NotificationProvider>
        <KeyboardProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <BottomSheetModalProvider>
                <ToastProvider
                  offsetBottom={40}
                  swipeEnabled={true}
                  renderToast={(props) => <ToastNotification toastData={props} />}
                >
                  <UserProvider>
                    <AuthProvider>
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen
                          name="(auth)"
                          options={{ headerShown: false }}
                        />

                        <Stack.Screen
                          name="(root)"
                          options={{ headerShown: false }}
                        />
                      </Stack>
                    </AuthProvider>
                  </UserProvider>
                </ToastProvider>
                <PortalHost />
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </KeyboardProvider>
      </NotificationProvider>
    </>
  );
}
