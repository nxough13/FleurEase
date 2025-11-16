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
import { Box, Card, CardContent, Typography, Button, IconButton, Chip } from '@mui/material';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(`${import.meta.env.VITE_API}/categories`, config);
            setCategories(data.categories);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading categories');
            setLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "This category will be permanently deleted!",
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

                await axios.delete(`${import.meta.env.VITE_API}/admin/category/${id}`, config);
                toast.success('Category deleted successfully');
                fetchCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting category');
        }
    };

    const bulkDeleteCategories = async () => {
        if (selectedRows.length === 0) {
            toast.warning('Please select categories to delete');
            return;
        }

        try {
            const result = await Swal.fire({
                title: 'Delete Selected Categories?',
                text: `You are about to delete ${selectedRows.length} categories. This action cannot be undone!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#6b46c1',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete them!'
            });

            if (result.isConfirmed) {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                };

                const { data } = await axios.post(
                    `${import.meta.env.VITE_API}/admin/categories/bulk-delete`,
                    { ids: selectedRows },
                    config
                );

                toast.success(data.message);
                setSelectedRows([]);
                fetchCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting categories');
        }
    };

    const toggleCategoryStatus = async (id) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/admin/category/${id}/toggle`,
                {},
                config
            );

            toast.success(data.message);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error toggling category status');
        }
    };

    const columns = [
        {
            field: 'image',
            headerName: 'Image',
            width: 100,
            renderCell: (params) => (
                <img
                    src={params.row.image.url}
                    alt={params.row.name}
                    style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        margin: '5px 0'
                    }}
                />
            )
        },
        {
            field: 'name',
            headerName: 'Category Name',
            width: 200,
            renderCell: (params) => (
                <div style={{ fontWeight: '500', color: '#6b46c1' }}>
                    {params.value}
                </div>
            )
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 300,
            renderCell: (params) => (
                <div style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {params.value}
                </div>
            )
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                        backgroundColor: params.value ? '#d4edda' : '#f8d7da',
                        color: params.value ? '#155724' : '#721c24',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                    }}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: 'Created',
            width: 150,
            renderCell: (params) => (
                <div>{new Date(params.value).toLocaleDateString()}</div>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 250,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <IconButton
                        onClick={() => navigate(`/admin/category/${params.row.id}`)}
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
                        onClick={() => toggleCategoryStatus(params.row.id)}
                        size="small"
                        sx={{
                            backgroundColor: params.row.isActive ? '#ffc107' : '#28a745',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: params.row.isActive ? '#e0a800' : '#218838',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                        title={params.row.isActive ? 'Disable' : 'Enable'}
                    >
                        <i className={`fa fa-${params.row.isActive ? 'ban' : 'check'}`}></i>
                    </IconButton>

                    <IconButton
                        onClick={() => deleteCategory(params.row.id)}
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

    const rows = categories.map(category => ({
        id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        isActive: category.isActive,
        createdAt: category.createdAt
    }));

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Fragment>
            <MetaData title={'All Categories'} />
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
                        <i className="fa fa-tags mr-2"></i>
                        All Categories
                    </Typography>
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {selectedRows.length > 0 && (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={bulkDeleteCategories}
                                startIcon={<i className="fa fa-trash"></i>}
                                sx={{
                                    borderRadius: '10px',
                                    padding: '10px 20px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
                                }}
                            >
                                Delete Selected ({selectedRows.length})
                            </Button>
                        )}
                        <Button
                            component={Link}
                            to="/admin/category/new"
                            variant="contained"
                            startIcon={<i className="fa fa-plus"></i>}
                            sx={{
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                borderRadius: '10px',
                                padding: '10px 24px',
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a3a9e 0%, #7c3aed 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(107, 70, 193, 0.4)'
                                }
                            }}
                        >
                            Add New Category
                        </Button>
                    </Box>
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
                                checkboxSelection
                                disableSelectionOnClick
                                autoHeight
                                rowHeight={80}
                                onRowSelectionModelChange={(newSelection) => {
                                    setSelectedRows(newSelection);
                                }}
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

export default CategoryList;
