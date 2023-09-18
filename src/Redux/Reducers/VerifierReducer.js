import { LANGUAGE_CONTROL, CLEAR_STORE, VERRIFIER_USER_DATA, COUNTER, COUNTER1, ENABLE_DARK_THEME, FINGER_PRINT_ENABLE } from '../Actions/actionTypes';

const initialState = {
    LoginData: [],
    languageEnglish: "English",
    mechanicData: {},
    testCounter: 0,
    testCounter1: 0,
    enableDarkTheme: false,
    enableFingerPrint: false
}

export default function (state = initialState, action) {
    switch (action.type) {

        case LANGUAGE_CONTROL:
            return {
                ...state, languageEnglish: action.payload
            }
        case VERRIFIER_USER_DATA:
            return {
                ...state, mechanicData: action.payload
            }
        case COUNTER:
            return {
                ...state, testCounter: action.payload
            }
        case COUNTER1:
            return {
                ...state, testCounter1: action.payload
            }
        case ENABLE_DARK_THEME:
            return {
                ...state, enableDarkTheme: action.payload
            }
        case FINGER_PRINT_ENABLE:
            return {
                ...state, enableFingerPrint: action.payload
            }
        case CLEAR_STORE:
            return {
                initialState
            }
        default:
            return state;
    }
}