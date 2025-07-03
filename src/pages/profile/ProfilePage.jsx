import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAuth, selectUser, logout } from '../../redux/reducers/userSlice'; 
import axios from 'axios';
import styles from './ProfilePage.module.css';
import { FaUser, FaLock, FaCamera, FaBoxOpen, FaTshirt, FaHeart, FaExclamationTriangle } from 'react-icons/fa';

const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
};

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
    const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Good', 'Strong'];
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

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const reduxUser = useSelector(selectUser); 
    const token = useSelector((state) => state.user.token);

    const [name, setName] = useState(reduxUser?.name || '');
    const [email, setEmail] = useState(reduxUser?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState(reduxUser?.avatar || '');
    
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [stats, setStats] = useState({ clothes: 0, outfits: 0, wishlist: 0 });
    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    useEffect(() => {
        if (reduxUser) {
            setName(reduxUser.name);
            setEmail(reduxUser.email);
            setAvatar(reduxUser.avatar);
        }

        const fetchStats = async () => {
            if (token) {
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
                    console.error("Error loading stats:", error);
                }
            }
        };
        fetchStats();
    }, [reduxUser, token]);

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
        } catch (error) {
            setMessage('Error uploading image.');
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

            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Server error');
        }
    };

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        handleUpdateProfile({ name, email });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordMessage('Passwords do not match!');
            return;
        }
        handleUpdateProfile({ password });
        setPasswordMessage('Password changed successfully!');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'delete') {
            alert('Please type "delete" correctly to confirm.');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete('http://localhost:5000/api/users/profile', config);
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            alert('An error occurred while deleting the account.');
        }
    };

    if (!reduxUser) return <div>Loading...</div>;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                    <img 
                        src={avatar ? getImageUrl(avatar) : `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=128`} 
                        alt="Profile picture" 
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
            </div>

            <div className={styles.statsPanel}>
                <div className={styles.statItem}>
                    <FaTshirt />
                    <span>{stats.clothes}</span>
                    <p>Clothes</p>
                </div>
                <div className={styles.statItem}>
                    <FaBoxOpen />
                    <span>{stats.outfits}</span>
                    <p>Outfits</p>
                </div>
                <div className={styles.statItem}>
                    <FaHeart />
                    <span>{stats.wishlist}</span>
                    <p>Wishlist</p>
                </div>
            </div>

            <div className={styles.formsGrid}>
                <form onSubmit={handleInfoSubmit} className={styles.profileForm}>
                    <h3><FaUser /> Update Information</h3>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" className={styles.submitButton}>Update</button>
                    {message && <p className={styles.message}>{message}</p>}
                </form>

                <form onSubmit={handlePasswordSubmit} className={styles.profileForm}>
                    <h3><FaLock /> Change Password</h3>
                    <div className={styles.formGroup}>
                        <label>New Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
                    </div>
                    <PasswordStrengthMeter password={password} />
                    <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                        <label>Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                    </div>
                    <button type="submit" className={styles.submitButton}>Change Password</button>
                    {passwordMessage && <p className={styles.message}>{passwordMessage}</p>}
                </form>
            </div>

            <div className={styles.dangerZone}>
                <h3>Danger Zone</h3>
                <p>This operation cannot be undone. All your data will be lost after deleting your account.</p>
                <button onClick={() => setDeleteModalOpen(true)} className={styles.deleteButton}>Delete Account</button>
            </div>

            {isDeleteModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <FaExclamationTriangle className={styles.modalIcon} />
                        <h2>Are you sure you want to delete your account?</h2>
                        <p>To confirm this operation, type "<b>delete</b>" in the field below.</p>
                        <input 
                            type="text" 
                            className={styles.modalInput}
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => setDeleteModalOpen(false)} className={styles.modalCancelButton}>Cancel</button>
                            <button onClick={handleDeleteAccount} className={styles.modalConfirmButton} disabled={deleteConfirmText !== 'delete'}>
                                Confirm, Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;