import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/reducers/userSlice';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaTshirt, FaCalendarAlt, FaShoppingBag, FaMagic, FaSyncAlt, FaCalendarPlus } from 'react-icons/fa';
import WeatherWidget from '../../components/weatherwidget/WeatherWidget';
import './DashboardPage.css';

// =======================================================
// YARDIMÇI FUNKSİYA: Universal Şəkil URL-i (ƏSAS HƏLL)
// =======================================================
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('blob')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

// =======================================================
// WIDGET KOMPONENTLƏRİ (Düzəlişlərlə)
// =======================================================

const TodaysOutfit = ({ outfits }) => {
    const today = new Date().toDateString();
    const todaysOutfit = outfits.find(o => o.isPlanned && new Date(o.plannedDate).toDateString() === today);

    if (!todaysOutfit) {
        return (
            <div className="dashboard-widget">
                <h3>Bu Günün Kombini</h3>
                <div className="empty-widget">
                    <p>Bu gün üçün heç bir kombin planlanmayıb.</p>
                    <Link to="/calendar" className="widget-link">Təqvimə Keç</Link>
                </div>
            </div>
        );
    }
    return (
        <div className="dashboard-widget">
            <h3>Bu Günün Kombini: {todaysOutfit.name}</h3>
            <div className="todays-outfit-images">
                {todaysOutfit.items.map(item => (
                    // DƏYİŞİKLİK: getImageUrl istifadə olunur
                    item && <img key={item._id} src={getImageUrl(item.image)} alt={item.name} />
                ))}
            </div>
        </div>
    );
};

const WishlistReminder = ({ wishlist }) => {
    if (wishlist.length === 0) return null;
    const randomItem = wishlist[Math.floor(Math.random() * wishlist.length)];

    return (
        <div className="dashboard-widget">
            <h3>Arzu Siyahısından Xatırlatma</h3>
             <div className="wishlist-reminder-item">
                {/* DƏYİŞİKLİK: getImageUrl istifadə olunur */}
                {randomItem.image && <img src={getImageUrl(randomItem.image)} alt={randomItem.name} />}
                <div className="wishlist-reminder-info">
                   <p>{randomItem.name}</p>
                   <Link to="/wishlist" className="widget-link">Siyahıya Bax</Link>
                </div>
             </div>
        </div>
    );
};

const SuggestionModal = ({ isOpen, onClose, suggestion, onRegenerate, onPlan }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content suggestion-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Bu Gün Üçün Təklifimiz</h2>
                {suggestion.length > 0 ? (
                    <>
                        <div className="suggestion-images-large">
                            {suggestion.map(item => (
                                item && <div key={item._id} className="suggestion-item">
                                    {/* DƏYİŞİKLİK: getImageUrl istifadə olunur */}
                                    <img src={getImageUrl(item.image)} alt={item.name} />
                                    <p>{item.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions suggestion-actions">
                            <button onClick={onRegenerate} className="btn-secondary">
                                <FaSyncAlt /> Başqa Təklif
                            </button>
                            <button onClick={() => onPlan(suggestion)} className="btn-primary">
                                <FaCalendarPlus /> Bəyəndim, Planla!
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-suggestion">
                        <p>Təəssüf ki, hava durumuna və qarderobunuza uyğun bir kombin tapılmadı.</p>
                        <p>Zəhmət olmasa, fərqli mövsümlər üçün daha çox geyim əlavə edin.</p>
                    </div>
                )}
                 <button onClick={onClose} className="close-modal-btn">&times;</button>
            </div>
        </div>
    );
};

// =======================================================
// ƏSAS DASHBOARD KOMPONENTİ
// =======================================================
const DashboardPage = () => {
    const user = useSelector(selectUser);
    const navigate = useNavigate();
    const [data, setData] = useState({ outfits: [], clothes: [], wishlist: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [weatherData, setWeatherData] = useState(null);
    const [isSuggestionModalOpen, setSuggestionModalOpen] = useState(false);
    const [suggestedOutfit, setSuggestedOutfit] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Zəhmət olmasa, sistemə daxil olun.");
                    setLoading(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [outfitsRes, clothesRes, wishlistRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/outfits', config),
                    axios.get('http://localhost:5000/api/clothes', config),
                    axios.get('http://localhost:5000/api/wishlist', config)
                ]);

                setData({
                    outfits: outfitsRes.data,
                    clothes: clothesRes.data,
                    wishlist: wishlistRes.data
                });
            } catch (err) {
                setError("Məlumatlar yüklənərkən xəta baş verdi.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleGenerateSuggestion = () => {
        if (!weatherData || data.clothes.length < 2) {
            alert("Ağıllı təklif üçün kifayət qədər geyim və ya hava məlumatı yoxdur.");
            return;
        }

        const temp = weatherData.main.temp;
        let targetSeason;

        if (temp > 20) targetSeason = ['Yay', 'Yaz'];
        else if (temp > 12) targetSeason = ['Payız', 'Yaz'];
        else targetSeason = ['Qış', 'Payız'];

        const topKeywords = ['köynək', 'polo', 'svitşot', 'swea', 'hudi', 'sviter', 'cemper', 'gödəkçə', 'palto', 'pencək', 'blazer', 'kostyum'];
        const bottomKeywords = ['şalvar', 'cins', 'şort'];
        const shoesKeywords = ['ayaqqabı'];

        const categoryMatches = (category, keywords) => {
            if (!category) return false;
            const lowerCaseCategory = category.toLowerCase();
            return keywords.some(keyword => lowerCaseCategory.includes(keyword));
        };

        const suitableClothes = data.clothes.filter(c => 
            c.season && (targetSeason.includes(c.season) || c.season === 'Mövsümsüz')
        );
        
        const tops = suitableClothes.filter(c => categoryMatches(c.category, topKeywords));
        const bottoms = suitableClothes.filter(c => categoryMatches(c.category, bottomKeywords));
        const shoes = suitableClothes.filter(c => categoryMatches(c.category, shoesKeywords));
        
        if (tops.length === 0 || bottoms.length === 0) {
            setSuggestedOutfit([]);
        } else {
            const randomTop = tops[Math.floor(Math.random() * tops.length)];
            const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
            const randomShoes = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : null;
            
            setSuggestedOutfit([randomTop, randomBottom, randomShoes].filter(Boolean)); 
        }
        
        setSuggestionModalOpen(true);
    };

    const handlePlanSuggestedOutfit = async (suggestion) => {
        if (!suggestion || suggestion.length === 0) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const outfitName = `Günün Təklifi (${new Date().toLocaleDateString()})`;
            
            const outfitData = { name: outfitName, items: suggestion.map(item => item._id) };
            
            const { data: createdOutfit } = await axios.post('http://localhost:5000/api/outfits', outfitData, config);
            await axios.put(`http://localhost:5000/api/outfits/${createdOutfit._id}/plan`, { date: new Date() }, config);

            alert(`"${outfitName}" kombini yaradıldı və bu gün üçün planlandı!`);
            setSuggestionModalOpen(false);
            navigate('/calendar');
        } catch (error) {
            alert("Təklifi planlaşdırarkən xəta baş verdi.");
        }
    };

    if (loading) return <p className="page-status">Yüklənir...</p>;
    if (error) return <p className="page-status error">{error}</p>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-greeting">
                <h1>Xoş Gəldin, {user?.name}!</h1>
                <p>Bu gün üçün planların necədir?</p>
            </div>

            <div className="suggestion-banner">
                <button onClick={handleGenerateSuggestion} className="suggestion-button">
                    <FaMagic /> Bu Gün Nə Geyinsəm?
                </button>
            </div>

            <div className="quick-actions">
                <Link to="/my-wardrobe" className="action-card"> <FaTshirt /> <span>Mənim Qarderobum</span></Link>
                <Link to="/outfit-planner" className="action-card"> <FaPlus /> <span>Yeni Kombin Yarat</span></Link>
                <Link to="/calendar" className="action-card"> <FaCalendarAlt /> <span>Təqvimə Bax</span></Link>
                <Link to="/wishlist" className="action-card"> <FaShoppingBag /> <span>Arzu Siyahım</span></Link>
            </div>

            <div className="dashboard-grid">
                <WeatherWidget onWeatherLoad={setWeatherData} />
                <TodaysOutfit outfits={data.outfits} />
                <WishlistReminder wishlist={data.wishlist} />
            </div>
            
            <SuggestionModal 
                isOpen={isSuggestionModalOpen}
                onClose={() => setSuggestionModalOpen(false)}
                suggestion={suggestedOutfit}
                onRegenerate={handleGenerateSuggestion}
                onPlan={handlePlanSuggestedOutfit}
            />
        </div>
    );
};

export default DashboardPage;
