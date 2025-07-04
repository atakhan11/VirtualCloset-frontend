// src/components/Header/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../../redux/reducers/userSlice';

import { useTheme } from '../../context/ThemeContext'; 

import styles from './Header.module.css';
import logo from '../../assets/StyleFolio.png';
import { FaBars, FaMoon, FaSignOutAlt, FaSun, FaTimes, FaUserEdit } from 'react-icons/fa';

const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

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

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('nav-open');
        } else {
            document.body.classList.remove('nav-open');
        }
        return () => {
            document.body.classList.remove('nav-open');
        };
    }, [isMenuOpen]);


    return (
        <nav className={`${styles.navbar} ${isSticky ? styles.isSticky : ''}`}>
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
                            {/* Giriş etmiş istifadəçi üçün linklər */}
                            <li className={styles.navItem}><NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Home</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/dashboard" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Dashboard</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/my-wardrobe" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>My Wardrobe</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/outfit-creator" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Outfit Creator</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/calendar" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Calendar</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/wishlist" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Wishlist</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/chat" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Chat</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/donate" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Donate</NavLink></li>
                            
                            {/* ==================== MOBİL ÜÇÜN PROFİL VƏ ƏMƏLİYYATLAR BÖLMƏSİ ==================== */}
                            <div className={styles.navMobileActions}>
                                <div className={styles.separator} />
                                <Link to="/profile" className={styles.mobileMenuItem} onClick={closeMobileMenu}>
                                    <FaUserEdit />
                                    <span>View Profile</span>
                                </Link>
                                <div className={styles.mobileMenuItem} onClick={() => { toggleTheme(); closeMobileMenu(); }}>
                                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                                </div>
                                <button className={styles.mobileMenuItem} onClick={handleLogout}>
                                    <FaSignOutAlt />
                                    <span>Logout</span>
                                </button>
                            </div>
                            
                        </>
                    ) : (
                        <>
                            {/* Qonaq üçün linklər */}
                            <li className={styles.navItem}><NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Home</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/features" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Features</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/about" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>About Us</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/contact" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Contact</NavLink></li>
                            <li className={styles.navItem}><NavLink to="/donate" className={({isActive}) => isActive ? styles.activeLink : styles.navLinks} onClick={closeMobileMenu}>Donate</NavLink></li>
                            <div className={styles.navMobileAuth}>
                                <Link to="/login" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeMobileMenu}>Login</Link>
                                <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`} onClick={closeMobileMenu}>Sign Up</Link>
                            </div>
                        </>
                    )}
                </ul>

                <div className={styles.navAuth}>
                    {user ? (
                        <div 
                            className={styles.profileDropdown} 
                            onMouseEnter={() => setIsDropdownOpen(true)} 
                            onMouseLeave={() => setIsDropdownOpen(false)}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                                <Link to="/profile"><FaUserEdit /> View Profile</Link>
                                <div className={styles.menuItem} onClick={toggleTheme}>
                                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                                </div>
                                <div className={styles.separator}></div>
                                <button onClick={handleLogout}><FaSignOutAlt /> Logout</button>
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