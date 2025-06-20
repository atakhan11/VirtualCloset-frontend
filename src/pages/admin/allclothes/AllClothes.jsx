import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllClothesScreen = () => {
    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllClothes = async () => {
            // Tokeni brauzerin yaddaşından götürürük
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Autentifikasiya tokeni tapılmadı. Zəhmət olmasa, admin olaraq yenidən daxil olun.");
                setLoading(false);
                return;
            }

            // Hər qorunan sorğu üçün tokeni başlıqda göndərmək üçün konfiqurasiya
            const config = {
                headers: {
                    'Content-Type': 'application/json', // Bu başlığı əlavə etmək yaxşı praktikadır
                    Authorization: `Bearer ${token}`
                }
            };

            try {
                setLoading(true);
                // 1. BÜTÜN geyimləri gətirən admin endpoint-ini birbaşa axios ilə çağırırıq
                const { data } = await axios.get('http://localhost:5000/api/clothes/all', config); 
                
                setClothes(data);
            } catch (err) {
                setError('Geyimləri yükləmək mümkün olmadı. Admin icazəniz olduğundan əmin olun.');
                console.error("Bütün geyimləri yükləyərkən xəta:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllClothes();
    }, []); // Boş massiv, bu effektin yalnız komponent yüklənəndə bir dəfə işə düşməsini təmin edir

    const handleDeleteCloth = async (clothId) => {
        if(window.confirm('Bu geyimi silməyə əminsinizmi?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // 2. Admin olaraq geyimi birbaşa axios ilə silirik
                await axios.delete(`http://localhost:5000/api/clothes/${clothId}`, config);
                
                // UI-nı dərhal yeniləmək üçün geyimi siyahıdan çıxarırıq
                setClothes(clothes.filter(c => c._id !== clothId));
                alert('Geyim uğurla silindi.');
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Server xətası';
                console.error("Geyimi silərkən xəta baş verdi:", err);
                alert(`Xəta: ${errorMessage}`);
            }
        }
    }

    if (loading) return <p>Yüklənir...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="all-clothes-page">
            <h1>Bütün Geyimlər ({clothes.length} ədəd)</h1>
            <div className="clothes-grid">
                {clothes.length > 0 ? clothes.map((cloth) => (
                    <div key={cloth._id} className="cloth-card">
                        {/* Şəkillərin düzgün görünməsi üçün backend ünvanını əlavə edirik */}
                        <img src={`http://localhost:5000${cloth.image}`} alt={cloth.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        <h4>{cloth.name}</h4>
                        <p>Kateqoriya: {cloth.category}</p>
                        {/* populate() etdiyimiz üçün istifadəçi məlumatını göstərə bilirik */}
                        <p>Sahibi: {cloth.user ? cloth.user.name : 'Naməlum'}</p>
                        <div className='action-buttons'>
                            <button className="edit-btn">Redaktə Et</button>
                            <button className="delete-btn" onClick={() => handleDeleteCloth(cloth._id)}>Sil</button>
                        </div>
                    </div>
                )) : (
                    <p>Heç bir geyim tapılmadı.</p>
                )}
            </div>
        </div>
    );
};

export default AllClothesScreen;