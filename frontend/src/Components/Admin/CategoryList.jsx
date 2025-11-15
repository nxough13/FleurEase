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
                <span
                    style={{
                        padding: '5px 12px',
                        borderRadius: '15px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        backgroundColor: params.value ? '#d4edda' : '#f8d7da',
                        color: params.value ? '#155724' : '#721c24'
                    }}
                >
                    {params.value ? 'Active' : 'Inactive'}
                </span>
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate(`/admin/category/${params.row.id}`)}
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
                        onClick={() => toggleCategoryStatus(params.row.id)}
                        className="btn btn-sm"
                        style={{
                            backgroundColor: params.row.isActive ? '#ffc107' : '#28a745',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '5px',
                            border: 'none'
                        }}
                        title={params.row.isActive ? 'Disable' : 'Enable'}
                    >
                        <i className={`fa fa-${params.row.isActive ? 'ban' : 'check'}`}></i>
                    </button>

                    <button
                        onClick={() => deleteCategory(params.row.id)}
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

            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '20px',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa'
            }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 style={{ color: '#6b46c1', fontWeight: 'bold' }}>
                        <i className="fa fa-list mr-2"></i>
                        All Categories
                    </h1>
                    <div>
                        {selectedRows.length > 0 && (
                            <button
                                onClick={bulkDeleteCategories}
                                className="btn btn-danger mr-2"
                                style={{
                                    borderRadius: '20px',
                                    padding: '10px 20px',
                                    fontWeight: '500'
                                }}
                            >
                                <i className="fa fa-trash mr-2"></i>
                                Delete Selected ({selectedRows.length})
                            </button>
                        )}
                        <Link
                            to="/admin/category/new"
                            className="btn"
                            style={{
                                backgroundColor: '#6b46c1',
                                color: 'white',
                                borderRadius: '20px',
                                padding: '10px 20px',
                                fontWeight: '500'
                            }}
                        >
                            <i className="fa fa-plus mr-2"></i>
                            Add New Category
                        </Link>
                    </div>
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
                            checkboxSelection
                            disableSelectionOnClick
                            autoHeight
                            rowHeight={80}
                            onRowSelectionModelChange={(newSelection) => {
                                setSelectedRows(newSelection);
                            }}
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

export default CategoryList;
