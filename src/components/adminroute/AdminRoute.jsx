import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectUser } from '../../redux/reducers/userSlice'; 

const AdminRoute = () => {
    const user = useSelector(selectUser);
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;