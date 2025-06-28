import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './OutfitPlannerPage.css';

// =======================================================
// YARDIMÇI FUNKSİYA VƏ SABİTLƏR
// =======================================================

const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('blob')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

// Drag-and-drop üçün element tipini təyin edirik
const ItemTypes = {
    CLOTH: 'cloth',
};

// =======================================================
// 1. SÜRÜKLƏNƏ BİLƏN GEYİM KOMPONENTİ (YENİLƏNMİŞ)
// =======================================================
const DraggableCloth = ({ cloth }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CLOTH,
        item: { cloth }, // Sürüklənən zaman ötürüləcək məlumat
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className="cloth-item-small"
            style={{ opacity: isDragging ? 0.5 : 1 }} // Sürüklənərkən şəffaf olur
        >
            <img src={getImageUrl(cloth.image)} alt={cloth.name} />
            {/* === DƏYİŞİKLİK: Aşağıdakı "add-overlay" div-i tamamilə silindi === */}
            {/* <div className="add-overlay">
                <FaPlus />
            </div> 
            */}
        </div>
    );
};

// =======================================================
// 2. ƏSAS SƏHİFƏ KOMPONENTİ
// =======================================================
const OutfitPlannerPage = () => {
    const [allClothes, setAllClothes] = useState([]);
    const [allOutfits, setAllOutfits] = useState([]);
    const [currentOutfitItems, setCurrentOutfitItems] = useState([]);
    const [outfitName, setOutfitName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
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

    // Geyimi kombine əlavə edən funksiya (indi drop handler tərəfindən çağrılır)
    const addToOutfit = (cloth) => {
        if (!currentOutfitItems.find(item => item._id === cloth._id)) {
            setCurrentOutfitItems(prev => [...prev, cloth]);
        }
    };

    const removeFromOutfit = (clothId) => {
        setCurrentOutfitItems(currentOutfitItems.filter(item => item._id !== clothId));
    };

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
                items: currentOutfitItems.map(item => item._id)
            };
            await axios.post('http://localhost:5000/api/outfits', outfitData, config);
            alert('Kombin uğurla yaradıldı!');
            setOutfitName('');
            setCurrentOutfitItems([]);
            await fetchData();
        } catch (err) {
            alert('Kombin yaradılarkən xəta baş verdi.');
        }
    };
    
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

    // Drop Zone (geyimlərin atılacağı sahə) üçün hook
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.CLOTH,
        drop: (item) => addToOutfit(item.cloth), // Geyim atılanda addToOutfit funksiyasını çağırır
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    if (loading) return <p>Yüklənir...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="planner-container">
            <h1>Kombin Planlayıcı</h1>
            <div className="planner-layout">
                {/* Sol Panel: Sürüklənə bilən geyimlər */}
                <div className="all-clothes-panel">
                    <h3>Qarderobunuzdakı Geyimlər</h3>
                    <div className="clothes-list">
                        {allClothes.map(cloth => (
                            <DraggableCloth key={cloth._id} cloth={cloth} />
                        ))}
                    </div>
                </div>

                {/* Sağ Panel: Kombin Qurucu (Drop Zone) */}
                <div className="outfit-builder-panel">
                    <h3>Yeni Kombin Hazırla</h3>
                    <div className="outfit-builder-content">
                        <div 
                            ref={drop} 
                            className="outfit-drop-zone"
                            style={{ backgroundColor: isOver ? '#e0ffe0' : 'transparent' }} // Üzərinə gələndə rəngi dəyişir
                        >
                            {currentOutfitItems.length > 0 ? (
                                currentOutfitItems.map(item => (
                                    <div key={item._id} className="outfit-item">
                                        <img src={getImageUrl(item.image)} alt={item.name} />
                                        <button onClick={() => removeFromOutfit(item._id)} className="remove-item-btn"><FaTimes /></button>
                                    </div>
                                ))
                            ) : (
                                <p>Geyimləri buraya sürüşdürün</p>
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
                                        {outfit.items.slice(0, 4).map(item => (
                                            item && <img key={item._id} src={getImageUrl(item.image)} alt={item.name} />
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

// Əsas komponenti DndProvider ilə əhatə edirik
const OutfitPlannerWithDnd = () => (
    <DndProvider backend={HTML5Backend}>
        <OutfitPlannerPage />
    </DndProvider>
);

export default OutfitPlannerWithDnd;
