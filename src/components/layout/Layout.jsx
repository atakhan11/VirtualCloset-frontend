import React from 'react';
import { useSelector } from 'react-redux'; 
import { Outlet } from 'react-router-dom';
import Header from '../header/Header'; 
import Footer from '../footer/Footer';
import { selectUser } from '../../redux/reducers/userSlice'; 
import Chat from '../chat/Chat';

const Layout = () => {
    const user = useSelector(selectUser);
    return (
        <>
            <Header user={user} />
            <main>
                <Outlet />
            </main>
            {user && <Chat />}
            <Footer />
        </>
    )
}

export default Layout;