import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/reducers/userSlice';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaTshirt, FaCalendarAlt, FaShoppingBag, FaMagic, FaSyncAlt, FaCalendarPlus } from 'react-icons/fa';
import WeatherWidget from '../../components/weatherwidget/WeatherWidget';
import './DashboardPage.css';

const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('blob')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

const TodaysOutfit = ({ outfits }) => {
    const today = new Date().toDateString();
    const todaysOutfit = outfits.find(o => o.isPlanned && new Date(o.plannedDate).toDateString() === today);

    if (!todaysOutfit) {
        return (
            <div className="dashboard-widget">
                <h3>Today's Outfit</h3>
                <div className="empty-widget">
                    <p>No outfit planned for today.</p>
                    <Link to="/calendar" className="widget-link">Go to Calendar</Link>
                </div>
            </div>
        );
    }
    return (
        <div className="dashboard-widget">
            <h3>Today's Outfit: {todaysOutfit.name}</h3>
            <div className="todays-outfit-images">
                {todaysOutfit.items.map(item => (
                    item && <img key={item._id} src={getImageUrl(item.image)} alt={item.name} />
                ))}
            </div>
        </div>
    );
};

const WishlistReminder = ({ wishlist }) => {
    if (wishlist.length === 0) return null;
    const randomItem = wishlist[Math.floor(Math.random() * wishlist.length)];

    return (
        <div className="dashboard-widget">
            <h3>Wishlist Reminder</h3>
            <div className="wishlist-reminder-item">
                {randomItem.image && <img src={getImageUrl(randomItem.image)} alt={randomItem.name} />}
                <div className="wishlist-reminder-info">
                    <p>{randomItem.name}</p>
                    <Link to="/wishlist" className="widget-link">View List</Link>
                </div>
            </div>
        </div>
    );
};

const SuggestionModal = ({ isOpen, onClose, suggestion, onRegenerate, onPlan }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content suggestion-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Our Suggestion for Today</h2>
                {suggestion.length > 0 ? (
                    <>
                        <div className="suggestion-images-large">
                            {suggestion.map(item => (
                                item && <div key={item._id} className="suggestion-item">
                                    <img src={getImageUrl(item.image)} alt={item.name} />
                                    <p>{item.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions suggestion-actions">
                            <button onClick={onRegenerate} className="btn-secondary">
                                <FaSyncAlt /> Another Suggestion
                            </button>
                            <button onClick={() => onPlan(suggestion)} className="btn-primary">
                                <FaCalendarPlus /> I Like It, Plan It!
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-suggestion">
                        <p>Unfortunately, no outfit was found suitable for the weather and your wardrobe.</p>
                        <p>Please add more clothing items for different seasons.</p>
                    </div>
                )}
                <button onClick={onClose} className="close-modal-btn">&times;</button>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const user = useSelector(selectUser);
    const navigate = useNavigate();
    const [data, setData] = useState({ outfits: [], clothes: [], wishlist: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [weatherData, setWeatherData] = useState(null);
    const [isSuggestionModalOpen, setSuggestionModalOpen] = useState(false);
    const [suggestedOutfit, setSuggestedOutfit] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Please log in to the system.");
                    setLoading(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [outfitsRes, clothesRes, wishlistRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/outfits', config),
                    axios.get('http://localhost:5000/api/clothes', config),
                    axios.get('http://localhost:5000/api/wishlist', config)
                ]);

                setData({
                    outfits: outfitsRes.data,
                    clothes: clothesRes.data,
                    wishlist: wishlistRes.data
                });
            } catch (err) {
                setError("An error occurred while loading data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleGenerateSuggestion = () => {
        if (!weatherData || data.clothes.length < 2) {
            alert("Not enough clothing items or weather data for a smart suggestion.");
            return;
        }

        const temp = weatherData.main.temp;
        let targetSeason;

        if (temp > 20) targetSeason = ['Summer', 'Spring'];
        else if (temp > 12) targetSeason = ['Autumn', 'Spring'];
        else targetSeason = ['Winter', 'Autumn'];

        const topKeywords = ['shirt', 'polo', 'sweatshirt', 'swea', 'hoodie', 'sweater', 'jumper', 'jacket', 'coat', 'blazer', 'suit'];
        const bottomKeywords = ['trousers', 'jeans', 'shorts'];
        const shoesKeywords = ['shoes'];

        const categoryMatches = (category, keywords) => {
            if (!category) return false;
            const lowerCaseCategory = category.toLowerCase();
            return keywords.some(keyword => lowerCaseCategory.includes(keyword));
        };

        const suitableClothes = data.clothes.filter(c => 
            c.season && (targetSeason.includes(c.season) || c.season === 'All-season')
        );
        
        const tops = suitableClothes.filter(c => categoryMatches(c.category, topKeywords));
        const bottoms = suitableClothes.filter(c => categoryMatches(c.category, bottomKeywords));
        const shoes = suitableClothes.filter(c => categoryMatches(c.category, shoesKeywords));
        
        if (tops.length === 0 || bottoms.length === 0) {
            setSuggestedOutfit([]);
        } else {
            const randomTop = tops[Math.floor(Math.random() * tops.length)];
            const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
            const randomShoes = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : null;
            
            setSuggestedOutfit([randomTop, randomBottom, randomShoes].filter(Boolean)); 
        }
        
        setSuggestionModalOpen(true);
    };

    const handlePlanSuggestedOutfit = async (suggestion) => {
        if (!suggestion || suggestion.length === 0) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const outfitName = `Today's Suggestion (${new Date().toLocaleDateString()})`;
            
            const outfitData = { name: outfitName, items: suggestion.map(item => item._id) };
            
            const { data: createdOutfit } = await axios.post('http://localhost:5000/api/outfits', outfitData, config);
            await axios.put(`http://localhost:5000/api/outfits/${createdOutfit._id}/plan`, { date: new Date() }, config);

            alert(`"${outfitName}" outfit created and planned for today!`);
            setSuggestionModalOpen(false);
            navigate('/calendar');
        } catch (error) {
            alert("An error occurred while planning the suggestion.");
        }
    };

    if (loading) return <p className="page-status">Loading...</p>;
    if (error) return <p className="page-status error">{error}</p>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-greeting">
                <h1>Welcome, {user?.name}!</h1>
                <p>What are your plans for today?</p>
            </div>

            <div className="suggestion-banner">
                <button onClick={handleGenerateSuggestion} className="suggestion-button">
                    <FaMagic /> What to Wear Today?
                </button>
            </div>

            <div className="quick-actions">
                <Link to="/my-wardrobe" className="action-card"> <FaTshirt /> <span>My Wardrobe</span></Link>
                <Link to="/outfit-planner" className="action-card"> <FaPlus /> <span>Create New Outfit</span></Link>
                <Link to="/calendar" className="action-card"> <FaCalendarAlt /> <span>View Calendar</span></Link>
                <Link to="/wishlist" className="action-card"> <FaShoppingBag /> <span>My Wishlist</span></Link>
            </div>

            <div className="dashboard-grid">
                <WeatherWidget onWeatherLoad={setWeatherData} />
                <TodaysOutfit outfits={data.outfits} />
                <WishlistReminder wishlist={data.wishlist} />
            </div>
            
            <SuggestionModal 
                isOpen={isSuggestionModalOpen}
                onClose={() => setSuggestionModalOpen(false)}
                suggestion={suggestedOutfit}
                onRegenerate={handleGenerateSuggestion}
                onPlan={handlePlanSuggestedOutfit}
            />
        </div>
    );
};

export default DashboardPage;