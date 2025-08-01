import * as actionTypes from './actionTypes';

export const setLanguage = (obj) => {
    return {
        type: actionTypes.LANGUAGE_CONTROL,
        payload: obj
    }
}
export const clearTheStoreOnLogout = (obj) => {
    // console.log(obj, obj);
    return {
        type: actionTypes.CLEAR_STORE,
        payload: obj
    }
}
export const setMechanicData = (obj) => {
    return {
        type: actionTypes.VERRIFIER_USER_DATA,
        payload: obj
    }
}
export const setCounterValue = (obj) => {
    return {
        type: actionTypes.COUNTER,
        payload: obj
    }
}
export const setCounter1Value = (obj) => {
    return {
        type: actionTypes.COUNTER1,
        payload: obj
    }
}
export const enableDarkTheme = (obj) => {
    return {
        type: actionTypes.ENABLE_DARK_THEME,
        payload: obj
    }
}
export const fingerPrintEnableAuth = (obj) => {
    return {
        type: actionTypes.FINGER_PRINT_ENABLE,
        payload: obj
    }
}