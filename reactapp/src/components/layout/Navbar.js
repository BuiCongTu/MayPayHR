import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const getNavLinks = (role) => {
    let links = [];

    switch (role) {

        //TODO: factory manager id, replace with actually role get from jwt
        case 199010002:
            links = [
                { title: 'Overtime Requests', path: '/overtime-request' },
            ];
            break;

        default:
            links = [{ title: 'Login', path: '/login' }];
    }

    return links;
};

const Navbar = ({ role }) => {
    const navLinks = getNavLinks(role);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    MayPayHR
                </Typography>

                {/* Links */}
                <Box>
                    {navLinks.map((link) => (
                        <Button
                            key={link.title}
                            color="inherit"
                            component={Link}
                            to={link.path}
                            sx={{ textDecoration: 'none' }}
                        >
                            {link.title}
                        </Button>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;