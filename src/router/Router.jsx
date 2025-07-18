import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'; 

import Layout from '../components/layout/Layout.jsx';
import PrivateRoute from '../components/privateroute/PrivateRoute.jsx'; 
import AdminRoute from '../components/adminroute/AdminRoute.jsx';

import Features from '../pages/features/Features.jsx';
import SignupPage from '../pages/signup/SignUp.jsx';
import LoginPage from '../pages/login/Login.jsx';
import AuthSuccessPage from '../pages/auth/AuthSuccessPage.jsx';
import ForgotPasswordPage from '../pages/password/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/password/ResetPasswordPage.jsx';
import ProfilePage from '../pages/profile/ProfilePage.jsx';

import AdminDashboard from '../pages/admin/admindashboard/AdminDashboard.jsx';
import UserListPage from '../pages/admin/userlist/UserListPage.jsx';
import AllClothesScreen from '../pages/admin/allclothes/AllClothes.jsx';
import MyWardrobePage from '../pages/userwardrobe/MyWardrobePage.jsx';
import OutfitPlannerPage from '../pages/outfit-planner/OutfitPlannerPage.jsx';
import OutfitDetailPage from '../pages/outfit-detail/OutfitDetailPage.jsx';
import OutfitCalendarPage from '../pages/outfit-calendar/OutfitCalendarPage.jsx';
import WishlistPage from '../pages/wishlist/WishlistPage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import HomePage from '../pages/home/Home.jsx';
import Contact from '../pages/contact/Contact.jsx';
import ScrollToTop from '../components/scroll-to-top/ScrollToTop.jsx';
import ChatPage from '../pages/chat/ChatPage.jsx';
import DonatePage from '../pages/donatepage/DonatePage.jsx';
import AboutPage from '../pages/about/AboutPage.jsx';
import DonationSuccessPage from '../pages/donatesucces/DonationSuccessPage.jsx';


const Router = () => {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        {/* Public və Layout-a bağlı Route-lar */}
        <Route path="/" element={<Layout />}>
          {/* Public olanlar */}
          <Route index element={<HomePage />} />
          <Route path='features' element={<Features />} />
          <Route path='about' element={<AboutPage />} />
          <Route path='contact' element={<Contact />} />
          <Route path='register' element={<SignupPage />} />
          <Route path='login' element={<LoginPage />} />
          <Route path="/auth-success" element={<AuthSuccessPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path='donate' element={<DonatePage />} />
          <Route path="/donation-success" element={<DonationSuccessPage />} />
          {/* === ADİ İSTİFADƏÇİLƏR ÜÇÜN QORUNAN ROUTE-LAR === */}
          <Route path='' element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* YENİ ROUTE BURADA ƏLAVƏ EDİLDİ */}
            <Route path="/my-wardrobe" element={<MyWardrobePage />} />
            <Route path="/outfit-creator" element={<OutfitPlannerPage />} />
            <Route path="/outfits/:id" element={<OutfitDetailPage />} />
            <Route path="/calendar" element={<OutfitCalendarPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/chat" element={<ChatPage />} /> 
            <Route path="/chat/:conversationId" element={<ChatPage />} /> 
          </Route>
        </Route>
        
        {/* Admin üçün Qorunan Route-lar */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboard />} /> 
          <Route path="users" element={<UserListPage />} />
          <Route path="clothes" element={<AllClothesScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
