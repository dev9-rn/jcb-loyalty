import { SHOWHIDESCREEN, LOGIN_DATA_VERIFIER, CLEAR_STORE_INSTI } from '../Actions/actionTypes';

const initialState = {
    showHideLanguageScreen: false,
    loginData: {}
}

export default function (state = initialState, action) {
    switch (action.type) {

        case SHOWHIDESCREEN:
            return {
                ...state, showHideLanguageScreen: action.payload
            }
        case LOGIN_DATA_VERIFIER:
            return {
                ...state, loginData: action.payload
            }
        case CLEAR_STORE_INSTI:
            return {
                ...state, loginData: {}
            }
            clearInsti
        default:
            return state;
    }
}