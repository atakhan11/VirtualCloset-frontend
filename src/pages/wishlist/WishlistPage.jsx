import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaShoppingCart, FaExternalLinkAlt, FaEdit } from 'react-icons/fa';
import './WishlistPage.css';

// Yeni Arzu Əlavə Etmə/Redaktə Modalı
const WishlistItemFormModal = ({ itemToEdit, onSave, onClose }) => {
    const initialFormData = { name: '', category: '', price: '', storeUrl: '', notes: '' };
    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name || '',
                category: itemToEdit.category || '',
                price: itemToEdit.price || '',
                storeUrl: itemToEdit.storeUrl || '',
                notes: itemToEdit.notes || ''
            });
            setPreview(itemToEdit.image ? `http://localhost:5000${itemToEdit.image}` : null);
        } else {
            setFormData(initialFormData);
            setPreview(null);
        }
        setImageFile(null);
    }, [itemToEdit]);

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
        onSave(data, itemToEdit?._id);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{itemToEdit ? 'Arzunu Redaktə Et' : 'Yeni Arzu Əlavə Et'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Şəkil</label>
                        {preview && <img src={preview} alt="Preview" className="image-preview" />}
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                    </div>
                    <div className="form-group">
                        <label>Məhsulun Adı</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Kateqoriya</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Təxmini Qiymət (AZN)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Məhsulun Linki (URL)</label>
                        <input type="text" name="storeUrl" value={formData.storeUrl} onChange={handleChange} />
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


// Ana Wishlist Səhifəsi Komponenti
const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // Redaktə üçün state
    
    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/wishlist', config);
            setWishlistItems(data);
        } catch (err) {
            setError('Arzu siyahısını yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleSave = async (formData, itemId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }};
            
            if (itemId) { // Əgər ID varsa, deməli bu redaktədir (PUT)
                await axios.put(`http://localhost:5000/api/wishlist/${itemId}`, formData, config);
            } else { // Əgər ID yoxdursa, deməli yeni əlavə etmədir (POST)
                await axios.post('http://localhost:5000/api/wishlist', formData, config);
            }

            setIsModalOpen(false);
            setEditingItem(null);
            await fetchWishlist();
        } catch(err) {
            alert(`Xəta: ${err.response?.data?.message || 'Server xətası'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Bu arzunu siyahıdan silməyə əminsinizmi?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/wishlist/${itemId}`, config);
                await fetchWishlist(); // Siyahını yeniləmək üçün datanı yenidən çəkirik
            } catch (err) {
                console.error("Məhsul silinərkən xəta baş verdi:", err);
                alert('Məhsul silinərkən xəta baş verdi.');
            }
        }
    };
    
    // === DÜZƏLİŞ: handleMoveToWardrobe funksiyası tam yazıldı ===
    const handleMoveToWardrobe = async (itemId) => {
        if (window.confirm('Bu məhsulu aldınız və qarderoba köçürmək istəyirsiniz?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Backend-ə boş bir obyekt göndəririk, çünki bütün məlumatlar artıq serverdədir
                await axios.post(`http://localhost:5000/api/wishlist/${itemId}/move`, {}, config);
                alert('Təbriklər! Məhsul qarderobunuza əlavə edildi.');
                await fetchWishlist(); // Arzu siyahısını yeniləyirik
            } catch(err) {
                 console.error("Qarderoba köçürərkən xəta baş verdi:", err);
                 alert(`Xəta: ${err.response?.data?.message || 'Server xətası'}`);
            }
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    if (loading) return <p>Yüklənir...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="wishlist-container">
            <div className="wishlist-header">
                <h1>Arzu Siyahım</h1>
                <button className="add-new-btn" onClick={() => openModal()}>
                    <FaPlus /> Yeni Arzu Əlavə Et
                </button>
            </div>

            <div className="wishlist-grid">
                {wishlistItems.map((item) => (
                    <div key={item._id} className="wishlist-card">
                        {item.image && <img src={`http://localhost:5000${item.image}`} alt={item.name} />}
                        <div className="wishlist-card-content">
                            <h4>{item.name}</h4>
                            {item.category && <p className="category-tag">{item.category}</p>}
                            {item.price && <p className="price-tag">{item.price} AZN</p>}
                            {item.notes && <p className="notes-text">{item.notes}</p>}
                            <div className="wishlist-card-actions">
                                {item.storeUrl && (
                                    <a href={item.storeUrl} target="_blank" rel="noopener noreferrer" className="action-btn store-link" title="Məhsulun linki">
                                        <FaExternalLinkAlt /> Məhsula Bax
                                    </a>
                                )}
                                <button className="action-btn move-btn" onClick={() => handleMoveToWardrobe(item._id)}>
                                    <FaShoppingCart /> Qarderoba Köçür
                                </button>
                            </div>
                             {/* === YENİ REDAKTƏ VƏ SİLMƏ DÜYMƏLƏRİ === */}
                            <div className="wishlist-card-edit-delete">
                                <button className="icon-btn edit-btn" onClick={() => openModal(item)}><FaEdit /></button>
                                <button className="icon-btn delete-btn" onClick={() => handleDelete(item._id)}><FaTrash /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {isModalOpen && (
                <WishlistItemFormModal
                    itemToEdit={editingItem}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default WishlistPage;
