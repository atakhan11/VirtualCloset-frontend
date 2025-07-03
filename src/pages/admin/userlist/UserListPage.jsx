import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserListPage.css';

const EditUserModal = ({ user, onClose, onSave }) => {
    const [userData, setUserData] = useState({ 
        name: user.name, 
        email: user.email, 
        role: user.role 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user._id, userData);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Edit User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={userData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={userData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={userData.role} onChange={handleChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-primary">Save</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication token not found. Please log in again.");
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            try {
                const { data } = await axios.get(`http://localhost:5000/api/admin/users?search=${searchTerm}`, config);
                setUsers(data);
            } catch (err) {
                setError('Failed to load data. Make sure you have admin permissions.');
                console.error("Error loading users:", err);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                await axios.delete(`http://localhost:5000/api/users/${userId}`, config);
                
                setUsers(users.filter(user => user._id !== userId))
                alert('User deleted successfully.');
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Server error';
                console.error("Error deleting user:", err);
                alert(`Error: ${errorMessage}`);
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
            alert('User information updated successfully.');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Server error';
            console.error("Error updating user:", err);
            alert(`Error: ${errorMessage}`);
        }
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className='user-list-page'>
            <h1>Users</h1>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            
            <table className='styled-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>ADMIN?</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', color: 'red' }}>{error}</td>
                        </tr>
                    ) : users.length > 0 ? (
                        users.map(user => (
                            <tr key={user._id}>
                                <td>{user._id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role === 'admin' ? 'Yes' : 'No'}</td>
                                <td className='action-buttons'>
                                    <button className="edit-btn" onClick={() => openEditModal(user)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td>
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