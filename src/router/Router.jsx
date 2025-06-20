import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from '../components/layout/Layout.jsx'
import Features from '../pages/features/Features.jsx'
import SignupPage from '../pages/signup/SignUp.jsx'
import LoginPage from '../pages/login/Login.jsx'
import AuthSuccessPage from '../pages/auth/AuthSuccessPage.jsx'
import AdminRoute from '../components/adminroute/AdminRoute.jsx'; // <-- YENİ
import AdminDashboard from '../pages/admin/admindashboard/AdminDashboard.jsx'; // <-- YENİ
import UserListPage from '../pages/admin/userlist/UserListPage.jsx'; // <-- YENİ
import ForgotPasswordPage from '../pages/password/ForgotPasswordPage.jsx'
import ResetPasswordPage from '../pages/password/ResetPasswordPage.jsx'
import AllClothesScreen from '../pages/admin/allclothes/AllClothes.jsx'

const Router = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
               <Route path='features' element={<Features />} />
               <Route path='register' element={<SignupPage />} />
               <Route path='login' element={<LoginPage />} />
               <Route path="/auth-success" element={<AuthSuccessPage />} />
               <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
               <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>
            <Route path="/admin" element={<AdminRoute />}>
                {/* /admin yazanda AdminDashboard açılacaq */}
                <Route index element={<AdminDashboard />} /> 
                {/* /admin/users yazanda UserListPage açılacaq */}
                <Route path="users" element={<UserListPage />} />
                <Route path="clothes" element={<AllClothesScreen />} />
                {/* Gələcəkdə digər admin səhifələrini bura əlavə edə bilərsiniz */}
            </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default Router