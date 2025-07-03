// src/pages/SignupPage.jsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../redux/reducers/userSlice'; 
import { unwrapResult } from '@reduxjs/toolkit';
import styles from './Signup.module.css'; 

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const actionResult = await dispatch(registerUser({ name, email, password }));
            unwrapResult(actionResult);

            navigate('/');

        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className={styles.signupContainer}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Sign Up</h2>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>Name</label>
                        <input
                            type="text"
                            id="name"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.button}>Sign Up</button>
                    <p className={styles.switchLink}>
                        Already have an account? <Link to="/login">Login</Link>
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

export default SignupPage;