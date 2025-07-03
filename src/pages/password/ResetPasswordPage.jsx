// src/pages/ResetPasswordPage.jsx

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../password/PasswordReset.module.css';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { token } = useParams();
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match!');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters long.');
        }

        setLoading(true);

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.put(
                `http://localhost:5000/api/users/resetpassword/${token}`,
                { password },
                config
            );

            setMessage(data.message);
            setLoading(false); 
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred. The token might be invalid or expired.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Set New Password</h2>
                
                {message && <p className={styles.successMessage}>{message}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>New Password</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your new password"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Re-enter your new password"
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={loading || message}>
                        {loading ? 'Updating...' : 'Reset Password'}
                    </button>
                    {message && (
                            <p className={styles.switchLink}>
                                <Link to="/login">Login</Link>
                            </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;