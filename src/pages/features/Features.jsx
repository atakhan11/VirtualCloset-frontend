import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaLayerGroup, FaCalendarCheck, FaMagic, FaHeart, FaUserFriends, FaLock, FaMobileAlt } from 'react-icons/fa';
import './Features.css';

const FeatureDetailCard = ({ icon, title, children }) => (
    <div className="feature-detail-card">
        <div className="feature-detail-icon">{icon}</div>
        <div className="feature-detail-content">
            <h3>{title}</h3>
            <p>{children}</p>
        </div>
    </div>
);


const Features = () => {
    return (
        <div className="features-page-container">
            <header className="features-header">
                <h1>Tətbiqin Bütün İmkanları</h1>
                <p>StyleFolio-nun həyatınızı asanlaşdıracaq güclü alətlərini kəşf edin.</p>
            </header>

            <main className="features-main-content">
                <FeatureDetailCard icon={<FaBoxOpen />} title="Əhatəli Virtual Qarderob">
                    Bütün geyimlərinizi şəkilləri, kateqoriyaları, mövsümləri, rəngləri və hətta qeydlərinizlə birlikdə rəqəmsal olaraq saxlayın. Güclü axtarış və filterləmə sistemi ilə istədiyiniz geyimi saniyələr içində tapın.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaLayerGroup />} title="Limitsiz Kombin Yaratmaq">
                    Qarderobunuzdakı parçaları bir araya gətirərək hər bir vəziyyət – iş görüşü, gündəlik gəzinti və ya xüsusi bir tədbir üçün fərqli kombinlər hazırlayın və onları yadda saxlayın.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaCalendarCheck />} title="Ağıllı Təqvim Planlayıcısı">
                    Yaratdığınız kombinləri interaktiv təqvim üzərində günlərə təyin edin. Planlanmış kombinlərinizə baxın, tarixləri dəyişdirin və bir daha "bu gün nə geyinsəm?" stresi yaşamayın.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaMagic />} title="“Nə Geyinsəm?” Təklif Sistemi">
                    Qərarsız qaldığınız anlarda, bir düyməyə basaraq tətbiqin sizin üçün düşünməsini təmin edin. Ağıllı alqoritmimiz, hava proqnozuna və qarderobunuza əsaslanaraq sizə fərdi kombin təklifləri sunacaq.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaHeart />} title="Arzu Siyahısı (Wishlist)">
                    Almağı planlaşdırdığınız geyimləri qiyməti və mağaza linki ilə birlikdə bir siyahıda saxlayın. Aldıqdan sonra isə bir kliklə qarderobunuza köçürün.
                </FeatureDetailCard>
                
                 <FeatureDetailCard icon={<FaMobileAlt />} title="Mobil və Responsiv Dizayn">
                    StyleFolio, istər masaüstü kompüterdə, istər tabletdə, istərsə də mobil telefonda qüsursuz işləmək üçün hazırlanıb. Hətta geyimlərinizin şəklini birbaşa telefonunuzun kamerası ilə çəkib yükləyə bilərsiniz.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaLock />} title="Təhlükəsizlik və Məxfilik">
                    Bütün məlumatlarınız (istifadəçi məlumatları, geyimlər, kombinlər) təhlükəsiz şəkildə saxlanılır. Admin paneli ilə sistemin idarəetməsi tam nəzarət altındadır.
                </FeatureDetailCard>

                <div className="features-cta">
                    <h2>Hazırsınız?</h2>
                    <p>Stilinizi idarə etməyin yeni və ağıllı yolunu kəşf etmək üçün elə indi qeydiyyatdan keçin.</p>
                    <Link to="/register" className="cta-button-features">Pulsuz Hesab Yarat</Link>
                </div>
            </main>
        </div>
    );
};

export default Features;
