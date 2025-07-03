// src/pages/AuthSuccessPage.jsx

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setAuth } from '../../redux/reducers/userSlice.js'; 

const AuthSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');

        const fetchUser = async (authToken) => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/users/profile', config);

                dispatch(setAuth({ user: data, token: authToken }));
                
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('token', authToken);

                navigate('/profile');

            } catch (error) {
                console.error("Failed to retrieve user data during Google login:", error);
                navigate('/login');
            }
        };

        if (token) {
            fetchUser(token);
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, dispatch]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h2>Verifying login, please wait...</h2>
            <p>Redirecting...</p>
        </div>
    );
};

export default AuthSuccessPage;