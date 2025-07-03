// src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../password/PasswordReset.module.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); 
    const [error, setError] = useState(''); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const { data } = await axios.post('/api/users/forgotpassword', { email });
            setMessage(data.message); 
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Forgot Password</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                    Enter your registered email address to reset your password.
                </p>

                {message && <p className={styles.successMessage}>{message}</p>}
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
                            placeholder="email@example.com"
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        Send Reset Link
                    </button>
                    <p className={styles.switchLink}>
                        Remember your password? <Link to="/login">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;