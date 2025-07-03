import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllClothes.css';

const EditClothModal = ({ cloth, onClose, onSave }) => {
    const [clothData, setClothData] = useState({ 
        name: cloth.name, 
        category: cloth.category, 
        season: cloth.season || '' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClothData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(cloth._id, clothData);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Edit Clothing Item</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={clothData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <input type="text" name="category" value={clothData.category} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Season</label>
                        <input type="text" name="season" value={clothData.season} onChange={handleChange} />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-primary">Save</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AllClothesScreen = () => {
    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentClothToEdit, setCurrentClothToEdit] = useState(null);

    useEffect(() => {
        const fetchAllClothes = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication token not found.");
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const { data } = await axios.get(`http://localhost:5000/api/clothes/all?search=${searchTerm}`, config); 
                setClothes(data);
                setError('');
            } catch (err) {
                setError('Failed to load clothes.');
                console.error("Error loading all clothes:", err);
            } finally {
                setLoading(false);
            }
        };
        const delayDebounceFn = setTimeout(() => {
            fetchAllClothes();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDeleteCloth = async (clothId) => {
        if(window.confirm('Are you sure you want to delete this clothing item?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/clothes/${clothId}`, config);
                setClothes(clothes.filter(c => c._id !== clothId));
                alert('Clothing item deleted successfully.');
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Server error';
                alert(`Error: ${errorMessage}`);
            }
        }
    };

    const openEditModal = (cloth) => {
        setCurrentClothToEdit(cloth);
        setIsEditModalOpen(true);
    };

    const handleUpdateCloth = async (clothId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: updatedCloth } = await axios.put(`http://localhost:5000/api/clothes/${clothId}`, updatedData, config);
            
            setClothes(clothes.map(c => c._id === clothId ? updatedCloth : c));
            
            setIsEditModalOpen(false);
            setCurrentClothToEdit(null);
            alert('Clothing item information updated successfully.');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Server error';
            alert(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="all-clothes-page">
            <h1>All Clothes</h1>

            <div className="search-container" style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input" 
                />
            </div>

            <div className="clothes-grid">
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : clothes.length > 0 ? (
                    clothes.map((cloth) => (
                        <div key={cloth._id} className="cloth-card">
                            <img src={cloth.image} alt={cloth.name} />
                            <h4>{cloth.name}</h4>
                            <p>Category: {cloth.category}</p>
                            <p>Owner: {cloth.user ? cloth.user.name : 'Unknown'}</p>
                            <div className='action-buttons'>
                                <button className="edit-btn" onClick={() => openEditModal(cloth)}>Edit</button>
                                <button className="delete-btn" onClick={() => handleDeleteCloth(cloth._id)}>Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No clothing items found.</p>
                )}
            </div>

            {isEditModalOpen && (
                <EditClothModal
                    cloth={currentClothToEdit}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleUpdateCloth}
                />
            )}
        </div>
    );
};

export default AllClothesScreen;