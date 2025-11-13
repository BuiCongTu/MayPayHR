import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ role }) => {
    return (
        <div>
            <Navbar role={role} />
            <main className="layout-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;