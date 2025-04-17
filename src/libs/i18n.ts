import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import { storage } from '@/utils/storageService';
import { STORAGE_KEYS } from './constants';

const resources = {
    en: { translation: en },
    hi: { translation: hi }
}

const initI18n = () => {

    let savedLanguage = storage.getString(STORAGE_KEYS.LANGUAGE_KEYS);

    if (!savedLanguage) {
        savedLanguage = Localization.getLocales()?.[0].languageCode ?? "en";
    };

    i18n.use(initReactI18next).init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });
};

initI18n();

export default i18n;
