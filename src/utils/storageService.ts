import { MMKV } from 'react-native-mmkv';

export const tokenStorage = new MMKV({
    id: "daewoo-auth",
    encryptionKey: "daewoo-token"
});

export const storage = new MMKV();

export const tokenStorageService = {
    setAuthToken: (tokenKey: string, tokenValue: string) => {
        return tokenStorage.set(tokenKey, tokenValue);
    },
    getAuthToken: (tokenKey: string) => {
        return tokenStorage.getString(tokenKey);
    },
    removeAuthToken: (tokenKey: string) => {
        return tokenStorage.delete(tokenKey);
    }
};

export const storageService = {
    setItem: (key: string, value: string) => {
        return storage.set(key, value);
    },
    getItem: (key: string) => {
        const value = storage.getString(key);
        return value;
    },
    removeItem: (key: string) => {
        storage.delete(key);
    },
}