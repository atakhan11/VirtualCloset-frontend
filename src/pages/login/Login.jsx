// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../redux/reducers/userSlice'; 
import { unwrapResult } from '@reduxjs/toolkit';
import styles from './Login.module.css'; 

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const actionResult = await dispatch(loginUser({ email, password }));
            unwrapResult(actionResult);

            navigate('/');

        } catch (err) {
            setError(err.message || 'Login failed. Email or password is incorrect.');
        }
    };

    return (
        <div className={styles.signupContainer}> 
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Login</h2>
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
                        <label htmlFor="password" className={styles.label}>Password</label>
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
                        Forgot Password
                    </Link>
                    <button type="submit" className={styles.button}>Login</button>
                    <p className={styles.switchLink}>
                        Don't have an account? <Link to="/register">Sign Up</Link>
                    </p>
                </form>
                <div className={styles.orDivider}>OR</div>
<a href="http://localhost:5000/api/users/auth/google" className={styles.socialBtn}>
    <img src="https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/Logo-google-icon-PNG.png" alt="Google" /> 
    Continue with Google
</a>
            </div>
        </div>
    );
};

export default LoginPage;