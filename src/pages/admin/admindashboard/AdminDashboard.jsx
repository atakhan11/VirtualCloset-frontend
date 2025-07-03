import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { selectToken } from '../../../redux/reducers/userSlice';
import styles from './AdminDashboard.module.css';

import { FaUsers, FaTshirt } from 'react-icons/fa';

import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale'; 

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]); 
    const [loading, setLoading] = useState(true);
    const token = useSelector(selectToken);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    useEffect(() => {
    const getStats = async () => {
        setLoading(true); 
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            
            const { data: statsData } = await axios.get('/api/admin/stats', config);
            setStats(statsData);
            
            const { data: activitiesData } = await axios.get('/api/admin/activities', config);
            setActivities(activitiesData);

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    getStats();
}, [token]);

    if (loading) return <p>Loading...</p>;

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>Admin Panel</h1>

            <div className={styles.summaryCards}>
                <div className={styles.card}>
                    <div className={styles.icon} style={{ backgroundColor: '#007bff' }}><FaUsers /></div>
                    <div>
                        <h3>{stats?.userCount || 0}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.icon} style={{ backgroundColor: '#28a745' }}><FaTshirt /></div>
                    <div>
                        <h3>{stats?.clothesCount || 0}</h3>
                        <p>Uploaded Clothes</p>
                    </div>
                </div>
            </div>

            <div className={styles.quickNav}>
                <Link to="/admin/users" className={styles.navLink}>
                    <FaUsers className={styles.navIcon} />
                    <span>Manage Users</span>
                </Link>
                <Link to="/admin/clothes" className={styles.navLink}>
                    <FaTshirt className={styles.navIcon} />
                    <span>View Clothes</span>
                </Link>
            </div>

            <div className={styles.chartsRow}>
                
                <div className={styles.chartContainer}>
                    <h2 style={{marginBottom: '1rem'}}>New Signups</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.signupsLast7Days}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="New Users"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles.chartContainer}>
                    <h2 style={{marginBottom: '1rem'}}>Clothing Categories</h2>
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
                                    dataKey="value" 
                                    nameKey="name" 
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {stats.categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} items`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{textAlign: 'center', paddingTop: '50px'}}>No category data found.</p>
                    )}
                </div>
            </div>
            <div className={styles.activitySection}>
                <h2 style={{marginBottom: '1rem'}}>Recent Activities</h2>
                <ul className={styles.activityFeed}>
                    {activities.length > 0 ? activities.map(activity => (
                        <li key={activity._id} className={styles.activityItem}>
                            <div className={styles.activityText}>
                                <strong>{activity.user ? activity.user.name : 'Unknown user'}</strong>
                                {` ${activity.message}`}
                            </div>
                            <div className={styles.activityTime}>
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: enUS })}
                            </div>
                        </li>
                    )) : (
                        <p>No activities found.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;