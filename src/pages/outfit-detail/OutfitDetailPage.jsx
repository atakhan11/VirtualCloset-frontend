import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './OutfitDetailPage.css';

const OutfitDetailPage = () => {
    const { id } = useParams();
    const [outfit, setOutfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOutfitDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/outfits/${id}`, config);
                setOutfit(data);
            } catch (err) {
                setError('Failed to load outfit details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOutfitDetails();
    }, [id]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return ''; 
        }
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        return `http://localhost:5000${imagePath}`;
    };

    if (loading) return <p className="page-status">Loading...</p>;
    if (error) return <p className="page-status error">{error}</p>;
    if (!outfit) return <p className="page-status">Outfit not found.</p>;

    return (
        <div className="outfit-detail-container">
            <Link to="/outfit-planner" className="back-link">← Return to Outfit Planner</Link>
            <h1>{outfit.name}</h1>
            <div className="outfit-items-grid">
                {outfit.items.map(item => (
                    <div key={item._id} className="cloth-card-detail">
                        <img src={getImageUrl(item.image)} alt={item.name} />
                        <div className="cloth-info">
                            <h4>{item.name}</h4>
                            <p>{item.category}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OutfitDetailPage;