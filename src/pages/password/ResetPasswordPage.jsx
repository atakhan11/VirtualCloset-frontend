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

    // URL-dən tokeni götürmək üçün useParams hook-undan istifadə edirik
    // Məsələn: /reset-password/ABC123XYZ -> token = "ABC123XYZ"
    const { token } = useParams();
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            return setError('Şifrələr üst-üstə düşmür!');
        }
        if (password.length < 6) {
            return setError('Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
        }

        setLoading(true);

        try {
            // Backend-də yaratdığımız /resetpassword/:token endpoint-inə sorğu göndəririk
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.put(
                `http://localhost:5000/api/users/resetpassword/${token}`,
                { password },
                config
            );

            setMessage(data.message); // Uğur mesajını göstəririk
             setLoading(false); 
            
            // Uğurlu olduqdan sonra 3 saniyə gözləyib login səhifəsinə yönləndiririk
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Xəta baş verdi. Token yanlış və ya vaxtı keçmiş ola bilər.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Yeni Şifrə Təyin Et</h2>
                
                {message && <p className={styles.successMessage}>{message}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Yeni Şifrə</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Yeni şifrənizi daxil edin"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Yeni Şifrəni Təsdiqləyin</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Yeni şifrəni təkrar daxil edin"
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={loading || message}>
                        {loading ? 'Yenilənir...' : 'Şifrəni Yenilə'}
                    </button>
                    {message && (
                         <p className={styles.switchLink}>
                            <Link to="/login">Daxil ol</Link>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;