import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaLayerGroup, FaCalendarCheck, FaMagic, FaHeart, FaUserFriends, FaLock, FaMobileAlt } from 'react-icons/fa';
import './Features.css';

const FeatureDetailCard = ({ icon, title, children }) => (
    <div className="feature-detail-card">
        <div className="feature-detail-icon">{icon}</div>
        <div className="feature-detail-content">
            <h3>{title}</h3>
            <p>{children}</p>
        </div>
    </div>
);


const Features = () => {
    return (
        <div className="features-page-container">
            <header className="features-header">
                <h1>All Features of the Application</h1>
                <p>Discover StyleFolio's powerful tools that will simplify your life.</p>
            </header>

            <main className="features-main-content">
                <FeatureDetailCard icon={<FaBoxOpen />} title="Comprehensive Virtual Wardrobe">
                    Digitally store all your clothes with images, categories, seasons, colors, and even your own notes. With a powerful search and filter system, find the clothing item you need in seconds.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaLayerGroup />} title="Unlimited Outfit Creation">
                    Combine pieces from your wardrobe to create different outfits for every occasion – whether it's a business meeting, a casual stroll, or a special event – and save them.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaCalendarCheck />} title="Smart Calendar Planner">
                    Plan your created outfits on an interactive calendar. View your planned outfits, change dates, and never again experience the stress of "what should I wear today?".
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaMagic />} title="“What Should I Wear?” Suggestion System">
                    When you're undecided, just press a button and let the application think for you. Our smart algorithm will provide you with personalized outfit suggestions based on the weather forecast and your wardrobe.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaHeart />} title="Wishlist">
                    Keep a list of clothing items you plan to buy, complete with their price and store link. Once purchased, transfer them to your wardrobe with a single click.
                </FeatureDetailCard>
                
                <FeatureDetailCard icon={<FaMobileAlt />} title="Mobile and Responsive Design">
                    StyleFolio is designed to work seamlessly on desktop computers, tablets, and mobile phones. You can even capture and upload images of your clothes directly from your phone's camera.
                </FeatureDetailCard>

                <FeatureDetailCard icon={<FaLock />} title="Security and Privacy">
                    All your data (user information, clothing items, outfits) is securely stored. System management through the Admin Panel is under full control.
                </FeatureDetailCard>

                <div className="features-cta">
                    <h2>Ready?</h2>
                    <p>Discover a new and smart way to manage your style by signing up now.</p>
                    <Link to="/register" className="cta-button-features">Create Free Account</Link>
                </div>
            </main>
        </div>
    );
};

export default Features;