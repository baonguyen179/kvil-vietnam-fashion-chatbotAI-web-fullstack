import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Mặc định dùng localStorage
import rootReducer from './reducer/rootReducer';
import { injectStore } from '@/utils/axiosCustomize';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'cart', 'theme']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});
const persistor = persistStore(store);
injectStore(store);
export { store, persistor };