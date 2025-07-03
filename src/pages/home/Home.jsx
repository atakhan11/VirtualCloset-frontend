import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaLayerGroup, FaCalendarCheck, FaMagic, FaHeart, FaUserFriends, FaRocket } from 'react-icons/fa';
import './HomePage.css';

const heroImageUrl = "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
const communityImageUrl1 = "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600";
const communityImageUrl2 = "https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=600";
const communityImageUrl3 = "https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=600";
const avatar1Url = "https://randomuser.me/api/portraits/women/44.jpg";
const avatar2Url = "https://randomuser.me/api/portraits/men/32.jpg";


const HomePage = () => {
    return (
        <div className="home-container">
            <header className="hero-section-enhanced">
                <div className="hero-content-enhanced">
                    <h1 className="hero-title">Discover the Treasure in Your Wardrobe.</h1>
                    <p className="hero-subtitle">
                        With StyleFolio, stop wondering "what should I wear?". Create unlimited outfits from your existing clothes, plan your style, and start every day with confidence.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="cta-button-primary">Start for Free</Link>
                        <Link to="/features" className="cta-button-secondary">Learn More</Link>
                    </div>
                </div>
                <div className="hero-image-enhanced">
                    <img src={heroImageUrl} alt="Person discovering their style" />
                </div>
            </header>

            <section className="features-section-enhanced">
                <div className="section-title">
                    <span>WHAT WE OFFER</span>
                    <h2>Your Personal Style Assistant</h2>
                </div>
                <div className="features-grid-enhanced">
                    <div className="feature-card-enhanced">
                        <FaBoxOpen className="feature-icon-enhanced" />
                        <h3>Virtual Wardrobe</h3>
                        <p>Gather all your clothes in one place, categorize them, and find them in seconds with a search.</p>
                    </div>
                    <div className="feature-card-enhanced">
                        <FaLayerGroup className="feature-icon-enhanced" />
                        <h3>Outfit Planner</h3>
                        <p>Create an unlimited number of outfits from your wardrobe for different occasions.</p>
                    </div>
                    <div className="feature-card-enhanced">
                        <FaCalendarCheck className="feature-icon-enhanced" />
                        <h3>Calendar Integration</h3>
                        <p>Plan your created outfits on an interactive calendar. Schedule your week in advance.</p>
                    </div>
                    <div className="feature-card-enhanced">
                        <FaMagic className="feature-icon-enhanced" />
                        <h3>Smart Suggestions</h3>
                        <p>Get answers to "what should I wear today?" based on weather and your wardrobe.</p>
                    </div>
                    <div className="feature-card-enhanced">
                        <FaHeart className="feature-icon-enhanced" />
                        <h3>Wishlist</h3>
                        <p>Keep a list of items you want to buy and plan your shopping more effectively.</p>
                    </div>
                    <div className="feature-card-enhanced">
                        <FaUserFriends className="feature-icon-enhanced" />
                        <h3>Admin Panel</h3>
                        <p>A powerful management panel to easily control users and the entire system.</p>
                    </div>
                </div>
            </section>

            <section className="inspiration-section">
                <div className="section-title">
                    <span>USER OUTFITS</span>
                    <h2>Get Inspired</h2>
                </div>
                <div className="inspiration-grid">
                    <div className="inspiration-card"><img src={communityImageUrl1} alt="Outfit 1" /></div>
                    <div className="inspiration-card"><img src={communityImageUrl2} alt="Outfit 2" /></div>
                    <div className="inspiration-card"><img src={communityImageUrl3} alt="Outfit 3" /></div>
                </div>
            </section>

            <section className="testimonials-section-enhanced">
                <div className="section-title">
                    <span>HAPPY USERS</span>
                    <h2>What Do They Say About Us?</h2>
                </div>
                <div className="testimonials-grid-enhanced">
                    <div className="testimonial-card-enhanced">
                        <img src={avatar1Url} alt="Aygün K." className="testimonial-avatar" />
                        <blockquote>
                            “StyleFolio changed my life! I no longer spend hours wondering "what should I wear?" every morning. Everything is at my fingertips with just one click.”
                        </blockquote>
                        <cite>Aygun K. - Marketing Manager</cite>
                    </div>
                    <div className="testimonial-card-enhanced">
                        <img src={avatar2Url} alt="Elvin S." className="testimonial-avatar" />
                        <blockquote>
                            “Thanks to this app, I understood how many clothes I have in my wardrobe and how to use them differently. I recommend it to everyone!”
                        </blockquote>
                        <cite>Elvin S. - Software Developer</cite>
                    </div>
                </div>
            </section>

            <section className="final-cta-section-enhanced">
                <h2>Ready to Rediscover Your Style?</h2>
                <p>Unlock the full potential of your wardrobe and live your every day more planned.</p>
                <Link to="/register" className="cta-button-final">
                    <FaRocket /> Yes, Start My Style Journey!
                </Link>
            </section>
        </div>
    );
};

export default HomePage;