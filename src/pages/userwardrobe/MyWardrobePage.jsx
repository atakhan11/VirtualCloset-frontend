import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './MyWardrobePage.css';

// =======================================================
// YARDIMÇI FUNKSİYA VƏ SABİTLƏR
// =======================================================

const colorTranslator = (colorName) => {
    const trimmedColor = colorName.trim().toLowerCase();
    const colorMap = {
        'qara': 'black', 'ağ': 'white', 'qırmızı': 'red', 'göy': 'blue',
        'yaşıl': 'green', 'sarı': 'yellow', 'narıncı': 'orange',
        'bənövşəyi': 'purple', 'çəhrayı': 'pink', 'qəhvəyi': 'brown',
        'boz': 'gray', 'bej': 'beige',
    };
    return colorMap[trimmedColor] || trimmedColor;
};

const CATEGORIES = [
    'Köynək (T-shirt)', 'Köynək (Klassik)', 'Polo', 'Swea / Hudi', 
    'Sviter / Cemper', 'Gödəkçə / Palto', 'Pencək / Blazer', 'Şalvar / Cins', 
    'Şort', 'Ayaqqabı', 'Aksesuar', 'İdman Geyimi', 'Kostyum', 'Başqa'
];

const SEASONS = ['Yay', 'Qış', 'Payız', 'Yaz', 'Mövsümsüz'];


// =======================================================
// 1. MODAL KOMPONENTİ (YENİLƏNMİŞ)
// Fon təmizləmə məntiqi bura inteqrasiya edildi.
// =======================================================
const ClothFormModal = ({ clothToEdit, onSave, onClose }) => {
    const initialFormData = {
        name: '', category: '', season: '', brand: '', colors: '', notes: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    
    // --- YENİ STATE-LƏR ---
    const [imageFile, setImageFile] = useState(null); // Orijinal fayl
    const [preview, setPreview] = useState(null); // Orijinal faylın önbaxışı
    const [processedImageUrl, setProcessedImageUrl] = useState(''); // Fonsuz şəklin URL-i
    const [isProcessing, setIsProcessing] = useState(false); // Fon təmizlənir?
    const [message, setMessage] = useState(''); // İstifadəçiyə mesaj

    useEffect(() => {
        if (clothToEdit) {
            setFormData({
                name: clothToEdit.name || '',
                category: clothToEdit.category || '',
                season: clothToEdit.season || '',
                brand: clothToEdit.brand || '',
                colors: clothToEdit.colors?.join(', ') || '',
                notes: clothToEdit.notes || ''
            });
            // Redaktə rejimində mövcud şəkli göstəririk
            setProcessedImageUrl(clothToEdit.image || '');
            setPreview(clothToEdit.image || null);
        } else {
            setFormData(initialFormData);
            setPreview(null);
            setProcessedImageUrl('');
        }
        setImageFile(null);
        setMessage('');
    }, [clothToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
            setProcessedImageUrl(''); // Yeni şəkil seçiləndə köhnə emal olunmuş şəkli təmizlə
            setMessage('');
        }
    };

    // --- YENİ FUNKSİYA: FON TƏMİZLƏMƏ ---
    const handleRemoveBackground = async () => {
        if (!imageFile) {
            setMessage('Zəhmət olmasa, əvvəlcə yeni bir şəkil seçin.');
            return;
        }
        setIsProcessing(true);
        setMessage('Fon təmizlənir, zəhmət olmasa gözləyin...');
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        try {
            const res = await axios.post('/api/upload/remove-bg', uploadFormData);
            setProcessedImageUrl(res.data.imageUrl);
            setMessage('Fon uğurla təmizləndi!');
        } catch (error) {
            setMessage(`Xəta: ${error.response?.data?.message || 'Server xətası'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!processedImageUrl) {
            setMessage('Zəhmət olmasa, "Fonunu Təmizlə" düyməsinə basın və ya redaktə üçün mövcud şəkli saxlayın.');
            return;
        }
        const finalData = { ...formData, image: processedImageUrl };
        onSave(finalData, clothToEdit?._id);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{clothToEdit ? 'Geyimi Redaktə Et' : 'Yeni Geyim Əlavə Et'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* --- Şəkil Yükləmə Bloku (Yenilənmiş) --- */}
                    <div className="form-group">
                        <label>Şəkil</label>
                        <div className="image-previews">
                           {preview && <img src={preview} alt="Önbaxış" className="image-preview" />}
                           {processedImageUrl && preview !== processedImageUrl && (
                               <img src={processedImageUrl} alt="Fonsuz şəkil" className="image-preview" />
                           )}
                        </div>
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        {imageFile && (
                            <button type="button" className="btn-secondary" onClick={handleRemoveBackground} disabled={isProcessing}>
                                {isProcessing ? 'Emal olunur...' : 'Fonunu Təmizlə'}
                            </button>
                        )}
                    </div>
                    
                    {/* Digər form sahələri olduğu kimi qalır */}
                    <div className="form-group">
                        <label>Ad</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Kateqoriya</label>
                        <select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="" disabled>Kateqoriya seçin...</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Mövsüm</label>
                        <select name="season" value={formData.season} onChange={handleChange}>
                            <option value="">Mövsüm seçin...</option>
                            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Brend</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Rənglər (Vergüllə ayırın)</label>
                        <input type="text" name="colors" value={formData.colors} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Qeydlər</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                    </div>

                    {message && <p className="form-message">{message}</p>}

                    <div className="modal-actions">
                        <button type="submit" className="btn-primary">Yadda Saxla</button>
                        <button type="button" onClick={onClose}>Ləğv Et</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// =======================================================
// 2. ANA SƏHİFƏ KOMPONENTİ (YENİLƏNMİŞ)
// =======================================================
const MyWardrobePage = () => {
    const [allClothes, setAllClothes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterSeason, setFilterSeason] = useState('All');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCloth, setEditingCloth] = useState(null);

    const fetchMyClothes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Zəhmət olmasa, sistemə daxil olun.");
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/clothes', config);
            setAllClothes(data);
        } catch (err) {
            setError('Geyimləri yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyClothes();
    }, []);

    const handleDelete = async (clothId) => {
        if (window.confirm('Bu geyimi silməyə əminsinizmi?')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/api/clothes/${clothId}`, config);
                await fetchMyClothes(); 
            } catch (err) {
                alert('Geyim silinərkən xəta baş verdi.');
                setLoading(false);
            }
        }
    };
    
    // --- handleSave FUNKSİYASI YENİLƏNDİ ---
    // Artıq FormData yox, JSON göndərir.
    const handleSave = async (clothData, clothId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 
                'Content-Type': 'application/json', // Dəyişiklik
                Authorization: `Bearer ${token}` 
            }};
            if (clothId) {
                await axios.put(`/api/clothes/${clothId}`, clothData, config);
            } else {
                await axios.post('/api/clothes', clothData, config);
            }
            setIsModalOpen(false);
            setEditingCloth(null);
            await fetchMyClothes();
        } catch(err) {
            const errorMessage = err.response?.data?.message || 'Server xətası';
            alert(`Xəta: ${errorMessage}`);
            setLoading(false);
        }
    };

    const openModal = (cloth = null) => {
        setEditingCloth(cloth);
        setIsModalOpen(true);
    };

    const filteredClothes = allClothes.filter(cloth => {
        const matchesSearch = cloth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (cloth.brand && cloth.brand.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'All' || cloth.category === filterCategory;
        const matchesSeason = filterSeason === 'All' || cloth.season === filterSeason;
        return matchesSearch && matchesCategory && matchesSeason;
    });

    // --- Şəkil URL-ni düzgün göstərmək üçün yardımçı funksiya ---
    const getImageUrl = (imagePath) => {
        if (!imagePath) return ''; // Boş şəkil yolu üçün
        // Əgər URL Cloudinary-dəndirsə (http ilə başlayırsa), olduğu kimi qaytar
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        // Əks halda, köhnə sistemə uyğun olaraq serverin adresini əlavə et
        return `http://localhost:5000${imagePath}`;
    };

    if (loading) return <p>Yüklənir...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="wardrobe-container">
            <div className="wardrobe-header">
                <h1>Mənim Qarderobum</h1>
                <button className="add-new-btn" onClick={() => openModal()}>
                    <FaPlus /> Yeni Geyim Əlavə Et
                </button>
            </div>

            <div className="filter-controls">
                <input 
                    type="text"
                    placeholder="Ad və ya brendə görə axtar..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                    <option value="All">Bütün Kateqoriyalar</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)} className="filter-select">
                    <option value="All">Bütün Mövsümlər</option>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="clothes-grid">
                {filteredClothes.length > 0 ? filteredClothes.map((cloth) => (
                    <div key={cloth._id} className="cloth-card">
                        {/* Şəkilləri düzgün göstərmək üçün getImageUrl istifadə olunur */}
                        <img src={getImageUrl(cloth.image)} alt={cloth.name} />
                        <div className="card-content">
                            <h4>{cloth.name}</h4>
                            <div className="card-details">
                                <p className="category-tag">{cloth.category}</p>
                                {cloth.brand && <p className="brand-tag"><strong>Brend:</strong> {cloth.brand}</p>}
                                {cloth.season && <p className="season-tag"><strong>Mövsüm:</strong> {cloth.season}</p>}
                                
                                {cloth.colors && cloth.colors.length > 0 && (
                                    <div className="colors-container">
                                        <strong>Rənglər:</strong>
                                        <div className="color-swatches">
                                            {cloth.colors.map((color, index) => (
                                                <span 
                                                    key={index} 
                                                    className="color-swatch" 
                                                    style={{ backgroundColor: colorTranslator(color) }}
                                                    title={color.trim()}
                                                ></span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {cloth.notes && (
                                    <div className="notes-container">
                                        <p className="notes-text">{cloth.notes}</p>
                                    </div>
                                )}
                            </div>
                            <div className='action-buttons'>
                                <button className="icon-btn edit-btn" title="Redaktə Et" onClick={() => openModal(cloth)}><FaEdit /></button>
                                <button className="icon-btn delete-btn" title="Sil" onClick={() => handleDelete(cloth._id)}><FaTrash /></button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="empty-wardrobe">
                        <p>{allClothes.length > 0 ? 'Filterlərinizə uyğun heç bir nəticə tapılmadı.' : 'Qarderobunuz boşdur. Elə indi yeni geyim əlavə edin!'}</p>
                    </div>
                )}
            </div>
            
            {isModalOpen && (
                <ClothFormModal
                    clothToEdit={editingCloth}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default MyWardrobePage;
