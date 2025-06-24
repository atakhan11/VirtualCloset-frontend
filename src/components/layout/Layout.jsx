// components/layout/Layout.jsx

import React from 'react';
import { useSelector } from 'react-redux'; // 1. useSelector-u import edirik
import { Outlet } from 'react-router-dom';

// Komponentlərinizi düzgün yollardan import edin
import Header from '../header/Header'; 
import Footer from '../footer/Footer';

// Redux selector-unu import edirik
import { selectUser } from '../../redux/reducers/userSlice'; // Fayl yolunu öz proyektinizə uyğunlaşdırın
import Chat from '../chat/Chat';

const Layout = () => {
    // 2. Redux store-dan cari user məlumatını götürürük
    const user = useSelector(selectUser);

    return (
        <>
            {/* 3. "user" məlumatını Header-a prop kimi ötürürük */}
            <Header user={user} />
            
            <main>
                {/* <Outlet /> komponenti Router.jsx-dəki sub-route-ları (Login, Register və s.) burada render edir */}
                <Outlet />
            </main>
            {user && <Chat />}
            <Footer />
        </>
    )
}

export default Layout;