// src/components/Header/Header.jsx

import React, { useState } from 'react';
// DƏYİŞİKLİK: useNavigate-i import edirik
import { Link, useNavigate } from 'react-router-dom';
// DƏYİŞİKLİK: Redux üçün lazımi funksiyaları import edirik
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/reducers/userSlice'; // logout action-ının yolunu yoxlayın

import styles from './Header.module.css';
import logo from '../../assets/StyleFolio.png';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // DƏYİŞİKLİK: useDispatch və useNavigate hook-larını çağırırıq
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
    };

    // DƏYİŞİKLİK: Yeni logout funksiyası
    const handleLogout = () => {
        dispatch(logout());    // Redux state-ini və localStorage-ı təmizləyir
        closeMobileMenu();     // Mobil menyunu bağlayır
        navigate('/');    // Login səhifəsinə yönləndirir
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContainer}>
                <Link to="/" className={styles.navbarLogo} onClick={closeMobileMenu}>
                    <img src={logo} alt="StyleFolio Logo" />
                </Link>

                <div className={styles.menuIcon} onClick={toggleMenu}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </div>
                
                {/* Bu hissə olduğu kimi qalır */}
                <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
                    {user ? (
                        <>
                            <li className={styles.navItem}>
                                <Link to="/my-wardrobe" className={styles.navLinks} onClick={closeMobileMenu}>
                                    My Wardrobe
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <Link to="/outfit-planner" className={styles.navLinks} onClick={closeMobileMenu}>
                                    Outfit Planner
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <Link to="/wishlist" className={styles.navLinks} onClick={closeMobileMenu}>
                                    Wishlist
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className={styles.navItem}>
                                <Link to="/" className={styles.navLinks} onClick={closeMobileMenu}>
                                    Home
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <Link to="/features" className={styles.navLinks} onClick={closeMobileMenu}>
                                    Features
                                </Link>
                            </li>
                        </>
                    )}
                </ul>

                <div className={styles.navAuth}>
                    {user ? (
                        <div className={styles.navProfile}>
                            {/* DİQQƏT: user.username yerinə user.name istifadə etdim, çünki backend-dən belə gəlir */}
                            <span>Welcome, {user.name}</span>
                            
                            {/* DƏYİŞİKLİK: <Link> yerinə <button> və onClick hadisəsi */}
                            <button onClick={handleLogout} className={`${styles.btn} ${styles.btnSecondary}`}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`}>
                                Login
                            </Link>
                            <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;