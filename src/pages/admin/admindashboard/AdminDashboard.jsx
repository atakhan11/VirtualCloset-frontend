// src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { selectToken } from '../../../redux/reducers/userSlice';
import styles from './AdminDashboard.module.css';

// Ikonlar
import { FaUsers, FaTshirt, FaChartBar } from 'react-icons/fa';

// Qrafik üçün
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = useSelector(selectToken);

    useEffect(() => {
        const getStats = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                // Bu endpoint-i növbəti mərhələdə backend-də yaradacağıq
                const { data } = await axios.get('/api/admin/stats', config);
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Statistika yüklənə bilmədi", error);
                setLoading(false);
            }
        };

        getStats();
    }, [token]);

    if (loading) return <p>Yüklənir...</p>;

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>İdarəetmə Paneli</h1>

            {/* Statistik Kartlar */}
            <div className={styles.summaryCards}>
                <div className={styles.card}>
                    <div className={styles.icon} style={{ backgroundColor: '#007bff' }}><FaUsers /></div>
                    <div>
                        <h3>{stats?.userCount || 0}</h3>
                        <p>Ümumi İstifadəçi</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.icon} style={{ backgroundColor: '#28a745' }}><FaTshirt /></div>
                    <div>
                        <h3>{stats?.clothesCount || 0}</h3>
                        <p>Yüklənmiş Geyim</p>
                    </div>
                </div>
                {/* Digər statistikaları bura əlavə edə bilərsiniz */}
            </div>

            {/* Sürətli Keçidlər */}
            <div className={styles.quickNav}>
                <Link to="/admin/users" className={styles.navLink}>
                    <FaUsers className={styles.navIcon} />
                    <span>İstifadəçiləri İdarə Et</span>
                </Link>
                {/* Gələcəkdə yaradılacaq səhifələrə linklər */}
                <Link to="/admin/clothes" className={styles.navLink}>
                    <FaTshirt className={styles.navIcon} />
                    <span>Geyimlərə Bax</span>
                </Link>
            </div>

            {/* Qrafik */}
            <div className={styles.chartContainer} style={{marginTop: '3rem', background: '#fff', padding: '1rem', borderRadius: '10px'}}>
                <h2 style={{marginBottom: '1rem'}}>Yeni Qeydiyyatlar</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.signupsLast7Days}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Yeni İstifadəçilər"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminDashboard;