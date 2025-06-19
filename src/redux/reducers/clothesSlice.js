// redux/reducers/clothesSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from './userSlice';

const API_URL = 'http://localhost:5000/api/clothes'; // Sizin clothes API ünvanınız

// ----- ASİNXRON THUNK-LAR -----

// Geyimləri çəkmək
export const fetchClothes = createAsyncThunk(
    'clothes/fetchClothes',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token; // Tokeni birbaşa user state-indən götürürük
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get(API_URL, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// Geyim əlavə etmək
export const addCloth = createAsyncThunk(
    'clothes/addCloth',
    async (clothData, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token;
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.post(API_URL, clothData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// Geyimi silmək
export const deleteCloth = createAsyncThunk(
    'clothes/deleteCloth',
    async (clothId, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.delete(`${API_URL}/${clothId}`, config);
            return clothId;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// ----- SLICE-IN ÖZÜ -----

const initialState = {
    items: [],
    status: 'idle',
    error: null
};

const clothesSlice = createSlice({
    name: 'clothes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClothes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchClothes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchClothes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addCloth.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(deleteCloth.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item._id !== action.payload);
            })
            // Logout olanda geyimləri təmizləyək
            .addCase(logout, (state) => {
                state.items = [];
                state.status = 'idle';
                state.error = null;
            });
    }
});

export const selectAllClothes = (state) => state.clothes.items;
export const getClothesStatus = (state) => state.clothes.status;

export default clothesSlice.reducer;