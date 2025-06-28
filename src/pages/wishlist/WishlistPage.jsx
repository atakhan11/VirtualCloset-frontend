import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaMagic, FaShoppingBag } from 'react-icons/fa';
import './WishlistPage.css'; 

const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('blob')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

const CATEGORIES = [
    'Köynək (T-shirt)', 'Köynək (Klassik)', 'Polo', 'Sweatshirt / Hudi',
    'Sviter / Cemper', 'Gödəkçə / Palto', 'Pencək / Blazer', 'Şalvar / Cins', 
    'Şort', 'Ayaqqabı', 'Aksesuar', 'İdman Geyimi', 'Kostyum', 'Başqa'
];

const WishlistFormModal = ({ itemToEdit, onSave, onClose }) => {
    const initialFormData = { name: '', category: '', price: '', storeUrl: '', notes: '' };
    const [formData, setFormData] = useState(initialFormData);
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [processedImageUrl, setProcessedImageUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name || '',
                category: itemToEdit.category || '',
                price: itemToEdit.price || '',
                storeUrl: itemToEdit.storeUrl || '',
                notes: itemToEdit.notes || ''
            });
            const imageUrl = getImageUrl(itemToEdit.image);
            setProcessedImageUrl(imageUrl);
            setPreview(imageUrl);
            setScrapeUrl(itemToEdit.storeUrl || '');
        } else {
            setFormData(initialFormData);
            setPreview(null);
            setProcessedImageUrl('');
            setScrapeUrl('');
        }
        setImageFile(null);
        setMessage('');
    }, [itemToEdit]);

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
            setProcessedImageUrl('');
            setMessage('');
        }
    };

    const handleRemoveBackground = async () => {
        if (!imageFile) { setMessage('Zəhmət olmasa, əvvəlcə yeni bir şəkil seçin.'); return; }
        setIsProcessing(true);
        setMessage('Fon təmizlənir, zəhmət olmasa gözləyin...');
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post('http://localhost:5000/api/upload/remove-bg', uploadFormData, config);
            setProcessedImageUrl(res.data.imageUrl);
            setMessage('Fon uğurla təmizləndi!');
        } catch (error) {
            setMessage(`Xəta: ${error.response?.data?.message || 'Server xətası'}`);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleScrapeUrl = async () => {
        if (!scrapeUrl) { setMessage('Zəhmət olmasa, bir link daxil edin.'); return; }
        setIsScraping(true);
        setMessage('Məlumatlar çəkilir...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/scrape/fetch-url', { productUrl: scrapeUrl }, config);
            if (data && data.name) {
                setFormData(prevFormData => ({
                    ...prevFormData, name: data.name, price: data.price || '', storeUrl: data.productUrl || scrapeUrl,
                }));
                setPreview(data.image || '');
                setProcessedImageUrl(data.image || '');
                setMessage('Məlumatlar uğurla çəkildi!');
            } else {
                setMessage('Məlumat tapılmadı. Zəhmət olmasa, əl ilə daxil edin.');
                setFormData(prevFormData => ({ ...prevFormData, storeUrl: scrapeUrl }));
            }
        } catch (error) {
            setMessage(`Xəta: ${error.response?.data?.message || 'Məlumatları çəkmək mümkün olmadı.'}`);
        } finally {
            setIsScraping(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) { setMessage('Məhsulun adını daxil etmək məcburidir.'); return; }
        if (!processedImageUrl) { setMessage('Zəhmət olmasa, bir şəkil əlavə edin.'); return; }
        const finalData = { ...formData, image: processedImageUrl };
        onSave(finalData, itemToEdit?._id);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{itemToEdit ? 'Arzunu Redaktə Et' : 'Yeni Arzu Əlavə Et'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group scrape-section">
                        <label>Mağaza Linki (İstəyə Bağlı)</label>
                        <div className="scrape-input-group">
                            <input type="url" placeholder="Məhsulun linkini bura yapışdırın..." value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} />
                            <button type="button" onClick={handleScrapeUrl} disabled={isScraping} className="scrape-btn" title="Linkdən məlumatları çək">{isScraping ? '...' : <FaMagic />}</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Məhsulun Adı</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Şəkil</label>
                        <div className="image-previews">{preview && <img src={getImageUrl(preview)} alt="Önbaxış" className="image-preview" />}</div>
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        {imageFile && (<button type="button" className="btn-secondary" onClick={handleRemoveBackground} disabled={isProcessing}>{isProcessing ? 'Emal olunur...' : 'Fonunu Təmizlə'}</button>)}
                    </div>
                    <div className="form-group">
                        <label>Kateqoriya</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="">Kateqoriya seçin...</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Təxmini Qiymət (AZN)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Məhsulun Linki (URL)</label>
                        <input type="url" name="storeUrl" value={formData.storeUrl} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Qeydlər</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                    </div>
                    {message && <p className="form-message">{message}</p>}
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Ləğv Et</button>
                        <button type="submit" className="btn btn-primary" disabled={isProcessing || isScraping}>Yadda Saxla</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchData = async () => {
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
        fetchData();
    }, []);

    const handleSave = async (itemData, itemId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }};
            if (itemId) {
                await axios.put(`http://localhost:5000/api/wishlist/${itemId}`, itemData, config);
            } else {
                await axios.post('http://localhost:5000/api/wishlist', itemData, config);
            }
            setIsModalOpen(false);
            setEditingItem(null);
            await fetchData();
        } catch(err) {
            alert(`Xəta: ${err.response?.data?.message || 'Server xətası'}`);
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Bu arzunu silməyə əminsinizmi?')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/wishlist/${itemId}`, config);
                await fetchData();
            } catch (err) {
                alert('Arzu silinərkən xəta baş verdi.');
                setLoading(false);
            }
        }
    };

    const handleMoveToWardrobe = async (itemId) => {
        if (window.confirm('Bu məhsulu qarderobunuza əlavə etmək istədiyinizə əminsiniz? Məhsul arzu siyahısından silinəcək.')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.post(`http://localhost:5000/api/wishlist/${itemId}/move`, {}, config);
                await fetchData();
                alert('Məhsul uğurla qarderoba əlavə edildi!');
            } catch (err) {
                alert(`Xəta: ${err.response?.data?.message || 'Məhsulu köçürmək mümkün olmadı.'}`);
                setLoading(false);
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
                {wishlistItems.length > 0 ? wishlistItems.map((item) => (
                    <div key={item._id} className="wishlist-card">
                        <img src={getImageUrl(item.image)} alt={item.name} />
                        <div className="card-content">
                            <h4>{item.name}</h4>
                            {item.category && <p className="category-tag">{item.category}</p>}
                            {item.price && <p className="price-tag">{item.price} AZN</p>}
                        </div>
                        <div className="card-footer">
                            <button className="card-btn" onClick={() => handleMoveToWardrobe(item._id)} title="Qarderoba Əlavə Et">
                                <FaShoppingBag />
                            </button>
                            {item.storeUrl && (
                                <a href={item.storeUrl} target="_blank" rel="noopener noreferrer" className="card-btn" title="Məhsula Bax">
                                    <FaExternalLinkAlt />
                                </a>
                            )}
                            <button className="card-btn" onClick={() => openModal(item)} title="Redaktə Et"><FaEdit /></button>
                            <button className="card-btn danger" onClick={() => handleDelete(item._id)} title="Sil"><FaTrash /></button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-wishlist">
                        <p>Arzu siyahınız boşdur.</p>
                    </div>
                )}
            </div>
            {isModalOpen && (
                <WishlistFormModal
                    itemToEdit={editingItem}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default WishlistPage;
