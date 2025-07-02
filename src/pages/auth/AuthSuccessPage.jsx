// src/pages/AuthSuccessPage.jsx

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setAuth } from '../../redux/reducers/userSlice.js'; // Öz Redux action-unuzun yolu

const AuthSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');

        const fetchUser = async (authToken) => {
            try {
                // 1. Token ilə qorunan /profile endpoint-inə sorğu göndəririk
                const config = {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                };
                // Proxy-niz varsa, /api/users/profile, yoxdursa tam ünvan yazılmalıdır
                const { data } = await axios.get('http://localhost:5000/api/users/profile', config);

                // 2. Gələn istifadəçi məlumatları (data) və token ilə Redux-u yeniləyirik
                dispatch(setAuth({ user: data, token: authToken }));
                
                // Məlumatları localStorage-ə də yazaq ki, səhifə yenilənəndə itməsin
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('token', authToken);

                // 3. Proses uğurlu olduqda, istifadəçini profil səhifəsinə yönləndiririk
                navigate('/profile');

            } catch (error) {
                console.error("Google ilə giriş zamanı istifadəçi məlumatları alına bilmədi:", error);
                navigate('/login');
            }
        };

        if (token) {
            fetchUser(token);
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, dispatch]);


    // Bu səhifənin heç bir vizual görüntüsü olmayacaq, sadəcə "Yönləndirilir..." yazısı göstərəcək.
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h2>Giriş yoxlanılır, zəhmət olmasa gözləyin...</h2>
            <p>Yönləndirilirsiniz...</p>
        </div>
    );
};

export default AuthSuccessPage;