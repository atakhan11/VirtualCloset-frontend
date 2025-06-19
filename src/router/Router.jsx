import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from '../components/layout/Layout.jsx'
import Features from '../pages/features/Features.jsx'
import SignupPage from '../pages/signup/SignUp.jsx'
import LoginPage from '../pages/login/Login.jsx'
import AuthSuccessPage from '../pages/auth/AuthSuccessPage.jsx'

const Router = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
               <Route path='features' element={<Features />} />
               <Route path='register' element={<SignupPage />} />
               <Route path='login' element={<LoginPage />} />
               <Route path="/auth-success" element={<AuthSuccessPage />} />
            </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default Router