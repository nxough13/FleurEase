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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <img
                        src={params.value}
                        alt="Avatar"
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #6b46c1'
                        }}
                    />
                </div>
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
                <span style={{
                    padding: '5px 12px',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    backgroundColor: params.value === 'admin' ? '#e9d5ff' : '#d4edda',
                    color: params.value === 'admin' ? '#6b46c1' : '#155724'
                }}>
                    {params.value.toUpperCase()}
                </span>
            )
        },
        {
            field: 'isSuspended',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <span style={{
                    padding: '5px 12px',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    backgroundColor: params.value ? '#f8d7da' : '#d4edda',
                    color: params.value ? '#721c24' : '#155724'
                }}>
                    {params.value ? '🚫 SUSPENDED' : '✓ ACTIVE'}
                </span>
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate(`/admin/user/${params.row.id}`)}
                        className="btn btn-sm"
                        style={{
                            backgroundColor: '#6b46c1',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '5px',
                            border: 'none'
                        }}
                        title="Edit"
                    >
                        <i className="fa fa-pencil"></i>
                    </button>

                    <button
                        onClick={() => navigate(`/admin/user/${params.row.id}/details`)}
                        className="btn btn-sm"
                        style={{
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '5px',
                            border: 'none'
                        }}
                        title="View Details"
                    >
                        <i className="fa fa-eye"></i>
                    </button>

                    <button
                        onClick={() => deleteUser(params.row.id)}
                        className="btn btn-sm"
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '5px',
                            border: 'none'
                        }}
                        title="Delete"
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
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

            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '20px',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa'
            }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 style={{ color: '#6b46c1', fontWeight: 'bold' }}>
                        <i className="fa fa-users mr-2"></i>
                        All Users
                    </h1>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[5, 10, 20]}
                            disableSelectionOnClick
                            autoHeight
                            rowHeight={70}
                            sx={{
                                '& .MuiDataGrid-cell': {
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8f9fa',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default UsersList;
