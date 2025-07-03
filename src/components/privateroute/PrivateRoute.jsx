import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectUser } from '../../redux/reducers/userSlice'; 

const PrivateRoute = () => {
    const userInfo = useSelector(selectUser); 
    return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
