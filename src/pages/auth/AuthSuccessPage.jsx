// src/pages/AuthSuccessPage.jsx

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/reducers/userSlice.js'; 
import { jwtDecode } from 'jwt-decode';

const AuthSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // 1. Tokeni localStorage-a yazırıq
            localStorage.setItem('token', token);
            
            // 2. Tokenin içindən user məlumatlarını çıxarırıq
            const decodedUser = jwtDecode(token);
            
            // 3. User məlumatlarını da localStorage-a yazırıq
            // Backend-də tokeni yaradarkən payload-a { user: {...} } qoyduğumuzu fərz edirik
            localStorage.setItem('user', JSON.stringify(decodedUser.user));

            // 4. Redux state-ini yeniləyirik
            dispatch(setAuth({ user: decodedUser.user, token }));

            // 5. İstifadəçini ana səhifəyə yönləndiririk
            navigate('/');
        } else {
            // Token yoxdursa, bir problem var, login səhifəsinə qayıdırıq
            navigate('/login');
        }
    }, [searchParams, navigate, dispatch]);

    // Bu səhifə çox sürətli işlədiyi üçün istifadəçi adətən bu mətni görməyəcək
    return <div>Authenticating, please wait...</div>;
};

export default AuthSuccessPage;