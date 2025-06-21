import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserListPage.css';


// Redaktə pəncərəsi (modal) üçün köməkçi komponent
const EditUserModal = ({ user, onClose, onSave }) => {
    // Bu komponent istifadəçidən alınan ilkin datanı state-ə götürür
    const [userData, setUserData] = useState({ 
        name: user.name, 
        email: user.email, 
        role: user.role 
    });

    // Formdakı hər hansı bir input dəyişdikdə state-i yeniləyir
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({ ...prevState, [name]: value }));
    };

    // Form submit olunduqda ana komponentdəki onSave funksiyasını çağırır
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user._id, userData);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>İstifadəçini Redaktə Et</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ad</label>
                        <input type="text" name="name" value={userData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={userData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Rol</label>
                        <select name="role" value={userData.role} onChange={handleChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
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
const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            // Tokeni brauzerin yaddaşından götürürük
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Autentifikasiya tokeni tapılmadı. Zəhmət olmasa, yenidən daxil olun.");
                setLoading(false);
                return;
            }

            // Hər qorunan sorğu üçün tokeni başlıqda göndərmək üçün konfiqurasiya
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            try {
                const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
                setUsers(data);
            } catch (err) {
                setError('Məlumatları yükləmək mümkün olmadı. Admin icazəniz olduğundan əmin olun.');
                console.error("İstifadəçiləri yükləyərkən xəta:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []); // Bu effekt yalnız bir dəfə, komponent yüklənəndə işə düşür

    const handleDelete = async (userId) => {
        if (window.confirm('Bu istifadəçini silməyə əminsinizmi?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                await axios.delete(`http://localhost:5000/api/users/${userId}`, config);
                
                setUsers(users.filter(user => user._id !== userId))
                alert('İstifadəçi uğurla silindi.');
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Server xətası';
                console.error("İstifadəçini silərkən xəta baş verdi:", err);
                alert(`Xəta: ${errorMessage}`);
            }
        }
    };
    
    const handleUpdate = async (userId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data: updatedUser } = await axios.put(`http://localhost:5000/api/users/${userId}`, updatedData, config);
            
            setUsers(users.map(user => user._id === userId ? updatedUser : user));
            setIsModalOpen(false);
            setCurrentUser(null);
            alert('İstifadəçi məlumatları yeniləndi.');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Server xətası';
            console.error("İstifadəçini yeniləyərkən xəta baş verdi:", err);
            alert(`Xəta: ${errorMessage}`);
        }
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    if (loading) return <p>Yüklənir...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className='user-list-page'>
            <h1>İstifadəçilər</h1>
            <table className='styled-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>AD</th>
                        <th>EMAIL</th>
                        <th>ADMİN?</th>
                        <th>ƏMƏLİYYATLAR</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? users.map(user => (
                        <tr key={user._id}>
                            <td>{user._id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role === 'admin' ? 'Bəli' : 'Xeyr'}</td>
                            <td className='action-buttons'>
                                <button className="edit-btn" onClick={() => openEditModal(user)}>Redaktə Et</button>
                                <button className="delete-btn" onClick={() => handleDelete(user._id)}>Sil</button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">Heç bir istifadəçi tapılmadı.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {isModalOpen && (
                <EditUserModal 
                    user={currentUser} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleUpdate}
                />
            )}
        </div>
    );
};

export default UserListPage;