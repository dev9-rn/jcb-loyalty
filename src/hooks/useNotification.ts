import NotificationContext from "@/context/NotificationContext";
import { useContext } from "react";

const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
};

export default useNotification;
