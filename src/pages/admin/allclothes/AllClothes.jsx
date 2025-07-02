import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllClothes.css';

// Redaktə pəncərəsi (modal) üçün köməkçi komponent
const EditClothModal = ({ cloth, onClose, onSave }) => {
    const [clothData, setClothData] = useState({ 
        name: cloth.name, 
        category: cloth.category, 
        season: cloth.season || '' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClothData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(cloth._id, clothData);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Geyimi Redaktə Et</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ad</label>
                        <input type="text" name="name" value={clothData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Kateqoriya</label>
                        <input type="text" name="category" value={clothData.category} onChange={handleChange} required />
                    </div>
                     <div className="form-group">
                        <label>Mövsüm</label>
                        <input type="text" name="season" value={clothData.season} onChange={handleChange} />
                    </div>
                    {/* Digər sahələr üçün də inputlar əlavə edə bilərsiniz */}
                    <div className="modal-actions">
                        <button type="submit" className="btn-primary">Yadda Saxla</button>
                        <button type="button" onClick={onClose}>Ləğv Et</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Ana komponent
const AllClothesScreen = () => {
    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // === Redaktə Modal üçün State-lər ===
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentClothToEdit, setCurrentClothToEdit] = useState(null);

    useEffect(() => {
        const fetchAllClothes = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Autentifikasiya tokeni tapılmadı.");
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const { data } = await axios.get(`http://localhost:5000/api/clothes/all?search=${searchTerm}`, config); 
                setClothes(data);
                setError('');
            } catch (err) {
                setError('Geyimləri yükləmək mümkün olmadı.');
                console.error("Bütün geyimləri yükləyərkən xəta:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllClothes();
           const delayDebounceFn = setTimeout(() => {
            fetchAllClothes();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDeleteCloth = async (clothId) => {
        if(window.confirm('Bu geyimi silməyə əminsinizmi?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/clothes/${clothId}`, config);
                setClothes(clothes.filter(c => c._id !== clothId));
                alert('Geyim uğurla silindi.');
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Server xətası';
                alert(`Xəta: ${errorMessage}`);
            }
        }
    };

    // === Redaktə Modalını idarə edən funksiyalar ===
    const openEditModal = (cloth) => {
        setCurrentClothToEdit(cloth);
        setIsEditModalOpen(true);
    };

    const handleUpdateCloth = async (clothId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: updatedCloth } = await axios.put(`http://localhost:5000/api/clothes/${clothId}`, updatedData, config);
            
            // Siyahını yeniləyirik
            setClothes(clothes.map(c => c._id === clothId ? updatedCloth : c));
            
            // Modalı bağlayırıq
            setIsEditModalOpen(false);
            setCurrentClothToEdit(null);
            alert('Geyim məlumatları yeniləndi.');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Server xətası';
            alert(`Xəta: ${errorMessage}`);
        }
    };



    return (
        <div className="all-clothes-page">
            <h1>Bütün Geyimlər</h1>

            {/* YENİ: Axtarış İnputu */}
            <div className="search-container" style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Ad və ya kateqoriya ilə axtar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input" // Eyni stili istifadə edə bilərsiniz
                />
            </div>

            {/* Render məntiqini burada idarə edirik */}
            <div className="clothes-grid">
                {loading ? (
                    <p>Yüklənir...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : clothes.length > 0 ? (
                    clothes.map((cloth) => (
                        <div key={cloth._id} className="cloth-card">
                            {/* DİQQƏT: Şəkil URL-nin düzgün olduğundan əmin olun (localhost olmadan) */}
                            <img src={cloth.image} alt={cloth.name} />
                            <h4>{cloth.name}</h4>
                            <p>Kateqoriya: {cloth.category}</p>
                            <p>Sahibi: {cloth.user ? cloth.user.name : 'Naməlum'}</p>
                            <div className='action-buttons'>
                                <button className="edit-btn" onClick={() => openEditModal(cloth)}>Redaktə Et</button>
                                <button className="delete-btn" onClick={() => handleDeleteCloth(cloth._id)}>Sil</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Heç bir geyim tapılmadı.</p>
                )}
            </div>

            {/* Modal olduğu kimi qalır */}
            {isEditModalOpen && (
                <EditClothModal
                    cloth={currentClothToEdit}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleUpdateCloth}
                />
            )}
        </div>
    );
};

export default AllClothesScreen;