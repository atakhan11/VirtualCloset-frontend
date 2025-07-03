import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './MyWardrobePage.css';

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
    'T-shirt', 'Classic Shirt', 'Polo', 'Sweatshirt / Hoodie', 
    'Sweater / Jumper', 'Jacket / Coat', 'Blazer / Suit Jacket', 'Trousers / Jeans', 
    'Shorts', 'Shoes', 'Accessory', 'Sportswear', 'Suit', 'Other'
];

const SEASONS = ['Summer', 'Winter', 'Autumn', 'Spring', 'All-season'];

const ClothFormModal = ({ clothToEdit, onSave, onClose }) => {
    const initialFormData = {
        name: '', category: '', season: '', brand: '', colors: '', notes: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    
    const [imageFile, setImageFile] = useState(null); 
    const [preview, setPreview] = useState(null); 
    const [processedImageUrl, setProcessedImageUrl] = useState(''); 
    const [isProcessing, setIsProcessing] = useState(false); 
    const [message, setMessage] = useState(''); 

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
            setProcessedImageUrl(''); 
            setMessage('');
        }
    };

    const handleRemoveBackground = async () => {
        if (!imageFile) {
            setMessage('Please select a new image first.');
            return;
        }
        setIsProcessing(true);
        setMessage('Removing background, please wait...');
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        try {
            const res = await axios.post('/api/upload/remove-bg', uploadFormData);
            setProcessedImageUrl(res.data.imageUrl);
            setMessage('Background successfully removed!');
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || 'Server error'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!processedImageUrl) {
            setMessage('Please click "Remove Background" or keep the existing image for editing.');
            return;
        }
        const finalData = { ...formData, image: processedImageUrl };
        onSave(finalData, clothToEdit?._id);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{clothToEdit ? 'Edit Clothing Item' : 'Add New Clothing Item'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Image</label>
                        <div className="image-previews">
                           {preview && <img src={preview} alt="Preview" className="image-preview" />}
                           {processedImageUrl && preview !== processedImageUrl && (
                               <img src={processedImageUrl} alt="Background removed image" className="image-preview" />
                           )}
                        </div>
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                        {imageFile && (
                            <button type="button" className="btn-secondary" onClick={handleRemoveBackground} disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : 'Remove Background'}
                            </button>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="" disabled>Select category...</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Season</label>
                        <select name="season" value={formData.season} onChange={handleChange}>
                            <option value="">Select season...</option>
                            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Brand</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Colors (Comma separated)</label>
                        <input type="text" name="colors" value={formData.colors} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                    </div>

                    {message && <p className="form-message">{message}</p>}

                    <div className="modal-actions">
                        <button type="submit" className="btn-primary">Save</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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
                setError("Please log in to the system.");
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/clothes', config);
            setAllClothes(data);
        } catch (err) {
            setError('Failed to load clothing items.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyClothes();
    }, []);

    const handleDelete = async (clothId) => {
        if (window.confirm('Are you sure you want to delete this clothing item?')) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/api/clothes/${clothId}`, config);
                await fetchMyClothes(); 
            } catch (err) {
                alert('An error occurred while deleting the clothing item.');
                setLoading(false);
            }
        }
    };
    
    const handleSave = async (clothData, clothId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 
                'Content-Type': 'application/json', 
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
            const errorMessage = err.response?.data?.message || 'Server error';
            alert(`Error: ${errorMessage}`);
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

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `http://localhost:5000${imagePath}`;
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="wardrobe-container">
            <div className="wardrobe-header">
                <h1>My Wardrobe</h1>
                <button className="add-new-btn" onClick={() => openModal()}>
                    <FaPlus /> Add New Clothing Item
                </button>
            </div>

            <div className="filter-controls">
                <input 
                    type="text"
                    placeholder="Search by name or brand..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)} className="filter-select">
                    <option value="All">All Seasons</option>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="clothes-grid">
                {filteredClothes.length > 0 ? filteredClothes.map((cloth) => (
                    <div key={cloth._id} className="cloth-card">
                        <img src={getImageUrl(cloth.image)} alt={cloth.name} />
                        <div className="card-content">
                            <h4>{cloth.name}</h4>
                            <div className="card-details">
                                <p className="category-tag">{cloth.category}</p>
                                {cloth.brand && <p className="brand-tag"><strong>Brand:</strong> {cloth.brand}</p>}
                                {cloth.season && <p className="season-tag"><strong>Season:</strong> {cloth.season}</p>}
                                
                                {cloth.colors && cloth.colors.length > 0 && (
                                    <div className="colors-container">
                                        <strong>Colors:</strong>
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
                                <button className="icon-btn edit-btn" title="Edit" onClick={() => openModal(cloth)}><FaEdit /></button>
                                <button className="icon-btn delete-btn" title="Delete" onClick={() => handleDelete(cloth._id)}><FaTrash /></button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="empty-wardrobe">
                        <p>{allClothes.length > 0 ? 'No results found matching your filters.' : 'Your wardrobe is empty. Add new clothing items now!'}</p>
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