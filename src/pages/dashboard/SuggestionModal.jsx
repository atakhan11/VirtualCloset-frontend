import React from 'react';
import { FaSyncAlt, FaCalendarPlus } from 'react-icons/fa';
import '../dashboard/DashboardPage.css'; // Stilləri ana dashboard faylından götürür

const SuggestionModal = ({ isOpen, onClose, suggestion, onRegenerate, onPlan }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content suggestion-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Bu Gün Üçün Təklifimiz</h2>
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
                                <FaSyncAlt /> Başqa Təklif
                            </button>
                            <button onClick={() => onPlan(suggestion)} className="btn-primary">
                                <FaCalendarPlus /> Bəyəndim, Planla!
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-suggestion">
                        <p>Təəssüf ki, hava durumuna və qarderobunuza uyğun bir kombin tapılmadı.</p>
                        <p>Zəhmət olmasa, fərqli mövsümlər üçün daha çox geyim əlavə edin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestionModal;
