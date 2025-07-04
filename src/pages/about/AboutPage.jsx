import React from 'react';
import { Link } from 'react-router-dom';
import { FaBullseye, FaLightbulb, FaHeart, FaUsers, FaCodeBranch, FaPalette, FaRocket } from 'react-icons/fa';
import './About.css'; 

const AboutPage = () => {
    return (
        <div className="about-container">
            <header className="about-hero">
                <div className="about-hero-content">
                    <h1>A Closet Full of Clothes, But Nothing to Wear?</h1>
                    <p>We've all been there. That's why we created StyleFolio – to transform the daily chaos of choosing an outfit into a moment of creativity and confidence.</p>
                </div>
            </header>

            <section className="mission-section">
                <div className="mission-content">
                    <span className="section-subtitle">Our Mission</span>
                    <h2>Make Peace with Your Wardrobe</h2>
                    <p>
                        StyleFolio was born to alleviate the daily stress of "What should I wear?". Our main goal is to help people fully discover the potential of their existing clothes, prevent wastefulness, and enable everyone to express their unique style with confidence. We believe that with the right tools, every wardrobe can be transformed into a treasure.
                    </p>
                </div>
                <div className="mission-image">
                    <img src="https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Tidy wardrobe" />
                </div>
            </section>
            
            <section className="values-section">
                <div className="section-title">
                   <span>OUR PRINCIPLES</span>
                   <h2>Values That Drive Us Forward</h2>
                </div>
                <div className="values-grid">
                    <div className="value-card">
                        <FaLightbulb className="value-icon" />
                        <h3>Creativity</h3>
                        <p>We encourage our users to create new and exciting combinations from existing pieces.</p>
                    </div>
                    <div className="value-card">
                        <FaBullseye className="value-icon" />
                        <h3>Mindfulness</h3>
                        <p>Knowing what you own helps you shop less and more purposefully.</p>
                    </div>
                    <div className="value-card">
                        <FaHeart className="value-icon" />
                        <h3>Confidence</h3>
                        <p>We aim for you to start each day more confident and prepared by planning your style in advance.</p>
                    </div>
                    <div className="value-card">
                        <FaUsers className="value-icon" />
                        <h3>Community</h3>
                        <p>We build a supportive and creative community where users inspire each other.</p>
                    </div>
                </div>
            </section>

           <section className="roadmap-section">
    <div className="section-title">
        <span>OUR JOURNEY AHEAD</span>
        <h2>Vision for the Future</h2>
    </div>
    <div className="roadmap-container">
        <div className="roadmap-stage">
            <h4>Now</h4>
            <ul>
                <li>Virtual Wardrobe & Outfit Planner</li>
                <li>Smart Calendar Integration</li>
            </ul>
        </div>
        <div className="roadmap-stage upcoming">
            <h4>Next</h4>
            <ul>
                <li>AI Shopping Assistant</li>
                <li>Advanced Weather-Based Suggestions</li>
            </ul>
        </div>
        <div className="roadmap-stage future">
            <h4>Future</h4>
            <ul>
                <li>Virtual Try-On Feature</li>
                <li>Direct Integration with Fashion Stores</li>
            </ul>
        </div>
    </div>
</section>

            <section className="about-final-cta">
                <h2>Join the Style Revolution</h2>
                <p>If you're ready to rediscover your wardrobe and take your style to the next level, join us.</p>
                <Link to="/register" className="cta-button-primary-about">Start Now</Link>
            </section>
        </div>
    );
};

export default AboutPage;