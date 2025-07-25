import NotificationContext from "@/context/NotificationContext";
import { ReactNode, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationAsync";

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
}) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
        useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then(
            (token) => setExpoPushToken(token),
            (error) => setError(error)
        );

        const notificationListener =
            Notifications.addNotificationReceivedListener((notification) => {
                // console.log("🔔 Notification Received when app is running: ", notification);
                setNotification(notification);
            });

        const responseListener =
            Notifications.addNotificationResponseReceivedListener((response) => {
                // Handle the notification response here
                // console.log(
                //     "🔔 Notification Response: ",
                //     JSON.stringify(response, null, 2),
                //     JSON.stringify(response.notification.request.content.data, null, 2)
                // );
            });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{ expoPushToken, notification, error }}
        >
            {children}
        </NotificationContext.Provider>
    );
};