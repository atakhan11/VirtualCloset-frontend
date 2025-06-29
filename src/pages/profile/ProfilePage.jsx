import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAuth, selectUser, logout } from '../../redux/reducers/userSlice'; 
import axios from 'axios';
import styles from './ProfilePage.module.css';
import { FaUser, FaLock, FaCamera, FaBoxOpen, FaTshirt, FaHeart, FaSun, FaMoon, FaExclamationTriangle } from 'react-icons/fa';

// Universal şəkil URL-i funksiyası
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
};

// Şifrə gücünü yoxlayan komponent
const PasswordStrengthMeter = ({ password }) => {
    const getStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 8) score++;
        if (pass.match(/[a-z]/)) score++;
        if (pass.match(/[A-Z]/)) score++;
        if (pass.match(/[0-9]/)) score++;
        if (pass.match(/[^a-zA-Z0-9]/)) score++;
        return score;
    };

    const strength = getStrength(password);
    const strengthLabels = ['Çox Zəif', 'Zəif', 'Orta', 'Yaxşı', 'Güclü'];
    const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745'];

    return (
        <div className={styles.strengthMeter}>
            <div className={styles.strengthBar} style={{ width: `${(strength / 4) * 100}%`, backgroundColor: strengthColors[strength] }}></div>
            <span className={styles.strengthText} style={{ color: strengthColors[strength] }}>
                {password.length > 0 && strengthLabels[strength]}
            </span>
        </div>
    );
};

// Ana Profil Səhifəsi
const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser); 
    const token = useSelector((state) => state.user.token);

    // Form məlumatları
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Avatar
    const [avatar, setAvatar] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Statistika
    const [stats, setStats] = useState({ clothes: 0, outfits: 0, wishlist: 0 });
    
    // Mesajlar və Modal
    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Mövzu (Theme)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setAvatar(user.avatar);

            const fetchStats = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const [clothesRes, outfitsRes, wishlistRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/clothes', config),
                        axios.get('http://localhost:5000/api/outfits', config),
                        axios.get('http://localhost:5000/api/wishlist', config)
                    ]);
                    setStats({
                        clothes: clothesRes.data.length,
                        outfits: outfitsRes.data.length,
                        wishlist: wishlistRes.data.length,
                    });
                } catch (error) {
                    console.error("Statistika yüklənərkən xəta:", error);
                }
            };
            if (token) fetchStats();
        }
    }, [user, token]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setIsUploading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: uploadData } = await axios.post('http://localhost:5000/api/upload/remove-bg', formData, config);
            await handleUpdateProfile({ avatar: uploadData.imageUrl });
            setAvatar(uploadData.imageUrl);
        } catch (error) {
            setMessage('Şəkil yüklənərkən xəta baş verdi.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async (updateData) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('http://localhost:5000/api/users/profile', updateData, config);
            const { token: newToken, ...userData } = data;
            dispatch(setAuth({ user: userData, token: newToken })); 
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', newToken);
            setMessage('Profil uğurla yeniləndi!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Server xətası');
        }
    };

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        handleUpdateProfile({ name, email });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordMessage('Şifrələr uyğun gəlmir!');
            return;
        }
        handleUpdateProfile({ password });
        setPasswordMessage('Şifrə uğurla dəyişdirildi!');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'sil') {
            alert('Təsdiq üçün "sil" sözünü düzgün daxil edin.');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete('http://localhost:5000/api/users/profile', config);
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            alert('Hesab silinərkən xəta baş verdi.');
        }
    };

    if (!user) return <div>Yüklənir...</div>;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                    <img 
                        src={avatar ? getImageUrl(avatar) : `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=128`} 
                        alt="Profil şəkli" 
                        className={styles.avatar}
                    />
                    <button className={styles.avatarEditButton} onClick={() => fileInputRef.current.click()}>
                        <FaCamera />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleAvatarUpload}
                        accept="image/*"
                    />
                    {isUploading && <div className={styles.spinner}></div>}
                </div>
                <div className={styles.userInfo}>
                    <h1>{name}</h1>
                    <p>{email}</p>
                </div>
                <div className={styles.themeSwitcher}>
                    <FaSun />
                    <label className={styles.switch}>
                        <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
                        <span className={styles.slider}></span>
                    </label>
                    <FaMoon />
                </div>
            </div>

            <div className={styles.statsPanel}>
                <div className={styles.statItem}>
                    <FaTshirt />
                    <span>{stats.clothes}</span>
                    <p>Geyim</p>
                </div>
                <div className={styles.statItem}>
                    <FaBoxOpen />
                    <span>{stats.outfits}</span>
                    <p>Kombin</p>
                </div>
                <div className={styles.statItem}>
                    <FaHeart />
                    <span>{stats.wishlist}</span>
                    <p>Arzu</p>
                </div>
            </div>

            <div className={styles.formsGrid}>
                <form onSubmit={handleInfoSubmit} className={styles.profileForm}>
                    <h3><FaUser /> Məlumatları Yenilə</h3>
                    <div className={styles.formGroup}>
                        <label>Ad</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" className={styles.submitButton}>Yenilə</button>
                    {message && <p className={styles.message}>{message}</p>}
                </form>

                <form onSubmit={handlePasswordSubmit} className={styles.profileForm}>
                    <h3><FaLock /> Şifrəni Dəyiş</h3>
                    <div className={styles.formGroup}>
                        <label>Yeni Şifrə</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Yeni şifrəni daxil edin" />
                    </div>
                    {/* Şifrə gücü göstəricisi burada istifadə olunur */}
                    <PasswordStrengthMeter password={password} />
                    <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                        <label>Yeni Şifrə (Təkrar)</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Yeni şifrəni təsdiqləyin" />
                    </div>
                    <button type="submit" className={styles.submitButton}>Şifrəni Dəyiş</button>
                    {passwordMessage && <p className={styles.message}>{passwordMessage}</p>}
                </form>
            </div>

            <div className={styles.dangerZone}>
                <h3>Təhlükəli Zona</h3>
                <p>Bu əməliyyat geri qaytarıla bilməz. Hesabınızı sildikdən sonra bütün məlumatlarınız itəcək.</p>
                <button onClick={() => setDeleteModalOpen(true)} className={styles.deleteButton}>Hesabı Sil</button>
            </div>

            {isDeleteModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <FaExclamationTriangle className={styles.modalIcon} />
                        <h2>Hesabı Silməyə Əminsiniz?</h2>
                        <p>Bu əməliyyatı təsdiqləmək üçün aşağıdakı sahəyə "<b>sil</b>" yazın.</p>
                        <input 
                            type="text" 
                            className={styles.modalInput}
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => setDeleteModalOpen(false)} className={styles.modalCancelButton}>Ləğv Et</button>
                            <button onClick={handleDeleteAccount} className={styles.modalConfirmButton} disabled={deleteConfirmText !== 'sil'}>
                                Təsdiq Edirəm, Hesabı Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
