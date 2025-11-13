import React from 'react';
import {AppBar, Toolbar, Typography, Button, Box, IconButton} from '@mui/material';
import {Link, useLocation} from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const getNavLinks = (role) => {
    let links = [];

    switch (role) {

        //TODO: factory manager id, replace with actually role get from jwt
        case 199010002:
            links = [
                {title: 'Overtime Requests', path: '/overtime-request'},
                //mock up links
                {title: 'Dashboard', path: '/dashboard'},
                {title: 'Reports', path: '/reports'},
            ];
            break;

        //TODO: Add other roles here

        default:
            links = [];
    }

    return links;
};

const Navbar = ({role}) => {
    const navLinks = getNavLinks(role);
    // 2. Get the current location
    const location = useLocation();

    //TODO: authentication logic
    const isLoggedIn = role === 199010002;

    return (
        <AppBar position="static">
            <Toolbar variant="dense" sx={{justifyContent: 'space-between'}}>
                {/* TODO: Add Logo here */}
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    MayPayHR
                </Typography>

                <Box>
                    {isLoggedIn ? (
                        <>
                            <IconButton
                                color="inherit"
                                component={Link}
                                to="/settings"
                                title="Settings"
                            >
                                <SettingsIcon/>
                            </IconButton>
                            <IconButton
                                color="inherit"
                                component={Link}
                                to="/profile"
                                title="Profile"
                            >
                                <AccountCircleIcon/>
                            </IconButton>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/logout"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button
                            color="inherit"
                            component={Link}
                            to="/login"
                        >
                            Login
                        </Button>
                    )}
                </Box>
            </Toolbar>

            {isLoggedIn && navLinks.length > 0 && (
                <Toolbar
                    variant="dense"
                    sx={{
                        backgroundColor: 'primary.dark',
                        justifyContent: 'left',
                    }}
                >
                    <Box>
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;

                            return (
                                <Button
                                    key={link.title}
                                    color="inherit"
                                    component={Link}
                                    to={link.path}
                                    sx={{
                                        textDecoration: 'none',
                                        margin: '0 8px',
                                        ...(isActive && {
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            fontWeight: 'bold'
                                        }),
                                        fontSize: '13px',
                                    }}
                                >
                                    {link.title}
                                </Button>
                            );
                        })}
                    </Box>
                </Toolbar>
            )}
        </AppBar>
    );
};

export default Navbar;