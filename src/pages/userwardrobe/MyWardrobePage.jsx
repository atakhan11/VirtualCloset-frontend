import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './MyWardrobePage.css';

// =======================================================
// YARDIMÇI FUNKSİYA VƏ SABİTLƏR
// Bu, kodu daha təmiz saxlayır və təkrarçılığın qarşısını alır.
// =======================================================

// Rəng adlarını CSS-in başa düşdüyü formata çevirir
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

// Kateqoriyalar siyahısı (backend-dəki enum ilə tam eyni olmalıdır)
const CATEGORIES = [
    'Köynək (T-shirt)', 'Köynək (Klassik)', 'Polo', 'Swea / Hudi', 
    'Sviter / Cemper', 'Gödəkçə / Palto', 'Pencək / Blazer', 'Şalvar / Cins', 
    'Şort', 'Ayaqqabı', 'Aksesuar', 'İdman Geyimi', 'Kostyum', 'Başqa'
];

// Mövsümlər siyahısı
const SEASONS = ['Yay', 'Qış', 'Payız', 'Yaz', 'Mövsümsüz'];


// =======================================================
// 1. MODAL (PƏNCƏRƏ) ÜÇÜN AYRI KOMPONENT
// Bu komponent yalnız geyim əlavə etmə və redaktə forması ilə məşğul olur.
// =======================================================
const ClothFormModal = ({ clothToEdit, onSave, onClose }) => {
    const initialFormData = {
        name: '', category: '', season: '', brand: '', colors: '', notes: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Bu hook, pəncərə hər dəfə açılanda onun məzmununu sıfırlayır və ya yeniləyir.
    useEffect(() => {
        if (clothToEdit) {
            // Redaktə rejimi: Formu mövcud məlumatlarla doldurur.
            setFormData({
                name: clothToEdit.name || '',
                category: clothToEdit.category || '',
                season: clothToEdit.season || '',
                brand: clothToEdit.brand || '',
                colors: clothToEdit.colors?.join(', ') || '',
                notes: clothToEdit.notes || ''
            });
            setPreview(clothToEdit.image ? `http://localhost:5000${clothToEdit.image}` : null);
        } else {
            // Yeni geyim rejimi: Formu tamamilə boşaldır.
            setFormData(initialFormData);
            setPreview(null);
        }
        // Hər dəfə açılanda köhnə fayl seçimini təmizləyir.
        setImageFile(null);
    }, [clothToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) {
            data.append('image', imageFile);
        }
        onSave(data, clothToEdit?._id);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{clothToEdit ? 'Geyimi Redaktə Et' : 'Yeni Geyim Əlavə Et'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Şəkil</label>
                        {preview && <img src={preview} alt="Preview" className="image-preview" />}
                        <input type="file" onChange={handleImageChange} accept="image/*" required={!clothToEdit} />
                    </div>
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
// 2. ANA SƏHİFƏ KOMPONENTİ
// Bu komponent səhifənin ümumi məntiqini, data yüklənməsini və filterləməni idarə edir.
// =======================================================
const MyWardrobePage = () => {
    const [allClothes, setAllClothes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter və axtarış üçün state-lər
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterSeason, setFilterSeason] = useState('All');
    
    // Modal pəncərəni idarə etmək üçün state-lər
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
            const { data } = await axios.get('http://localhost:5000/api/clothes', config);
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
                await axios.delete(`http://localhost:5000/api/clothes/${clothId}`, config);
                await fetchMyClothes(); 
            } catch (err) {
                alert('Geyim silinərkən xəta baş verdi.');
                setLoading(false);
            }
        }
    };
    
    const handleSave = async (formData, clothId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}` 
            }};
            if (clothId) {
                await axios.put(`http://localhost:5000/api/clothes/${clothId}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/clothes', formData, config);
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
                        <img src={`http://localhost:5000${cloth.image}`} alt={cloth.name} />
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
