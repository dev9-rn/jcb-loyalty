import { initializeApp } from "@react-native-firebase/app";
import { getMessaging } from "@react-native-firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAY7zlF0XxYcxJodwFlg-HYpKBrO6_B-s0",
    authDomain: "daewoolube.firebaseapp.com",
    projectId: "daewoolube",
    storageBucket: "daewoolube.firebasestorage.app",
    messagingSenderId: "543169999286",
    appId: "1:543169999286:web:9ba00488202f20c0811117",
    measurementId: "G-112CHDHH1T"
};

export const firebaseApp = initializeApp(firebaseConfig);

export const messaging = getMessaging(firebaseApp);