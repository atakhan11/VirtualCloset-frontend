import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import styles from './Footer.module.css';
import logo from '../../assets/StyleFolio.png'; // Verify your logo path

const Footer = () => {
    return (
        <footer className={styles.footerContainer}>
            <div className={styles.footerContent}>
                <div className={styles.footerAbout}>
                    <img src={logo} alt="StyleFolio Logo" className={styles.footerLogo} />
                    <p className={styles.footerDescription}>
                        Bring your style to the digital world. Discover your wardrobe, plan your outfits, and start each day with confidence.
                    </p>
                </div>

                <div className={styles.footerLinks}>
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/features">Features</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div className={styles.footerContact}>
                    <h4>Contact Us</h4>
                    <p>
                        Have questions or suggestions? Write to us!
                    </p>
                    <a href="mailto:info@stylefolio.app" className={styles.emailLink}>info@stylefolio.app</a>
                    
                    <h4 className={styles.socialHeader}>Follow Us</h4>
                    <div className={styles.socialIcons}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                    </div>
                </div>
            </div>

            <div className={styles.footerCopyright}>
                <p>&copy; {new Date().getFullYear()} StyleFolio. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
