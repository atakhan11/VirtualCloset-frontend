// src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../signup/Signup.module.css'; // Login/Signup stillərini təkrar istifadə edirik

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); // Uğur mesajı üçün
    const [error, setError] = useState('');     // Xəta mesajı üçün

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Backend-də yaratdığımız /forgotpassword endpoint-inə sorğu göndəririk
            const { data } = await axios.post('/api/users/forgotpassword', { email });
            setMessage(data.message); // Backend-dən gələn uğur mesajını göstəririk
        } catch (err) {
            // Əgər backend xəta qaytarsa (məsələn, server işləmirsə)
            const errorMessage = err.response?.data?.message || 'Xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.';
            setError(errorMessage);
        }
    };

    return (
        <div className={styles.signupContainer}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Şifrəni Unutdum</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                    Şifrənizi sıfırlamaq üçün qeydiyyatdan keçdiyiniz email ünvanını daxil edin.
                </p>

                {/* Uğur və ya Xəta mesajlarını göstərən bloklar */}
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
                            placeholder="email@nümunə.com"
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        Sıfırlama Linki Göndər
                    </button>
                    <p className={styles.switchLink}>
                        Şifrənizi xatırladınız? <Link to="/login">Daxil olun</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;