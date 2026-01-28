import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { CardSlice } from "./CardSlice";
import { ImprovedCardSlice } from "./ImprovedGameSlice"; // Import improved slice
import { DeckSlice } from "./DeckSlice";
import { CombatSlice } from "./CombatSlice"; // Import combat slice
import { turnSystemMiddleware } from "./turnSystemMiddleware"; // Import middleware

import storage from "redux-persist/lib/storage";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const persistConfig = {
  key: "root",
  storage: storage,
  blacklist: ["card", "game", "combat"], // Don't persist game state (it resets each match)
};

const rootReducer = combineReducers({
  card: CardSlice.reducer, // Keep old slice for compatibility
  game: ImprovedCardSlice.reducer, // NEW: Use improved slice with turn system
  deck: DeckSlice.reducer,
  combat: CombatSlice.reducer, // NEW: Combat system
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(turnSystemMiddleware), // Add turn system middleware
});

export const persistor = persistStore(store);
