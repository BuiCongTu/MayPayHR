import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const ErrorPage = ({
                       code = 403,
                       title = "Access Denied",
                       message = "You do not have permission to access this page.",
                       showHomeButton = true
                   }) => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ mt: 10 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 2
                }}
            >
                <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />

                <Typography variant="h2" color="text.secondary" fontWeight="bold" gutterBottom>
                    {code}
                </Typography>

                <Typography variant="h5" color="text.primary" gutterBottom fontWeight="bold">
                    {title}
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                    {message}
                </Typography>

                {showHomeButton && (
                    <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        Back to Dashboard
                    </Button>
                )}
            </Paper>
        </Container>
    );
};

export default ErrorPage;