import React, { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import AdminHeader from '../Layout/AdminHeader';
import { motion } from 'framer-motion';
import { 
    Box, Card, CardContent, Typography, Grid, Avatar, Chip, 
    Button, IconButton, Tooltip, TextField, InputAdornment
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    PersonAdd as PersonAddIcon,
    Search as SearchIcon,
    Verified as VerifiedIcon,
    Block as BlockIcon
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
    const navigate = useNavigate();

    // Toggle sidebar
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth > 900);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                };
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, config);
                setUsers(data.users || []);
                setLoading(false);
            } catch (error) {
                toast.error('Error loading users');
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Delete user
    const deleteUser = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "This user will be permanently deleted!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#6b46c1',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                };
                await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, config);
                toast.success('User deleted successfully');
                setUsers(users.filter(user => user._id !== id));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting user');
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // DataGrid columns
    const columns = [
        {
            field: 'avatar',
            headerName: 'Avatar',
            flex: 0.7,
            minWidth: 80,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Avatar
                        src={params.value}
                        alt={params.row.name}
                        sx={{
                            width: 40,
                            height: 40,
                            border: '2px solid #8b5cf6',
                            bgcolor: '#f5f3ff'
                        }}
                    >
                        {params.row.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                </Box>
            )
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1.5,
            minWidth: 180,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body1" sx={{ 
                        fontWeight: '600', 
                        color: '#4c1d95',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        @{params.row.username || (params.value ? params.value.split(' ').join('').toLowerCase() : '')}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 2,
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'role',
            headerName: 'Role',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value?.toUpperCase()}
                    size="small"
                    sx={{
                        backgroundColor: params.value === 'admin' ? '#e9d5ff' : '#dbeafe',
                        color: params.value === 'admin' ? '#6b21a8' : '#1e40af',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        px: 1,
                        py: 0.5
                    }}
                />
            )
        },
        {
            field: 'isActive',
            headerName: 'Status',
            flex: 0.8,
            minWidth: 100,
            renderCell: (params) => (
                <Chip
                    icon={params.value ? <VerifiedIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                    label={params.value ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                        backgroundColor: params.value ? '#dcfce7' : '#fee2e2',
                        color: params.value ? '#166534' : '#991b1b',
                        '& .MuiChip-icon': {
                            color: params.value ? '#16a34a' : '#dc2626'
                        },
                        fontWeight: '500',
                        fontSize: '0.75rem',
                        px: 1
                    }}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit User">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/user/${params.row._id}`)}
                            sx={{
                                backgroundColor: '#e9d5ff',
                                color: '#7e22ce',
                                '&:hover': {
                                    backgroundColor: '#d8b4fe',
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                        <IconButton
                            size="small"
                            onClick={() => deleteUser(params.row._id)}
                            sx={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                '&:hover': {
                                    backgroundColor: '#fecaca',
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    if (loading) return <Loader />;

    return (
        <Fragment>
            <MetaData title="Users Management | Admin" />
            
            {/* Header */}
            <AdminHeader toggleSidebar={toggleSidebar} />
            
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            
            {/* Main Content */}
            <Box 
                component="main"
                sx={{
                    marginLeft: { xs: '0', md: sidebarOpen ? '280px' : '0' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: { xs: '16px', md: '24px' },
                    paddingTop: { xs: '80px', md: '32px' },
                    minHeight: '100vh',
                    backgroundColor: '#f8fafc',
                    width: '100%',
                    boxSizing: 'border-box',
                    overflowX: 'hidden'
                }}
            >
                <Box sx={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
                    {/* Page Header */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Box>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    color: '#1e293b', 
                                    fontWeight: '700',
                                    fontSize: { xs: '1.5rem', md: '2rem' },
                                    lineHeight: 1.2,
                                    background: 'linear-gradient(90deg, #6b46c1 0%, #8b5cf6 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'inline-block'
                                }}
                            >
                                User Management
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: '#64748b',
                                    mt: 0.5,
                                    fontSize: '0.95rem'
                                }}
                            >
                                Manage all users and their permissions
                            </Typography>
                        </Box>
                        
                        <Button
                            component={Link}
                            to="/admin/user/new"
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                borderRadius: '12px',
                                padding: '10px 20px',
                                textTransform: 'none',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                boxShadow: '0 4px 14px rgba(107, 70, 193, 0.25)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a3a9e 0%, #7c3aed 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(107, 70, 193, 0.35)'
                                },
                                transition: 'all 0.2s ease-in-out',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Add New User
                        </Button>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                color: 'white',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 25px -5px rgba(107, 70, 193, 0.4)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                        Total Users
                                    </Typography>
                                    <Typography variant="h4" sx={{ mt: 1, fontWeight: '700', fontSize: '1.75rem' }}>
                                        {users.length}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Box sx={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            padding: '2px 8px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backdropFilter: 'blur(4px)'
                                        }}>
                                            <span style={{ marginRight: '4px' }}>↑</span>
                                            <span>12% from last month</span>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        {/* Active Users */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                borderRadius: '16px',
                                background: 'white',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ 
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px'
                                        }}>
                                            <VerifiedIcon sx={{ color: '#10b981' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Active Users</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: '700', color: '#1e293b' }}>
                                                {users.filter(u => u.isActive).length}
                                                <Typography component="span" variant="body2" sx={{ color: '#10b981', ml: 1, fontWeight: '600' }}>
                                                    ({users.length > 0 ? Math.round((users.filter(u => u.isActive).length / users.length) * 100) : 0}%)
                                                </Typography>
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Admins */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                borderRadius: '16px',
                                background: 'white',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ 
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px'
                                        }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#8b5cf6"/>
                                                <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="#8b5cf6"/>
                                                <path d="M12 15.5C9.33 15.5 5.5 16.84 5.5 19.5V21H18.5V19.5C18.5 16.84 14.67 15.5 12 15.5ZM7.5 19.5C7.5 18.4 10 17 12 17C14 17 16.5 18.4 16.5 19.5V20H7.5V19.5Z" fill="#8b5cf6"/>
                                            </svg>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Administrators</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: '700', color: '#1e293b' }}>
                                                {users.filter(u => u.role === 'admin').length}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* New This Month */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                borderRadius: '16px',
                                background: 'white',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ 
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px'
                                        }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z" fill="#3b82f6"/>
                                                <path d="M12 10.5C10.62 10.5 9.5 11.62 9.5 13C9.5 14.38 10.62 15.5 12 15.5C13.38 15.5 14.5 14.38 14.5 13C14.5 11.62 13.38 10.5 12 10.5ZM7.5 10.5C6.12 10.5 5 11.62 5 13C5 14.38 6.12 15.5 7.5 15.5C8.88 15.5 10 14.38 10 13C10 11.62 8.88 10.5 7.5 10.5ZM16.5 10.5C15.12 10.5 14 11.62 14 13C14 14.38 15.12 15.5 16.5 15.5C17.88 15.5 19 14.38 19 13C19 11.62 17.88 10.5 16.5 10.5Z" fill="#3b82f6"/>
                                            </svg>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">New This Month</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: '700', color: '#1e293b' }}>
                                                {Math.floor(users.length * 0.15)}
                                                <Typography component="span" variant="body2" sx={{ color: '#3b82f6', ml: 1, fontWeight: '600' }}>
                                                    (+15%)
                                                </Typography>
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* DataGrid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <Card sx={{ 
                            borderRadius: '16px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            mb: 4,
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ 
                                p: 3, 
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 2
                            }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: '600', 
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#6b46c1"/>
                                        <path d="M12 14.5C6.99 14.5 3 18.49 3 23.5C3 23.78 3.22 24 3.5 24H20.5C20.78 24 21 23.78 21 23.5C21 18.49 17.01 14.5 12 14.5Z" fill="#6b46c1"/>
                                    </svg>
                                    All Users
                                    <Chip 
                                        label={`${filteredUsers.length} users`} 
                                        size="small" 
                                        sx={{ 
                                            ml: 1, 
                                            backgroundColor: '#f0f9ff',
                                            color: '#0369a1',
                                            fontWeight: '600',
                                            fontSize: '0.7rem',
                                            height: '20px'
                                        }} 
                                    />
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        sx={{
                                            minWidth: '250px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                backgroundColor: 'white',
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#c7d2fe'
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8b5cf6',
                                                    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2)'
                                                }
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                padding: '8px 14px',
                                                fontSize: '0.875rem'
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: '#9ca3af' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        sx={{
                                            borderColor: '#e2e8f0',
                                            color: '#64748b',
                                            textTransform: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '500',
                                            '&:hover': {
                                                borderColor: '#c7d2fe',
                                                backgroundColor: '#f8fafc'
                                            }
                                        }}
                                    >
                                        Export
                                    </Button>
                                </Box>
                            </Box>
                            <Box sx={{ height: 'calc(100vh - 400px)', width: '100%' }}>
                                <DataGrid
                                    rows={filteredUsers}
                                    columns={columns}
                                    pageSize={pageSize}
                                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    disableSelectionOnClick
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f8fafc',
                                            borderBottom: '1px solid #f1f5f9',
                                            borderRadius: 0,
                                            '& .MuiDataGrid-columnHeaderTitle': {
                                                fontWeight: '600',
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                color: '#64748b'
                                            }
                                        },
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #f1f5f9',
                                            '&:focus, &:focus-within': {
                                                outline: 'none'
                                            }
                                        },
                                        '& .MuiDataGrid-row': {
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                backgroundColor: 'rgba(139, 92, 246, 0.04)'
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(139, 92, 246, 0.12)'
                                                }
                                            }
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            borderTop: '1px solid #f1f5f9',
                                            backgroundColor: '#f8fafc',
                                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                                marginBottom: 0,
                                                color: '#64748b',
                                                fontSize: '0.875rem'
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#64748b'
                                            }
                                        },
                                        '& .MuiDataGrid-virtualScroller': {
                                            '&::-webkit-scrollbar': {
                                                width: '8px',
                                                height: '8px'
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                backgroundColor: '#f1f5f9',
                                                borderRadius: '4px'
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                backgroundColor: '#cbd5e1',
                                                borderRadius: '4px',
                                                '&:hover': {
                                                    backgroundColor: '#94a3b8'
                                                }
                                            }
                                        }
                                    }}
                                    componentsProps={{
                                        pagination: {
                                            sx: {
                                                '& .MuiTablePagination-select': {
                                                    minHeight: 'auto',
                                                    padding: '4px 8px',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    '&:hover': {
                                                        borderColor: '#c7d2fe'
                                                    },
                                                    '&:focus': {
                                                        borderColor: '#8b5cf6',
                                                        boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)'
                                                    }
                                                },
                                                '& .MuiTablePagination-actions': {
                                                    '& button': {
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        padding: '4px',
                                                        '&:hover': {
                                                            backgroundColor: '#f8fafc',
                                                            borderColor: '#c7d2fe'
                                                        },
                                                        '&.Mui-disabled': {
                                                            opacity: 0.5,
                                                            borderColor: '#e2e8f0'
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Card>
                    </motion.div>
                </Box>
            </Box>
        </Fragment>
    );
};

export default UsersList;
