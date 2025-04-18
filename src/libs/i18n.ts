import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import gu from '@/locales/gu.json';
import kn from '@/locales/kn.json';
import mr from '@/locales/mr.json';
import pa from '@/locales/pa.json';
import te from '@/locales/te.json';
import ta from '@/locales/ta.json';
import bn from '@/locales/bn.json';
import ur from '@/locales/ur.json';
import or from '@/locales/or.json';

import { storage } from '@/utils/storageService';
import { STORAGE_KEYS } from './constants';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
    kn: { translation: kn },
    mr: { translation: mr },
    pa: { translation: pa },
    te: { translation: te },
    ta: { translation: ta },
    bn: { translation: bn },
    ur: { translation: ur },
    or: { translation: or },
}

const initI18n = () => {

    let savedLanguage = storage.getString(STORAGE_KEYS.LANGUAGE_KEYS);

    if (!savedLanguage) {
        savedLanguage = Localization.getLocales()?.[0].languageCode ?? "en";
    };

    i18n.use(initReactI18next).init({
        resources,
        lng: savedLanguage,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });
};

initI18n();

export default i18n;
