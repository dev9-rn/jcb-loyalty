import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from 'react-native-toast-notifications'
import { PortalHost } from '@rn-primitives/portal';

import AuthProvider from "@/providers/AuthProvider";
import UserProvider from "@/providers/UserProvider";
import ToastNotification from "@/components/ToastNotification";

import "./globals.css"

if (__DEV__) {
  require("../../ReactotronConfig");
}

export default function RootLayout() {
  return (
    <>
      <KeyboardProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
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
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </KeyboardProvider>
    </>
  );
}
