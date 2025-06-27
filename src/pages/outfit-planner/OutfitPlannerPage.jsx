import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import './OutfitPlannerPage.css';
import { Link } from 'react-router-dom';

// =======================================================
// YARDIMÇI FUNKSİYA: Universal Şəkil URL-i
// Bu funksiya həm köhnə (lokal), həm də yeni (Cloudinary) şəkilləri düzgün göstərəcək.
// =======================================================
const getImageUrl = (imagePath) => {
    // Əgər imagePath yoxdursa və ya boşdursa, boş string qaytar
    if (!imagePath) {
        return ''; 
    }
    
    // Əgər imagePath tam bir URL-dirsə (http ilə başlayırsa),
    // ona toxunmadan olduğu kimi qaytar.
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Əks halda, bu lokal bir yoldur, ona görə də serverin ünvanını əlavə et.
    return `http://localhost:5000${imagePath}`;
};


const OutfitPlannerPage = () => {
    // Bütün geyimləri və kombinləri saxlamaq üçün state-lər
    const [allClothes, setAllClothes] = useState([]);
    const [allOutfits, setAllOutfits] = useState([]);

    // Hazırkı kombini qurmaq üçün state-lər
    const [currentOutfitItems, setCurrentOutfitItems] = useState([]);
    const [outfitName, setOutfitName] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Səhifə yüklənəndə həm geyimləri, həm də kombinləri yükləyirik
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Eyni anda iki sorğu göndəririk
            const [clothesRes, outfitsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/clothes', config),
                axios.get('http://localhost:5000/api/outfits', config)
            ]);

            setAllClothes(clothesRes.data);
            setAllOutfits(outfitsRes.data);

        } catch (err) {
            setError('Məlumatları yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Geyimi kombine əlavə etmək funksiyası
    const addToOutfit = (cloth) => {
        // Əgər geyim artıq seçilibsə, heç nə etmə
        if (currentOutfitItems.find(item => item._id === cloth._id)) {
            return;
        }
        setCurrentOutfitItems([...currentOutfitItems, cloth]);
    };

    // Geyimi kombindən çıxarmaq funksiyası
    const removeFromOutfit = (clothId) => {
        setCurrentOutfitItems(currentOutfitItems.filter(item => item._id !== clothId));
    };

    // Kombini yadda saxlamaq funksiyası
    const handleSaveOutfit = async () => {
        if (!outfitName.trim()) {
            return alert('Zəhmət olmasa, kombinə bir ad verin.');
        }
        if (currentOutfitItems.length < 2) {
            return alert('Kombin yaratmaq üçün ən azı 2 geyim seçin.');
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const outfitData = {
                name: outfitName,
                items: currentOutfitItems.map(item => item._id) // Yalnız geyim ID-lərini göndəririk
            };
            
            await axios.post('http://localhost:5000/api/outfits', outfitData, config);

            alert('Kombin uğurla yaradıldı!');
            setOutfitName('');
            setCurrentOutfitItems([]);
            await fetchData(); // Siyahını yeniləyirik

        } catch (err) {
            alert('Kombin yaradılarkən xəta baş verdi.');
        }
    };
    
    // Mövcud kombini silmək funksiyası
    const handleDeleteOutfit = async (outfitId) => {
        if (window.confirm('Bu kombini silməyə əminsinizmi?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/outfits/${outfitId}`, config);
                await fetchData();
            } catch (err) {
                alert('Kombin silinərkən xəta baş verdi.');
            }
        }
    };

    if (loading) return <p>Yüklənir...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="planner-container">
            <h1>Kombin Planlayıcı</h1>
            <div className="planner-layout">
                {/* Sol Panel: Bütün Geyimlərin Siyahısı */}
                <div className="all-clothes-panel">
                    <h3>Qarderobunuzdakı Geyimlər</h3>
                    <div className="clothes-list">
                        {allClothes.map(cloth => (
                            <div key={cloth._id} className="cloth-item-small" onClick={() => addToOutfit(cloth)}>
                                {/* DƏYİŞİKLİK 1: getImageUrl istifadə olunur */}
                                <img src={getImageUrl(cloth.image)} alt={cloth.name} />
                                <div className="add-overlay">
                                    <FaPlus />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sağ Panel: Kombin Qurucu */}
                <div className="outfit-builder-panel">
                    <h3>Yeni Kombin Hazırla</h3>
                    <div className="outfit-builder-content">
                        <div className="outfit-drop-zone">
                            {currentOutfitItems.length > 0 ? (
                                currentOutfitItems.map(item => (
                                    <div key={item._id} className="outfit-item">
                                        {/* DƏYİŞİKLİK 2: getImageUrl istifadə olunur */}
                                        <img src={getImageUrl(item.image)} alt={item.name} />
                                        <button onClick={() => removeFromOutfit(item._id)} className="remove-item-btn"><FaTimes /></button>
                                    </div>
                                ))
                            ) : (
                                <p>Geyimləri buraya əlavə edin</p>
                            )}
                        </div>
                        <div className="outfit-actions">
                            <input 
                                type="text"
                                placeholder="Kombinə ad verin..."
                                value={outfitName}
                                onChange={(e) => setOutfitName(e.target.value)}
                                className="outfit-name-input"
                            />
                            <button onClick={handleSaveOutfit} className="save-outfit-btn">Yadda Saxla</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mövcud Kombinlərin Siyahısı */}
            <div className="saved-outfits-section">
                <h2>Yaratdığınız Kombinlər</h2>
                {allOutfits.length > 0 ? (
                    <div className="outfits-grid">
                        {allOutfits.map(outfit => (
                                <Link to={`/outfits/${outfit._id}`} key={outfit._id} className="outfit-card-link">
            <div className="outfit-card">
                <h4>{outfit.name}</h4>
                <div className="outfit-card-images">
                    {outfit.items.slice(0, 4).map(item => ( // Yalnız ilk 4 şəkli göstərək
                        /* DƏYİŞİKLİK 3: getImageUrl istifadə olunur */
                        <img key={item._id} src={getImageUrl(item.image)} alt={item.name} />
                    ))}
                </div>
                <button className="delete-outfit-btn" onClick={(e) => { e.preventDefault(); handleDeleteOutfit(outfit._id); }}><FaTrash /></button>
            </div>
        </Link>
                        ))}
                    </div>
                ) : (
                    <p>Hələ heç bir kombin yaratmamısınız.</p>
                )}
            </div>
        </div>
    );
};

export default OutfitPlannerPage;
