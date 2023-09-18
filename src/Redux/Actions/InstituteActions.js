import * as actionTypes from './actionTypes';

export const setIntituteUserData = (obj) => {
    return {
        type: actionTypes.SHOWHIDESCREEN,
        payload: obj
    }
}
export const setLoginData = (obj) => {
    return {
        type: actionTypes.LOGIN_DATA_VERIFIER,
        payload: obj
    }
}
export const clearInsti = (obj) => {
    return {
        type: actionTypes.CLEAR_STORE_INSTI,
        payload: obj
    }
}