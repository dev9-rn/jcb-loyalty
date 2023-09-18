import { combineReducers } from 'redux';
import InstituteReducer from './InstituteReducer'
import VerifierReducer from './VerifierReducer'

const reducer = combineReducers({
    InstituteReducer: InstituteReducer,
    VerifierReducer: VerifierReducer
})
export default reducer;