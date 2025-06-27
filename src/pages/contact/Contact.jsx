import React, { useState } from 'react';
import './Contact.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
    // Formun məntiqi (state, handleChange, handleSubmit) olduğu kimi qalır
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({ ...prevState, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Göndərilir...');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (response.ok) {
                setStatus('Mesajınız uğurla göndərildi!');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setStatus(`Xəta: ${result.message || 'Server cavab vermir.'}`);
            }
        } catch (error) {
            setStatus('Şəbəkə xətası. İnternet bağlantınızı yoxlayın.');
        }
    };

    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1>Bizimlə Əlaqə Saxlayın</h1>
                <p>Suallarınız, təklifləriniz və ya əməkdaşlıq üçün bizə yazın.</p>
            </div>
            <div className="contact-main-content">
                {/* Sol Tərəf: Əlaqə Formu (dəyişiklik tələb etmir) */}
                <div className="contact-form-wrapper">
                    <h2>Mesaj Göndərin</h2>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Adınız</label>
                            <input type="text" id="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-poçt Ünvanınız</label>
                            <input type="email" id="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject">Mövzu</label>
                            <input type="text" id="subject" value={formData.subject} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Mesajınız</label>
                            <textarea id="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
                        </div>
                        <button type="submit" className="cta-button" disabled={status === 'Göndərilir...'}>
                            {status === 'Göndərilir...' ? '...' : 'Göndər'}
                        </button>
                        {status && <p className="status-message">{status}</p>}
                    </form>
                </div>

                {/* === SAĞ TƏRƏF: ƏLAQƏ MƏLUMATLARI (BURANI DƏYİŞİN) === */}
                <div className="contact-info-wrapper">
                    <h2>Əlaqə Məlumatları</h2>
                    
                    {/* 1. Bu mətni istədiyiniz kimi dəyişin */}
                    <p className="contact-info-intro">
                        Bizimlə bağlı hər hansı bir sualınız varsa, aşağıdakı məlumatlardan istifadə edərək əlaqə saxlaya bilərsiniz.
                    </p>
                    
                    <ul className="contact-details-list">
                        <li>
                            <FaMapMarkerAlt className="contact-icon" />
                            {/* 2. Ünvanı burada dəyişin */}
                            <span>111 Fatali Khan Khoyski, Bakı, Azərbaycan</span>
                        </li>
                        <li>
                            <FaPhone className="contact-icon" />
                            {/* 3. Telefon nömrəsini burada dəyişin */}
                            <span>+994 50 603 72 22</span>
                        </li>
                        <li>
                            <FaEnvelope className="contact-icon" />
                            {/* 4. E-poçt ünvanını burada dəyişin */}
                            <span>hacizadeataxann@gmail.com</span>
                        </li>
                    </ul>
                    
                    <div className="contact-map">
                        {/* 5. XƏRİTƏNİ DƏYİŞMƏK ÜÇÜN: */}
                        {/* a. Google Maps-də istədiyiniz ünvanı tapın. */}
                        {/* b. "Share" -> "Embed a map" seçin. */}
                        {/* c. "Copy HTML" düyməsinə basın və src="..." hissəsini aşağıdakı ilə əvəz edin. */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.205424647481!2d49.86289597686297!3d40.404299771441536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d4fe10b1b3d%3A0x8ae39842506a69aa!2s111%20Fatali%20Khan%20Khoyski%2C%20Baku%201052!5e0!3m2!1sen!2saz!4v1751043670370!5m2!1sen!2saz"
                            width="100%"
                            height="250"
                            style={{ border: 0, borderRadius: 'var(--border-radius)' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
