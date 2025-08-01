import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import rootReducer from '../Redux/Reducers/rootReducer';
// import  storage from 'redux-persist/lib/storage';
import AsyncStorage from '@react-native-community/async-storage';
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(
    persistedReducer,
    applyMiddleware(
    ),
);
let persistor = persistStore(store);
export {
    store,
    persistor,
};