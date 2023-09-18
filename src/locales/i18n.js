import I18n from 'react-native-i18n';
import moment from 'moment';
import en from '../locales/en.json';
import hi from '../locales/he.json';
import fr from '../locales/fr.json';
import pa from '../locales/pn.json';
import ma from '../locales/ma.json';
import gu from '../locales/gu.json';
import tl from '../locales/tl.json';
import ta from '../locales/ta.json';
import ben from '../locales/ben.json';
import ur from '../locales/ur.json';
import kan from '../locales/kan.json';
import od from '../locales/od.json';
import swa from '../locales/swa.json';

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
I18n.translations = {
    en,
    hi,
    fr,
    pa,
    ma,
    gu,
    tl,
    ta,
    ben,
    ur,
    kan,
    od,
    swa
};

// const currentLocale = I18n.currentLocale();

// // Is it a RTL language?
// export const isRTL = currentLocale.indexOf('hi') === 0 || currentLocale.indexOf('en') === 0;

// // Allow RTL alignment in RTL languages
// // ReactNative.I18nManager.allowRTL(isRTL);

// // Localizing momentjs to Hebrew or English
// if (currentLocale.indexOf('hi') === 0) {
//     // require('moment/locale/hi.js');
//     moment.locale('hi');
// } else {
//     moment.locale('en');
// }

// The method we'll use instead of a regular string
export function strings(name, params = {}) {
    return I18n.t(name, params);
};

export default I18n;