// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../redux/reducers/userSlice'; // userSlice-dan loginUser-i import edirik
import { unwrapResult } from '@reduxjs/toolkit';
import styles from './Login.module.css'; // Qeydiyyat səhifəsinin stillərini təkrar istifadə edirik

const LoginPage = () => {
    // Login üçün yalnız email və password lazımdır
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // Dispatch-ə login məlumatlarını ötürürük
            const actionResult = await dispatch(loginUser({ email, password }));
            unwrapResult(actionResult);

            // Uğurlu girişdən sonra istifadəçini qarderob səhifəsinə yönləndiririk
            navigate('/');

        } catch (err) {
            setError(err.message || 'Giriş uğursuz oldu. Email və ya şifrə yanlışdır.');
        }
    };

    return (
        <div className={styles.signupContainer}> {/* Eyni class adlarını istifadə edirik */}
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Daxil Ol</h2>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Şifrə</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Link to="/forgot-password" className={styles.forgotPasswordLink}>
                        Şifrəni Unutdum
                    </Link>
                    <button type="submit" className={styles.button}>Daxil Ol</button>
                    <p className={styles.switchLink}>
                        Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keçin</Link>
                    </p>
                </form>
                <div className={styles.orDivider}>OR</div>
<a href="http://localhost:5000/api/users/auth/google" className={styles.socialBtn}>
    {/* Google ikonunu public qovluğuna qoyub birbaşa çağıra bilərsiniz */}
    <img src="https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/Logo-google-icon-PNG.png" alt="Google" /> 
    Continue with Google
</a>
            </div>
        </div>
    );
};

export default LoginPage;