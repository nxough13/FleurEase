import React, { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Box, Card, CardContent, Typography, IconButton, Avatar, Chip } from '@mui/material';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navigate = useNavigate();

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

    const columns = [
        {
            field: 'avatar',
            headerName: 'Avatar',
            width: 100,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Avatar
                        src={params.value}
                        alt="Avatar"
                        sx={{
                            width: 50,
                            height: 50,
                            border: '2px solid #6b46c1'
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 200,
            renderCell: (params) => (
                <div style={{ fontWeight: '500', color: '#6b46c1' }}>
                    {params.value}
                </div>
            )
        },
        {
            field: 'email',
            headerName: 'Email',
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
                        All Users
                    </Typography>
                </Box>

                {loading ? (
                    <Loader />
                ) : (
                    <Card sx={{
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        border: '2px solid #e9d5ff',
                        width: '100%'
                    }}>
                        <CardContent sx={{ padding: '24px' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[5, 10, 20, 50]}
                                disableSelectionOnClick
                                autoHeight
                                rowHeight={70}
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-cell': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderBottom: '1px solid #f0f0f0'
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
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
