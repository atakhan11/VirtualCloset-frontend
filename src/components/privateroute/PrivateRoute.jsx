import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectUser } from '../../redux/reducers/userSlice'; // Bu yolun düzgünlüyünü yoxlayın

const PrivateRoute = () => {
    // İstifadəçi məlumatını Redux store-dan götürürük
    const userInfo = useSelector(selectUser); 

    // Əgər istifadəçi məlumatı varsa (yəni istifadəçi daxil olubsa),
    // o zaman bu route-a aid olan "övlad" komponenti render edirik.
    // <Outlet />, Router.jsx-də <PrivateRoute> içindəki <Route>-ları təmsil edir.
    // Əgər istifadəçi daxil olmayıbsa, onu /login səhifəsinə yönləndiririk.
    return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
