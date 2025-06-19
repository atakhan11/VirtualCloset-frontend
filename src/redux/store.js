// redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userSlice.js';
import clothesReducer from './reducers/clothesSlice.js';

export const store = configureStore({
  reducer: {
    user: userReducer,
    clothes: clothesReducer,
  },
});