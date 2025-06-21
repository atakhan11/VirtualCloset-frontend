import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css'; // Stil faylını import edirik
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/reducers/userSlice';

const ProfilePage = () => {
    // Form məlumatları üçün state-lər
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const dispatch = useDispatch();
    // Yüklənmə və mesajlar üçün state-lər
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // Komponent yüklənəndə istifadəçi məlumatlarını gətiririk
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                     setMessage({ type: 'error', text: 'Zəhmət olmasa, sistemə daxil olun.' });
                     setLoading(false);
                     return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
                
                setName(data.name);
                setEmail(data.email);

            } catch (error) {
                const errorText = error.response?.data?.message || 'Profil məlumatlarını yükləmək mümkün olmadı.';
                setMessage({ type: 'error', text: errorText });
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    // Ad və email-i yeniləyən funksiya
const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Backend-ə sorğu göndəririk
            const { data } = await axios.put('http://localhost:5000/api/users/profile', { name, email }, config);
            
            // DƏYİŞİKLİK: Backend-dən gələn YENİ məlumatlarla Redux state-ini yeniləyirik
            // Backend cavabı { _id, name, email, role, token } formatındadır
            // Biz bunu user və token olaraq qruplaşdırırıq
            const payload = {
                user: { id: data._id, name: data.name, email: data.email, role: data.role },
                token: data.token
            };
            dispatch(setCredentials(payload));
            
            setMessage({ type: 'success', text: 'Profil uğurla yeniləndi!' });

        } catch (error) {
            const errorText = error.response?.data?.message || 'Yeniləmə zamanı xəta baş verdi.';
            setMessage({ type: 'error', text: errorText });
        }
    };

    // Şifrəni dəyişən funksiya
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Yeni şifrələr eyni deyil!' });
            return;
        }
        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Şifrə ən az 6 simvoldan ibarət olmalıdır.'});
            return;
        }
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('http://localhost:5000/api/users/profile', { password }, config);
            
             if (data.token) {
                localStorage.setItem('token', data.token);
            }
            setMessage({ type: 'success', text: 'Şifrə uğurla dəyişdirildi!' });
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
             const errorText = error.response?.data?.message || 'Şifrə dəyişdirilərkən xəta baş verdi.';
            setMessage({ type: 'error', text: errorText });
        }
    };

    if (loading) return <p>Yüklənir...</p>;

    return (
        <div className="profile-container">
            <h1>Mənim Profilim</h1>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-forms-wrapper">
                <form onSubmit={handleProfileUpdate} className="profile-form">
                    <h2>Məlumatları Yenilə</h2>
                    <div className="form-group">
                        <label htmlFor="name">Ad</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary">Yenilə</button>
                </form>

                <form onSubmit={handlePasswordChange} className="profile-form">
                    <h2>Şifrəni Dəyiş</h2>
                    <div className="form-group">
                        <label htmlFor="password">Yeni Şifrə</label>
                        <input id="password" type="password" placeholder="Yeni şifrəni daxil edin" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Yeni Şifrə (Təkrar)</label>
                        <input id="confirmPassword" type="password" placeholder="Yeni şifrəni təsdiqləyin" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-secondary">Şifrəni Dəyiş</button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
