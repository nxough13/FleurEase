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

// Image Carousel Component
const ImageCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return <div>No images</div>;
    }

    const goToPrevious = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '5px 0'
        }}>
            {images.length > 1 && (
                <button
                    onClick={goToPrevious}
                    style={{
                        backgroundColor: '#6b46c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <i className="fa fa-chevron-left" style={{ fontSize: '0.7rem' }}></i>
                </button>
            )}

            <div style={{ position: 'relative', textAlign: 'center', width: '80px' }}>
                <img
                    src={images[currentIndex].url}
                    alt="Product"
                    style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: images[currentIndex].isMain ? '2px solid #6b46c1' : '1px solid #ddd',
                        backgroundColor: '#f8f9fa'
                    }}
                />
                {images[currentIndex].isMain && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#6b46c1',
                        color: 'white',
                        fontSize: '0.6rem',
                        padding: '2px 5px',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                    }}>
                        MAIN
                    </span>
                )}
                {images.length > 1 && (
                    <div style={{
                        fontSize: '0.7rem',
                        color: '#666',
                        marginTop: '2px'
                    }}>
                        {currentIndex + 1}/{images.length}
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <button
                    onClick={goToNext}
                    style={{
                        backgroundColor: '#6b46c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <i className="fa fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                </button>
            )}
        </div>
    );
};

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config);
            setProducts(data.products);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading products');
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "This product will be permanently deleted!",
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

                await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}`, config);
                toast.success('Product deleted successfully');
                fetchProducts();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting product');
        }
    };

    const bulkDeleteProducts = async () => {
        if (selectedRows.length === 0) {
            toast.warning('Please select products to delete');
            return;
        }

        try {
            const result = await Swal.fire({
                title: 'Delete Selected Products?',
                text: `You are about to delete ${selectedRows.length} products. This action cannot be undone!`,
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
                    `${import.meta.env.VITE_API}/admin/products/bulk-delete`,
                    { ids: selectedRows },
                    config
                );

                toast.success(data.message);
                setSelectedRows([]);
                fetchProducts();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting products');
        }
    };

    const toggleProductStatus = async (id) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/admin/product/${id}/toggle`,
                {},
                config
            );

            toast.success(data.message);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error toggling product status');
        }
    };

    const columns = [
        {
            field: 'images',
            headerName: 'Images',
            width: 150,
            renderCell: (params) => <ImageCarousel images={params.value} />
        },
        {
            field: 'name',
            headerName: 'Product Name',
            width: 250,
            renderCell: (params) => (
                <div style={{ fontWeight: '500', color: '#6b46c1' }}>
                    {params.value}
                </div>
            )
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 150
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 120,
            renderCell: (params) => (
                <div style={{ fontWeight: '500', color: '#28a745' }}>
                    ₱{params.value.toFixed(2)}
                </div>
            )
        },
        {
            field: 'stock',
            headerName: 'Stock',
            width: 100,
            renderCell: (params) => (
                <span style={{
                    padding: '5px 10px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    backgroundColor: params.value > 0 ? '#d4edda' : '#f8d7da',
                    color: params.value > 0 ? '#155724' : '#721c24'
                }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <span style={{
                    padding: '5px 12px',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    backgroundColor: params.value ? '#d4edda' : '#f8d7da',
                    color: params.value ? '#155724' : '#721c24'
                }}>
                    {params.value ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 280,
            sortable: false,
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate(`/admin/product/${params.row.id}`)}
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
                        onClick={() => toggleProductStatus(params.row.id)}
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
                        onClick={() => navigate(`/admin/product/${params.row.id}/details`)}
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
                        onClick={() => deleteProduct(params.row.id)}
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

    const rows = products.map(product => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        images: product.images || [],
        isActive: product.isActive !== undefined ? product.isActive : true
    }));

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Fragment>
            <MetaData title={'All Products'} />
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
                        <i className="fa fa-shopping-bag mr-2"></i>
                        All Products
                    </h1>
                    <div>
                        {selectedRows.length > 0 && (
                            <button
                                onClick={bulkDeleteProducts}
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
                            to="/admin/product/new"
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
                            Add New Product
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

export default ProductsList;
