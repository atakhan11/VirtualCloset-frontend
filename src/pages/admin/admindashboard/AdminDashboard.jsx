import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { selectToken } from '../../../redux/reducers/userSlice';
import styles from './AdminDashboard.module.css';

// Ikonlar
import { FaUsers, FaTshirt } from 'react-icons/fa';

// YENİ: PieChart üçün lazım olanları da import edirik
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale'; // Azərbaycan dili üçün
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]); 
    const [loading, setLoading] = useState(true);
    const token = useSelector(selectToken);

    // YENİ: PieChart üçün rəng palitrası
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

   useEffect(() => {
    // Funksiyanın adını daha ümumi edək: getData
    const getStats = async () => {
        // setLoading(true) funksiyanın əvvəlində olmalıdır
        setLoading(true); 
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            
            // 1. Statistika sorğusu
            const { data: statsData } = await axios.get('/api/admin/stats', config);
            setStats(statsData);
            
            // 2. Hərəkətlər (Activities) sorğusu
            const { data: activitiesData } = await axios.get('/api/admin/activities', config);
            setActivities(activitiesData);

        } catch (error) {
            // Hər hansı bir sorğu xəta versə, bura düşəcək
            console.error("Dashboard məlumatları yüklənə bilmədi", error);
        } finally {
            setLoading(false);
        }
    };

    // Funksiyanı çağırırıq
    getStats();
}, [token]);

    if (loading) return <p>Yüklənir...</p>;

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>İdarəetmə Paneli</h1>

            {/* Statistik Kartlar (dəyişiklik yoxdur) */}
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
            </div>

            {/* Sürətli Keçidlər (dəyişiklik yoxdur) */}
            <div className={styles.quickNav}>
                <Link to="/admin/users" className={styles.navLink}>
                    <FaUsers className={styles.navIcon} />
                    <span>İstifadəçiləri İdarə Et</span>
                </Link>
                <Link to="/admin/clothes" className={styles.navLink}>
                    <FaTshirt className={styles.navIcon} />
                    <span>Geyimlərə Bax</span>
                </Link>
            </div>

            {/* DƏYİŞİKLİK: Qrafikləri əhatə edən yeni konteyner */}
            <div className={styles.chartsRow}>
                
                {/* Mövcud "Yeni Qeydiyyatlar" qrafiki */}
                <div className={styles.chartContainer}>
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

                {/* YENİ: Geyim Kateqoriyaları üçün PieChart */}
                <div className={styles.chartContainer}>
                    <h2 style={{marginBottom: '1rem'}}>Geyim Kateqoriyaları</h2>
                    {stats?.categoryDistribution && stats.categoryDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
                                <Pie
                                    data={stats.categoryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value" // Backend-dən gələn 'value'
                                    nameKey="name"  // Backend-dən gələn 'name'
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {stats.categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} ədəd`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{textAlign: 'center', paddingTop: '50px'}}>Kateqoriya məlumatı tapılmadı.</p>
                    )}
                </div>
            </div>
            <div className={styles.activitySection}>
                <h2 style={{marginBottom: '1rem'}}>Son Hərəkətlər</h2>
                <ul className={styles.activityFeed}>
                    {activities.length > 0 ? activities.map(activity => (
                        <li key={activity._id} className={styles.activityItem}>
                            <div className={styles.activityText}>
                                <strong>{activity.user ? activity.user.name : 'Naməlum istifadəçi'}</strong>
                                {` ${activity.message}`}
                            </div>
                            <div className={styles.activityTime}>
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: az })}
                            </div>
                        </li>
                    )) : (
                        <p>Heç bir hərəkət tapılmadı.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;