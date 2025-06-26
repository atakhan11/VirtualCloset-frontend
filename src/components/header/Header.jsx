// src/components/Header/Header.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // useSelector əlavə edildi
import { logout, selectUser } from '../../redux/reducers/userSlice'; // selectUser əlavə edildi

import styles from './Header.module.css';
import logo from '../../assets/StyleFolio.png';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // İstifadəçi məlumatını birbaşa Redux-dan alırıq
    const user = useSelector(selectUser);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMobileMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        dispatch(logout());
        closeMobileMenu();
        navigate('/login'); // Çıxışdan sonra login səhifəsinə yönləndir
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContainer}>
                {/* DƏYİŞİKLİK: Loqonun linki artıq dinamikdir */}
                <Link to={user ? "/dashboard" : "/"} className={styles.navbarLogo} onClick={closeMobileMenu}>
                    <img src={logo} alt="StyleFolio Logo" />
                </Link>

                <div className={styles.menuIcon} onClick={toggleMenu}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </div>
                
                <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
                    {user ? (
                        <>
                            {/* DƏYİŞİKLİK: Daxil olmuş istifadəçi üçün "Home" linki artıq yoxdur */}
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
                                <Link to="/calendar" className={styles.navLinks} onClick={closeMobileMenu}>
                                    Təqvim
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <Link to="/wishlist" className={styles.navLinks} onClick={closeMobileMenu}>
                                    Wishlist
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <Link to="/chat" className={styles.navLinks} onClick={closeMobileMenu}>
                                    Chat
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                <Link to="/donate" className={styles.navLinks} onClick={closeMobileMenu}>
                    Dəstək Ol
                </Link>
            </li>
                        </>
                    ) : (
                        <>
                            {/* Qeydiyyatsız istifadəçi üçün "Home" linki qalır */}
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
                            <li className={styles.navItem}>
                                <Link to="/about" className={styles.navLinks} onClick={closeMobileMenu}>
                                    About
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <Link to="/contact" className={styles.navLinks} onClick={closeMobileMenu}>
                                    Contact
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                <Link to="/donate" className={styles.navLinks} onClick={closeMobileMenu}>
                    Dəstək Ol
                </Link>
            </li>
                        </>
                    )}
                </ul>

                <div className={styles.navAuth}>
                    {user ? (
                        <div className={styles.navProfile}>
                            <span>Welcome, {user.name}</span>
                            <Link to="/profile" className={styles.profileIconLink} title="My Profile" onClick={closeMobileMenu}>
                                <FaUserCircle className={styles.profileIcon} />
                            </Link>
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
