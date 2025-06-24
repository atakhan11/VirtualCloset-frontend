import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaLayerGroup, FaCalendarCheck, FaMagic, FaHeart, FaUserFriends, FaRocket } from 'react-icons/fa';
import './HomePage.css';

// Təqdimat üçün müvəqqəti şəkillər.
// Bu şəkilləri öz layihənizə uyğun real şəkillərlə əvəz edə bilərsiniz.
const heroImageUrl = "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
const communityImageUrl1 = "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600";
const communityImageUrl2 = "https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=600";
const communityImageUrl3 = "https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=600";
const avatar1Url = "https://randomuser.me/api/portraits/women/44.jpg";
const avatar2Url = "https://randomuser.me/api/portraits/men/32.jpg";


const HomePage = () => {
    return (
        <div className="home-container">
            {/* === ƏSAS QARŞILAMA BÖLMƏSİ (HERO) === */}
            <header className="hero-section-enhanced">
                <div className="hero-content-enhanced">
                    <h1 className="hero-title">Qarderobunuzdakı Xəzinəni Kəşf Edin.</h1>
                    <p className="hero-subtitle">
                        StyleFolio ilə artıq "nə geyinsəm?" deyə düşünməyin. Mövcud geyimlərinizdən limitsiz kombinlər yaradın, stilinizi planlaşdırın və hər günə əminliklə başlayın.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="cta-button-primary">Pulsuz Başlayın</Link>
                        <Link to="/features" className="cta-button-secondary">Daha Ətraflı</Link>
                    </div>
                </div>
                <div className="hero-image-enhanced">
                    <img src={heroImageUrl} alt="Stilini kəşf edən insan" />
                </div>
            </header>

            {/* === ƏSAS XÜSUSİYYƏTLƏR BÖLMƏSİ === */}
            <section className="features-section-enhanced">
                <div className="section-title">
                    <span>NƏ TƏKLİF EDİRİK?</span>
                    <h2>Sizin Fərdi Stil Köməkçiniz</h2>
                </div>
                <div className="features-grid-enhanced">
                    <div className="feature-card-enhanced">
                        <FaBoxOpen className="feature-icon-enhanced" />
                        <h3>Virtual Qarderob</h3>
                        <p>Bütün geyimlərinizi bir yerə toplayın, kategoriyalara ayırın və axtarışla saniyələr içində tapın.</p>
                    </div>
                     <div className="feature-card-enhanced">
                        <FaLayerGroup className="feature-icon-enhanced" />
                        <h3>Kombin Planlayıcı</h3>
                        <p>Qarderobunuzdakı geyimlərdən fərqli vəziyyətlər üçün limitsiz sayda kombinlər hazırlayın.</p>
                    </div>
                    <div className="feature-card-enhanced">
                        <FaCalendarCheck className="feature-icon-enhanced" />
                        <h3>Təqvim İnteqrasiyası</h3>
                        <p>Yaratdığınız kombinləri təqvim üzərində günlərə təyin edərək həftənizi öncədən planlaşdırın.</p>
                    </div>
                    <div className="feature-card-enhanced">
                        <FaMagic className="feature-icon-enhanced" />
                        <h3>Ağıllı Təkliflər</h3>
                        <p>Hava durumuna və qarderobunuza əsaslanaraq "Bu gün nə geyinsəm?" sualına cavab alın.</p>
                    </div>
                     <div className="feature-card-enhanced">
                        <FaHeart className="feature-icon-enhanced" />
                        <h3>Arzu Siyahısı</h3>
                        <p>Almaq istədiyiniz məhsulları bir siyahıda saxlayın və alış-verişinizi daha planlı edin.</p>
                    </div>
                     <div className="feature-card-enhanced">
                        <FaUserFriends className="feature-icon-enhanced" />
                        <h3>Admin Paneli</h3>
                        <p>İstifadəçiləri və bütün sistemi asanlıqla idarə etmək üçün güclü idarəetmə paneli.</p>
                    </div>
                </div>
            </section>

             {/* === İLHAM ÜÇÜN BÖLMƏ === */}
            <section className="inspiration-section">
                <div className="section-title">
                    <span>İSTİFADƏÇİ KOMBİNLƏRİ</span>
                    <h2>İlham Alın</h2>
                </div>
                <div className="inspiration-grid">
                    <div className="inspiration-card"><img src={communityImageUrl1} alt="Kombin 1" /></div>
                    <div className="inspiration-card"><img src={communityImageUrl2} alt="Kombin 2" /></div>
                    <div className="inspiration-card"><img src={communityImageUrl3} alt="Kombin 3" /></div>
                </div>
            </section>

            {/* === İSTİFADƏÇİ RƏYLƏRİ BÖLMƏSİ === */}
            <section className="testimonials-section-enhanced">
                 <div className="section-title">
                    <span>XOŞBƏXT İSTİFADƏÇİLƏR</span>
                    <h2>Bizim Haqqımızda Nə Deyirlər?</h2>
                </div>
                <div className="testimonials-grid-enhanced">
                    <div className="testimonial-card-enhanced">
                        <img src={avatar1Url} alt="Aygün K." className="testimonial-avatar" />
                        <blockquote>
                            “StyleFolio həyatımı dəyişdi! Artıq səhərlər saatlarla "nə geyinsəm?" deyə düşünmürəm. Hər şey bir kliklə əlimin altındadır.”
                        </blockquote>
                        <cite>Aygün K. - Marketinq Meneceri</cite>
                    </div>
                    <div className="testimonial-card-enhanced">
                        <img src={avatar2Url} alt="Elvin S." className="testimonial-avatar" />
                        <blockquote>
                            “Qarderobumda nə qədər geyim olduğunu və onlardan necə fərqli istifadə edə biləcəyimi bu tətbiq sayəsində anladım. Hər kəsə tövsiyə edirəm!”
                        </blockquote>
                        <cite>Elvin S. - Proqram Tərtibatçısı</cite>
                    </div>
                </div>
            </section>

             {/* === SON ÇAĞIRIŞ BÖLMƏSİ (FINAL CTA) === */}
            <section className="final-cta-section-enhanced">
                <h2>Stilinizi Yenidən Kəşf Etməyə Hazırsınız?</h2>
                <p>Qarderobunuzun bütün potensialını üzə çıxarın və hər gününüzü daha planlı yaşayın.</p>
                <Link to="/register" className="cta-button-final">
                    <FaRocket /> Bəli, Stil Səyahətimə Başlayıram!
                </Link>
            </section>
        </div>
    );
};

export default HomePage;
