// src/components/Header/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../../redux/reducers/userSlice';

// YENİ: ThemeContext-dən useTheme hook-unu import edirik
import { useTheme } from '../../context/ThemeContext'; 

import styles from './Header.module.css';
import logo from '../../assets/StyleFolio.png';
import { FaBars, FaMoon, FaSignOutAlt, FaSun, FaTimes, FaUserEdit } from 'react-icons/fa';

// Universal şəkil URL-i funksiyası
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    // DƏYİŞİKLİK: Temanı artıq qlobal Context-dən götürürük
    const { theme, toggleTheme } = useTheme();

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

    // ARTIQ LAZIM DEYİL: Bu funksiya və state-lər ThemeContext-ə köçürüldü.
    // const [theme, setTheme] = useState('light');
    // const toggleTheme = () => { ... };
    // useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

    // Scroll hadisəsini izləyən useEffect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        // Dinamik klasslar həm mobil menyu, həm də sticky effekt üçün
        <nav className={`${styles.navbar} ${isSticky ? styles.isSticky : ''}`}>
            <div className={styles.navbarContainer}>
                <Link to={user ? "/dashboard" : "/"} className={styles.navbarLogo} onClick={closeMobileMenu}>
                    <img src={logo} alt="StyleFolio Logo" className={styles.logo} />
                </Link>

                <div className={styles.menuIcon} onClick={toggleMenu}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </div>
                
                <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
                    {/* ... Naviqasiya linkləriniz ... */}
                    {user ? (
                        <>
                            <li className={styles.navItem}><NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Ana Səhifə</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/dashboard" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>İdarə Paneli</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/my-wardrobe" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Qarderobum</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/outfit-planner" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Kombin Planlayıcı</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/calendar" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Təqvim</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/wishlist" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Arzu Siyahım</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/chat" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Chat</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/donate" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Dəstək Ol</NavLink></li>
                        </>
                    ) : (
                        <>
                            <li className={styles.navItem}><NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Ana Səhifə</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/features" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Xüsusiyyətlər</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/about" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Haqqımızda</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/contact" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Əlaqə</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/donate" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Dəstək Ol</NavLink></li>
                        </>
                    )}
                </ul>

                <div className={styles.navAuth}>
                    {user ? (
                        <div 
                            className={styles.profileDropdown} 
                            onMouseEnter={() => setIsDropdownOpen(true)} 
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <div className={styles.profileTrigger}>
                                <img
                                    src={user.avatar ? getImageUrl(user.avatar) : `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`}
                                    alt="Avatar"
                                    className={styles.avatar}
                                />
                                <span className={styles.profileName}>{user.name}</span>
                            </div>
                            <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.dropdownMenuActive : ''}`}>
                                <Link to="/profile"><FaUserEdit /> Profilə Bax</Link>
                                <div className={styles.menuItem} onClick={toggleTheme}>
                                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                                    <span>{theme === 'light' ? 'Qaranlıq Mod' : 'İşıqlı Mod'}</span>
                                </div>
                                <div className={styles.separator}></div>
                                <button onClick={handleLogout}><FaSignOutAlt /> Çıxış</button>
                            </div>
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