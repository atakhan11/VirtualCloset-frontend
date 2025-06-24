import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import styles from './Footer.module.css';
import logo from '../../assets/StyleFolio.png'; // Loqonuzun yolunu yoxlayın

const Footer = () => {
    return (
        <footer className={styles.footerContainer}>
            <div className={styles.footerContent}>
                <div className={styles.footerAbout}>
                    <img src={logo} alt="StyleFolio Logo" className={styles.footerLogo} />
                    <p className={styles.footerDescription}>
                        Stilinizi rəqəmsal dünyaya daşıyın. Qarderobunuzu kəşf edin, kombinlərinizi planlaşdırın və hər günə əminliklə başlayın.
                    </p>
                </div>

                <div className={styles.footerLinks}>
                    <h4>Sürətli Keçidlər</h4>
                    <ul>
                        <li><Link to="/about">Haqqımızda</Link></li>
                        <li><Link to="/features">Xüsusiyyətlər</Link></li>
                        <li><Link to="/contact">Əlaqə</Link></li>
                        <li><Link to="/privacy-policy">Məxfilik Siyasəti</Link></li>
                    </ul>
                </div>

                {/* DƏYİŞİKLİK: Abunəlik forması bu yeni blokla əvəz edildi */}
                <div className={styles.footerContact}>
                    <h4>Bizimlə Əlaqə</h4>
                    <p>
                        Suallarınız və ya təklifləriniz var? Bizə yazın!
                    </p>
                    <a href="mailto:info@stylefolio.app" className={styles.emailLink}>info@stylefolio.app</a>
                    
                    <h4 className={styles.socialHeader}>Bizi İzləyin</h4>
                    <div className={styles.socialIcons}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                    </div>
                </div>
            </div>

            <div className={styles.footerCopyright}>
                <p>&copy; {new Date().getFullYear()} StyleFolio. Bütün hüquqlar qorunur.</p>
            </div>
        </footer>
    );
};

export default Footer;
