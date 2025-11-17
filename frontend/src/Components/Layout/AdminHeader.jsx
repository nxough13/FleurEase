import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import { Box, IconButton, Avatar, Menu, MenuItem, Typography, Divider } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Logout as LogoutIcon } from '@mui/icons-material';

const AdminHeader = ({ toggleSidebar }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('products')) return 'Products';
        if (path.includes('orders')) return 'Orders';
        if (path.includes('users')) return 'Users';
        if (path.includes('reviews')) return 'Reviews';
        return 'Admin Panel';
    };

    return (
        <Box 
            component="header"
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '70px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                zIndex: 1100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <IconButton 
                        onClick={toggleSidebar}
                        sx={{
                            marginRight: '16px',
                            backgroundColor: isHovered ? 'rgba(107, 70, 193, 0.1)' : 'transparent',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <MenuIcon sx={{ color: '#6b46c1' }} />
                    </IconButton>
                </motion.div>
                <Typography 
                    variant="h6" 
                    component="h1"
                    sx={{
                        color: '#2d3748',
                        fontWeight: '700',
                        fontSize: '1.4rem',
                        background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block'
                    }}
                >
                    {getPageTitle()}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <IconButton 
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        '&:hover': {
                            backgroundColor: 'rgba(107, 70, 193, 0.1)'
                        }
                    }}
                >
                    <NotificationsIcon sx={{ color: '#6b46c1' }} />
                </IconButton>
                
                <Box 
                    onClick={handleMenuOpen}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.03)'
                        }
                    }}
                >
                    <Avatar 
                        sx={{ 
                            width: '36px', 
                            height: '36px',
                            backgroundColor: 'rgba(107, 70, 193, 0.1)',
                            color: '#6b46c1',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        A
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#2d3748', fontWeight: '600', lineHeight: 1 }}>
                            Admin User
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.7rem' }}>
                            Administrator
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 2,
                    sx: {
                        width: 220,
                        borderRadius: '12px',
                        padding: '8px 0',
                        marginTop: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ padding: '0 16px 8px', marginBottom: '4px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: '600', color: '#2d3748' }}>
                        Admin User
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.7rem' }}>
                        admin@example.com
                    </Typography>
                </Box>
                <Divider sx={{ my: '4px' }} />
                <MenuItem 
                    onClick={handleLogout}
                    sx={{
                        padding: '8px 16px',
                        color: '#e53e3e',
                        '&:hover': {
                            backgroundColor: 'rgba(229, 62, 62, 0.04)'
                        }
                    }}
                >
                    <LogoutIcon sx={{ fontSize: '1.25rem', mr: '12px', color: 'inherit' }} />
                    <Typography variant="body2">Logout</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default AdminHeader;
