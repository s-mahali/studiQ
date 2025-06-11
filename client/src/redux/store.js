import { combineReducers, configureStore } from "@reduxjs/toolkit";
import themeSlice from "./slicers/ThemeSlice";
import authSlice from "./slicers/authSlice";

import {

  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";



const persistConfig = {
  key: "studiQ",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  theme: themeSlice,
  auth: authSlice,
 
})

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

export default store;