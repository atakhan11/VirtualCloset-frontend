// src/pages/SignupPage.jsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../redux/reducers/userSlice'; // Fayl yolunu yoxlayın
import { unwrapResult } from '@reduxjs/toolkit';
import styles from './Signup.module.css'; // Yeni CSS modulunu import edirik

const SignupPage = () => {
    // Yeni sahələrə uyğun state-lər
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
            setError("Şifrələr üst-üstə düşmür!");
            return;
        }

        try {
            // Dispatch-ə yeni məlumatları ötürürük
            const actionResult = await dispatch(registerUser({ name, email, password }));
            unwrapResult(actionResult);

            navigate('/');

        } catch (err) {
            setError(err.message || 'Qeydiyyat baş tutmadı. Zəhmət olmasa, yenidən cəhd edin.');
        }
    };

    return (
        <div className={styles.signupContainer}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Qeydiyyat</h2>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>Ad</label>
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
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Şifrəni Təsdiqləyin</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.button}>Qeydiyyatdan Keç</button>
                    <p className={styles.switchLink}>
                        Hesabınız var? <Link to="/login">Daxil olun</Link>
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

export default SignupPage;