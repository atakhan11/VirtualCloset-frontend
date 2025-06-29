import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../../redux/reducers/userSlice';

import styles from './Header.module.css';
import logo from '../../assets/StyleFolio.png'; // Logo yolunu yoxlayın
import { FaBars, FaTimes } from 'react-icons/fa';

// Universal şəkil URL-i funksiyası
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMobileMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        dispatch(logout());
        closeMobileMenu();
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContainer}>
                <Link to={user ? "/dashboard" : "/"} className={styles.navbarLogo} onClick={closeMobileMenu}>
                    <img src={logo} alt="StyleFolio Logo" className={styles.logo} />
                </Link>

                <div className={styles.menuIcon} onClick={toggleMenu}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </div>
                
                <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
                    {user ? (
                        <>
                            {/* === DAXİL OLMUŞ İSTİFADƏÇİ ÜÇÜN YENİ LİNKLƏR === */}
                            <li className={styles.navItem}>
                                <NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Ana Səhifə</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to="/dashboard" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>İdarə Paneli</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to="/my-wardrobe" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Qarderobum</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to="/outfit-planner" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Kombin Planlayıcı</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to="/calendar" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Təqvim</NavLink>
                            </li>
                             <li className={styles.navItem}>
                                <NavLink to="/wishlist" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Arzu Siyahım</NavLink>
                            </li>
                             <li className={styles.navItem}>
                                <NavLink to="/chat" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Chat</NavLink>
                            </li>
                        </>
                    ) : (
                        <>
                            {/* Qeydiyyatsız istifadəçi üçün linklər */}
                            <li className={styles.navItem}>
                                <NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Ana Səhifə</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to="/features" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Xüsusiyyətlər</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to="/about" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Haqqımızda</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to="/contact" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Əlaqə</NavLink>
                            </li>
                        </>
                    )}
                    <li className={styles.navItem}>
                        <NavLink to="/donate" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Dəstək Ol</NavLink>
                    </li>
                </ul>

                <div className={styles.navAuth}>
                    {user ? (
                        <div className={styles.navProfile}>
                            <Link to="/profile" className={styles.profileLink} title="Profilim" onClick={closeMobileMenu}>
                                <img 
                                    src={user.avatar ? getImageUrl(user.avatar) : `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`} 
                                    alt="Avatar" 
                                    className={styles.avatar} 
                                />
                                <span className={styles.profileName}>{user.name}</span>
                            </Link>
                            <button onClick={handleLogout} className={`${styles.btn} ${styles.btnSecondary}`}>
                                Çıxış
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`}>Login</Link>
                            <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;
