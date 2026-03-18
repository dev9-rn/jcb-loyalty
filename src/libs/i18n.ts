import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '@/libs/locales/en.json';
import hi from '@/libs/locales/hi.json';
import gu from '@/libs/locales/gu.json';
import kn from '@/libs/locales/kn.json';
import mr from '@/libs/locales/mr.json';
import pa from '@/libs/locales/pn.json';
import te from '@/libs/locales/tl.json';
import ta from '@/libs/locales/ta.json';
import bn from '@/libs/locales/bn.json';
import ur from '@/libs/locales/ur.json';
import or from '@/libs/locales/od.json';
import fr from '@/libs/locales/fr.json';
import swa from '@/libs/locales/swa.json';


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
    fr: { translation: fr },
    swa: { translation: swa }

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
