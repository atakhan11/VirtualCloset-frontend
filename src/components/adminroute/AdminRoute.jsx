import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectUser } from '../../redux/reducers/userSlice'; // user selector-u

const AdminRoute = () => {
    const user = useSelector(selectUser);

    // Əgər istifadəçi varsa VƏ rolu "admin"-dirsə,
    // o zaman sub-route-ları (Outlet) göstər.
    // Əks halda, login səhifəsinə yönləndir.
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;