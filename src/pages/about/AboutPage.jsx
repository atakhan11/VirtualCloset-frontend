import React from 'react';
import { Link } from 'react-router-dom';
import { FaBullseye, FaLightbulb, FaHeart, FaUsers } from 'react-icons/fa';
import './About.css';

// Təqdimat üçün müvəqqəti şəkil. Bunu öz şəklinizlə əvəz edin.
const yourImageUrl = "https://via.placeholder.com/300"; // Nümunə şəkil

const AboutPage = () => {
    return (
        <div className="about-container">
            {/* === SƏHİFƏ BAŞLIĞI === */}
            <header className="about-hero">
                <div className="about-hero-content">
                    <h1>Bizim Hekayəmiz</h1>
                    <p>Stilin sadəcə geyim deyil, bir ifadə tərzi olduğuna inanırıq.</p>
                </div>
            </header>

            {/* === MƏQSƏDİMİZ BÖLMƏSİ === */}
            <section className="mission-section">
                <div className="mission-content">
                    <span className="section-subtitle">Məqsədimiz</span>
                    <h2>Qarderobunuzla Barışıq Yaradın</h2>
                    <p>
                        StyleFolio, "Nə geyinsəm?" sualının yaratdığı gündəlik stressi aradan qaldırmaq üçün doğuldu. Əsas hədəfimiz, insanların mövcud geyimlərinin potensialını tam olaraq kəşf etmələrinə kömək etmək, israfçılığın qarşısını almaq və hər kəsin özünəməxsus stilini inamla ifadə etməsini təmin etməkdir. Biz inanırıq ki, doğru alətlərlə hər qarderob bir xəzinəyə çevrilə bilər.
                    </p>
                </div>
                <div className="mission-image">
                    <img src="https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Səliqəli qarderob" />
                </div>
            </section>
            
            {/* === DƏYƏRLƏRİMİZ BÖLMƏSİ === */}
            <section className="values-section">
                 <div className="section-title">
                    <span>PRİNSİPLƏRİMİZ</span>
                    <h2>Bizi İrəli Aparan Dəyərlər</h2>
                </div>
                <div className="values-grid">
                    <div className="value-card">
                        <FaLightbulb className="value-icon" />
                        <h3>Kreativlik</h3>
                        <p>İstifadəçilərimizi mövcud parçalardan yeni və həyəcanverici kombinlər yaratmağa təşviq edirik.</p>
                    </div>
                    <div className="value-card">
                        <FaBullseye className="value-icon" />
                        <h3>Şüurluluq</h3>
                        <p>Nəyə sahib olduğunuzu bilmək, daha az və daha məqsədyönlü alış-veriş etməyə kömək edir.</p>
                    </div>
                    <div className="value-card">
                        <FaHeart className="value-icon" />
                        <h3>Özgüvən</h3>
                        <p>Stilinizi öncədən planlaşdıraraq hər günə daha inamlı və hazır başlamağınızı hədəfləyirik.</p>
                    </div>
                     <div className="value-card">
                        <FaUsers className="value-icon" />
                        <h3>Cəmiyyət</h3>
                        <p>İstifadəçilərin bir-birindən ilham aldığı, dəstəkləyici və yaradıcı bir icma qururuq.</p>
                    </div>
                </div>
            </section>

            {/* === KOMANDA (YARADICI) BÖLMƏSİ === */}
            <section className="team-section">
                <div className="section-title">
                    <span>LAYİHƏNİN RƏHBƏRİ</span>
                    <h2>Bu Fikrin Arxasındakı Siması</h2>
                </div>
                <div className="team-member-card">
                    <img src={yourImageUrl} alt="Layihə rəhbəri" className="team-member-avatar" />
                    <h3>Sizin Adınız Soyadınız</h3>
                    <span>Proqram Tərtibatçısı / Stil Entuziastı</span>
                    <p className="team-member-bio">
                        Buraya özünüz haqqında 1-2 cümləlik məlumat yaza bilərsiniz. Məsələn: "Texnologiya və modaya olan həvəsimi birləşdirərək insanların gündəlik həyatını asanlaşdıran bu layihəni ərsəyə gətirdim."
                    </p>
                </div>
            </section>

             {/* === SON ÇAĞIRIŞ BÖLMƏSİ (FINAL CTA) === */}
            <section className="about-final-cta">
                <h2>Stil İnqilabına Qoşulun</h2>
                <p>Qarderobunuzu yenidən kəşf etməyə və stilinizi növbəti səviyyəyə daşımağa hazırsınızsa, bizə qoşulun.</p>
                <Link to="/register" className="cta-button-primary-about">İndi Başla</Link>
            </section>
        </div>
    );
};

export default AboutPage;