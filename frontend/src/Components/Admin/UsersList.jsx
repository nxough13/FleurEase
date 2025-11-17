import React, { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { 
    Box, Card, CardContent, Typography, IconButton, Avatar, Chip, 
    Button, Tooltip, Paper, Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    PersonAdd as PersonAddIcon,
    Search as SearchIcon
} from '@mui/icons-material';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);

    const navigate = useNavigate();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 900) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, config);
            setUsers(data.users);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading users');
            setLoading(false);
        }
    };

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
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting user');
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        @{params.row.username || params.value.split(' ').join('').toLowerCase()}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 2,
            minWidth: 200,
            width: 250
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value.toUpperCase()}
                    size="small"
                    sx={{
                        backgroundColor: params.value === 'admin' ? '#e9d5ff' : '#d4edda',
                        color: params.value === 'admin' ? '#6b46c1' : '#155724',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                    }}
                />
            )
        },
        {
            field: 'isSuspended',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value ? '🚫 SUSPENDED' : '✓ ACTIVE'}
                    size="small"
                    sx={{
                        backgroundColor: params.value ? '#f8d7da' : '#d4edda',
                        color: params.value ? '#721c24' : '#155724',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                    }}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: 'Joined Date',
            width: 180,
            renderCell: (params) => (
                <span style={{ color: '#666' }}>
                    {new Date(params.value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <IconButton
                        onClick={() => navigate(`/admin/user/${params.row.id}`)}
                        size="small"
                        sx={{
                            backgroundColor: '#6b46c1',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#5a3a9e',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                        title="Edit"
                    >
                        <i className="fa fa-pencil"></i>
                    </IconButton>

                    <IconButton
                        onClick={() => navigate(`/admin/user/${params.row.id}/details`)}
                        size="small"
                        sx={{
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#138496',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                        title="View Details"
                    >
                        <i className="fa fa-eye"></i>
                    </IconButton>

                    <IconButton
                        onClick={() => deleteUser(params.row.id)}
                        size="small"
                        sx={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#c82333',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                        title="Delete"
                    >
                        <i className="fa fa-trash"></i>
                    </IconButton>
                </Box>
            )
        }
    ];

    const rows = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuspended: user.isSuspended || false,
        avatar: user.avatar?.url || 'https://via.placeholder.com/50',
        createdAt: user.createdAt
    }));

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Fragment>
            <MetaData title={'All Users'} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <Box sx={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '24px',
                minHeight: '100vh',
                backgroundColor: '#f5f7fa',
                width: sidebarOpen ? 'calc(100% - 250px)' : '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <Typography variant="h4" sx={{ color: '#6b46c1', fontWeight: 'bold' }}>
                        <i className="fa fa-users mr-2"></i>
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
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ 
                                position: 'relative',
                                minWidth: '250px',
                                flex: 1
                            }}>
                                <Box sx={{ 
                                    position: 'absolute', 
                                    left: 12, 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <SearchIcon fontSize="small" />
                                </Box>
                                <Input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={{
                                        width: '100%',
                                        padding: '10px 16px 10px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#fff',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#8b5cf6',
                                            boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2)'
                                        }
                                    }}
                                />
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
                                        backgroundColor: '#f8f9fa',
                                        color: '#6b46c1',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        borderBottom: '2px solid #e9d5ff'
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: '#f8f9fa'
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: '2px solid #e9d5ff'
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Fragment>
    );
};

export default UsersList;
