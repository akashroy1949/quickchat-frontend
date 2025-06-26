import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import rootReducer from "./reducer";
import { LOGOUT } from "./actions/actionTypes";

// Configuration for redux-persist
const persistConfig = {
    key: "root",
    storage: storageSession, // Use sessionStorage for auto-clear on tab/browser close
    whitelist: [], // Add reducers here to persist them for the session only
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types in serializability checks
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, LOGOUT],
            },
        }),
});

// Create the persistor
export const persistor = persistStore(store);

// Export a function to purge the persistor (useful for logout)
export const purgeStore = () => {
    persistor.purge();
};
