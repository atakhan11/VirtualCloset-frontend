// redux/reducers/userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const token = localStorage.getItem('token');
const userItem = localStorage.getItem('user');

// Yoxlayırıq: userItem mövcuddurmu VƏ "undefined" mətnindən fərqlidirmi?
const user = (userItem && userItem !== 'undefined') 
    ? JSON.parse(userItem) 
    : null;

export const registerUser = createAsyncThunk(
    'user/signup',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/signup`, userData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            // DÜZƏLİŞ BURADADIR
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const loginUser = createAsyncThunk(
    'user/login',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, userData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            // DÜZƏLİŞ BURADADIR
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

const initialState = {
    user: user ? user : null,
    token: token ? token : null,
    status: 'idle',
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
         setAuth: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.status = 'succeeded';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => { state.status = 'loading'; })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(loginUser.pending, (state) => { state.status = 'loading'; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { logout, setAuth } = userSlice.actions;
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;
export default userSlice.reducer;