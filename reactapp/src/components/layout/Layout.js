import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Container, Box } from '@mui/material';

const Layout = ({ role }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar role={role} />
            <Container component="main" maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
                <Outlet />
            </Container>
        </Box>
    );
};

export default Layout;