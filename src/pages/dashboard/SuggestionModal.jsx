import React from 'react';
import { FaSyncAlt, FaCalendarPlus } from 'react-icons/fa';
import '../dashboard/DashboardPage.css'; 

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
                                <div key={item._id} className="suggestion-item">
                                    <img src={`http://localhost:5000${item.image}`} alt={item.name} />
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
            </div>
        </div>
    );
};

export default SuggestionModal;