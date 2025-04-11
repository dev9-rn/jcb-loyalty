import { NotificationContextType } from "@/types/context";
import { createContext } from "react";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export default NotificationContext;