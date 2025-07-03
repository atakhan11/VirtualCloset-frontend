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
    'T-shirt', 'Classic Shirt', 'Polo', 'Sweatshirt / Hoodie',
    'Sweater / Jumper', 'Jacket / Coat', 'Blazer / Suit Jacket', 'Trousers / Jeans', 
    'Shorts', 'Shoes', 'Accessory', 'Sportswear', 'Suit', 'Other'
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
        if (!imageFile) { setMessage('Please select a new image first.'); return; }
        setIsProcessing(true);
        setMessage('Removing background, please wait...');
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post('http://localhost:5000/api/upload/remove-bg', uploadFormData, config);
            setProcessedImageUrl(res.data.imageUrl);
            setMessage('Background successfully removed!');
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || 'Server error'}`);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleScrapeUrl = async () => {
        if (!scrapeUrl) { setMessage('Please enter a link.'); return; }
        setIsScraping(true);
        setMessage('Fetching data...');
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
                setMessage('Data fetched successfully!');
            } else {
                setMessage('No data found. Please enter manually.');
                setFormData(prevFormData => ({ ...prevFormData, storeUrl: scrapeUrl }));
            }
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || 'Failed to fetch data.'}`);
        } finally {
            setIsScraping(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) { setMessage('Product name is required.'); return; }
        if (!processedImageUrl) { setMessage('Please add an image.'); return; }
        const finalData = { ...formData, image: processedImageUrl };
        onSave(finalData, itemToEdit?._id);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{itemToEdit ? 'Edit Wishlist Item' : 'Add New Wishlist Item'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group scrape-section">
                        <label>Store Link (Optional)</label>
                        <div className="scrape-input-group">
                            <input type="url" placeholder="Paste product link here..." value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} />
                            <button type="button" onClick={handleScrapeUrl} disabled={isScraping} className="scrape-btn" title="Fetch data from link">{isScraping ? '...' : <FaMagic />}</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Image</label>
                        <div className="image-previews">{preview && <img src={getImageUrl(preview)} alt="Preview" className="image-preview" />}</div>
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        {imageFile && (<button type="button" className="btn-secondary" onClick={handleRemoveBackground} disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Remove Background'}</button>)}
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="">Select category...</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Estimated Price (AZN)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Product Link (URL)</label>
                        <input type="url" name="storeUrl" value={formData.storeUrl} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                    </div>
                    {message && <p className="form-message">{message}</p>}
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isProcessing || isScraping}>Save</button>
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
            setError('Failed to load wishlist.');
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
            alert(`Error: ${err.response?.data?.message || 'Server error'}`);
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this wishlist item?')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/wishlist/${itemId}`, config);
                await fetchData();
            } catch (err) {
                alert('An error occurred while deleting the wishlist item.');
                setLoading(false);
            }
        }
    };

    const handleMoveToWardrobe = async (itemId) => {
        if (window.confirm('Are you sure you want to add this item to your wardrobe? The item will be removed from your wishlist.')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.post(`http://localhost:5000/api/wishlist/${itemId}/move`, {}, config);
                await fetchData();
                alert('Item successfully added to wardrobe!');
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to move item.'}`);
                setLoading(false);
            }
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="wishlist-container">
            <div className="wishlist-header">
                <h1>My Wishlist</h1>
                <button className="add-new-btn" onClick={() => openModal()}>
                    <FaPlus /> Add New Wish
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
                            <button className="card-btn" onClick={() => handleMoveToWardrobe(item._id)} title="Add to Wardrobe">
                                <FaShoppingBag />
                            </button>
                            {item.storeUrl && (
                                <a href={item.storeUrl} target="_blank" rel="noopener noreferrer" className="card-btn" title="View Product">
                                    <FaExternalLinkAlt />
                                </a>
                            )}
                            <button className="card-btn" onClick={() => openModal(item)} title="Edit"><FaEdit /></button>
                            <button className="card-btn danger" onClick={() => handleDelete(item._id)} title="Delete"><FaTrash /></button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-wishlist">
                        <p>Your wishlist is empty.</p>
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