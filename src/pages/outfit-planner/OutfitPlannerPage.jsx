import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './OutfitPlannerPage.css';

const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('blob')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

const ItemTypes = {
    CLOTH: 'cloth',
};

const DraggableCloth = ({ cloth }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CLOTH,
        item: { cloth }, 
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className="cloth-item-small"
            style={{ opacity: isDragging ? 0.5 : 1 }} 
        >
            <img src={getImageUrl(cloth.image)} alt={cloth.name} />
        </div>
    );
};

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
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            return alert('Please give the outfit a name.');
        }
        if (currentOutfitItems.length < 2) {
            return alert('Select at least 2 clothing items to create an outfit.');
        }
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const outfitData = {
                name: outfitName,
                items: currentOutfitItems.map(item => item._id)
            };
            await axios.post('http://localhost:5000/api/outfits', outfitData, config);
            alert('Outfit created successfully!');
            setOutfitName('');
            setCurrentOutfitItems([]);
            await fetchData();
        } catch (err) {
            alert('An error occurred while creating the outfit.');
        }
    };
    
    const handleDeleteOutfit = async (outfitId) => {
        if (window.confirm('Are you sure you want to delete this outfit?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/outfits/${outfitId}`, config);
                await fetchData();
            } catch (err) {
                alert('An error occurred while deleting the outfit.');
            }
        }
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.CLOTH,
        drop: (item) => addToOutfit(item.cloth), 
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="planner-container">
            <h1>Outfit Planner</h1>
            <div className="planner-layout">
                <div className="all-clothes-panel">
                    <h3>Clothes in Your Wardrobe</h3>
                    <div className="clothes-list">
                        {allClothes.map(cloth => (
                            <DraggableCloth key={cloth._id} cloth={cloth} />
                        ))}
                    </div>
                </div>

                <div className="outfit-builder-panel">
                    <h3>Create New Outfit</h3>
                    <div className="outfit-builder-content">
                        <div 
                            ref={drop} 
                            className="outfit-drop-zone"
                            style={{ backgroundColor: isOver ? '#e0ffe0' : 'transparent' }} 
                        >
                            {currentOutfitItems.length > 0 ? (
                                currentOutfitItems.map(item => (
                                    <div key={item._id} className="outfit-item">
                                        <img src={getImageUrl(item.image)} alt={item.name} />
                                        <button onClick={() => removeFromOutfit(item._id)} className="remove-item-btn"><FaTimes /></button>
                                    </div>
                                ))
                            ) : (
                                <p>Drag clothes here</p>
                            )}
                        </div>
                        <div className="outfit-actions">
                            <input 
                                type="text"
                                placeholder="Name your outfit..."
                                value={outfitName}
                                onChange={(e) => setOutfitName(e.target.value)}
                                className="outfit-name-input"
                            />
                            <button onClick={handleSaveOutfit} className="save-outfit-btn">Save Outfit</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="saved-outfits-section">
                <h2>Your Created Outfits</h2>
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
                    <p>You haven't created any outfits yet.</p>
                )}
            </div>
        </div>
    );
};

const OutfitPlannerWithDnd = () => (
    <DndProvider backend={HTML5Backend}>
        <OutfitPlannerPage />
    </DndProvider>
);

export default OutfitPlannerWithDnd;