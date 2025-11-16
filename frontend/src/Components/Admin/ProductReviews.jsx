import React, { Fragment, useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import MetaData from '../Layout/MetaData';
import Sidebar from './Sidebar';
import { getToken } from '../../Utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, Button, IconButton } from '@mui/material';

const ProductReviews = () => {
    const [productId, setProductId] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [productsModalOpen, setProductsModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config);
            setProducts(data.products);
        } catch (error) {
            console.error('Error fetching products');
        } finally {
            setLoadingProducts(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Product ID copied to clipboard!');
    };

    const handleProductSelect = (id) => {
        setProductId(id);
        setProductsModalOpen(false);
        toast.info('Product ID filled. Click "Get Reviews" to fetch reviews.');
    };

    const getReviews = async (e) => {
        e.preventDefault();

        if (!productId || productId.trim() === '') {
            toast.error('Please enter Product ID');
            return;
        }

        // Validate Product ID format (MongoDB ObjectId is 24 hex characters)
        if (!/^[0-9a-fA-F]{24}$/.test(productId.trim())) {
            toast.error('Invalid Product ID format');
            return;
        }

        setLoading(true);

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/reviews?id=${productId.trim()}`,
                config
            );

            setReviews(data.reviews);
            setLoading(false);

            if (data.reviews.length === 0) {
                toast.info('No reviews found for this product');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching reviews');
            setLoading(false);
            setReviews([]);
        }
    };

    const deleteReviewHandler = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                };

                await axios.delete(
                    `${import.meta.env.VITE_API}/reviews?id=${reviewId}&productId=${productId}`,
                    config
                );

                toast.success('Review deleted successfully');
                
                // Refresh reviews list
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API}/reviews?id=${productId}`,
                    config
                );
                setReviews(data.reviews);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting review');
            }
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Review ID',
            minWidth: 200,
            flex: 0.5,
            renderCell: (params) => (
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'user',
            headerName: 'User',
            minWidth: 150,
            flex: 0.3
        },
        {
            field: 'rating',
            headerName: 'Rating',
            minWidth: 120,
            flex: 0.2,
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: '#ffc107', fontSize: '1.1rem' }}>★</span>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{params.value}</span>
                    <span style={{ color: '#999' }}>/ 5</span>
                </div>
            )
        },
        {
            field: 'comment',
            headerName: 'Comment',
            minWidth: 300,
            flex: 0.6,
            renderCell: (params) => (
                <div style={{
                    whiteSpace: 'normal',
                    lineHeight: '1.4',
                    padding: '8px 0',
                    color: '#666'
                }}>
                    {params.value}
                </div>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            flex: 0.2,
            sortable: false,
            renderCell: (params) => (
                <button
                    onClick={() => deleteReviewHandler(params.id)}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                    <i className="fa fa-trash mr-1"></i>
                    Delete
                </button>
            )
        }
    ];

    const rows = reviews.map(review => ({
        id: review._id,
        user: review.name,
        rating: review.rating,
        comment: review.comment
    }));

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Fragment>
            <MetaData title={'Product Reviews'} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5'
            }}>
                    <div style={{ padding: '30px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                            padding: '25px',
                            borderRadius: '15px',
                            marginBottom: '30px',
                            boxShadow: '0 4px 15px rgba(107, 70, 193, 0.3)'
                        }}>
                            <h1 style={{ color: 'white', margin: 0, fontWeight: 'bold' }}>
                                <i className="fa fa-star mr-2"></i>
                                Product Reviews
                            </h1>
                            <p style={{ color: 'white', margin: '10px 0 0 0', opacity: 0.9 }}>
                                Manage customer reviews and ratings
                            </p>
                        </div>

                        {/* Search Form */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            marginBottom: '30px'
                        }}>
                            <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                <i className="fa fa-search mr-2"></i>
                                Search Reviews by Product ID
                            </h4>

                            <form onSubmit={getReviews}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                        Product ID
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter 24-character Product ID (e.g., 507f1f77bcf86cd799439011)"
                                        value={productId}
                                        onChange={(e) => setProductId(e.target.value)}
                                        required
                                        pattern="[0-9a-fA-F]{24}"
                                        title="Product ID must be 24 hexadecimal characters"
                                        style={{
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            border: '2px solid #e0e0e0',
                                            fontSize: '1rem',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                    <small style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                                        <i className="fa fa-info-circle mr-1"></i>
                                        You can find the Product ID in the product URL or admin products list
                                    </small>
                                    <button
                                        type="button"
                                        onClick={() => setProductsModalOpen(true)}
                                        style={{
                                            marginTop: '10px',
                                            padding: '8px 20px',
                                            borderRadius: '8px',
                                            border: '2px solid #6b46c1',
                                            background: 'white',
                                            color: '#6b46c1',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#6b46c1';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.color = '#6b46c1';
                                        }}
                                    >
                                        <i className="fa fa-list mr-2"></i>
                                        View Products
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '12px 30px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: loading ? '#ccc' : 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin mr-2"></i>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-search mr-2"></i>
                                            Get Reviews
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Reviews Table */}
                        {reviews.length > 0 && (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                padding: '20px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }}>
                                <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                    <i className="fa fa-list mr-2"></i>
                                    Reviews ({reviews.length})
                                </h4>

                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSize={10}
                                    disableSelectionOnClick
                                    autoHeight
                                    getRowHeight={() => 'auto'}
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #f0f0f0',
                                            padding: '12px',
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f8f9fa',
                                            color: '#6b46c1',
                                            fontWeight: 'bold',
                                            fontSize: '0.95rem',
                                            borderBottom: '2px solid #e9d5ff',
                                        },
                                        '& .MuiDataGrid-row:hover': {
                                            backgroundColor: '#f8f9fa',
                                        },
                                    }}
                                />
                            </div>
                        )}
                    </div>
            </div>

            {/* Products Modal */}
            <Dialog
                open={productsModalOpen}
                onClose={() => setProductsModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '15px',
                        maxHeight: '80vh'
                    }
                }}
            >
                <DialogTitle style={{
                    background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                }}>
                    <i className="fa fa-shopping-bag mr-2"></i>
                    Select Product
                </DialogTitle>
                <DialogContent style={{ padding: '20px' }}>
                    {loadingProducts ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#6b46c1' }}></i>
                            <p style={{ marginTop: '15px', color: '#666' }}>Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <i className="fa fa-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                            <p style={{ marginTop: '15px', color: '#666' }}>No products found</p>
                        </div>
                    ) : (
                        <div style={{ marginTop: '15px' }}>
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '15px',
                                        marginBottom: '10px',
                                        border: '2px solid #e9d5ff',
                                        borderRadius: '12px',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#6b46c1';
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e9d5ff';
                                        e.currentTarget.style.backgroundColor = 'white';
                                    }}
                                    onClick={() => handleProductSelect(product._id)}
                                >
                                    {/* Product Image */}
                                    <img
                                        src={product.images[0]?.url || 'https://via.placeholder.com/80'}
                                        alt={product.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            marginRight: '15px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />

                                    {/* Product Info */}
                                    <div style={{ flex: 1 }}>
                                        <h6 style={{ 
                                            margin: 0, 
                                            marginBottom: '8px', 
                                            color: '#333',
                                            fontWeight: '600'
                                        }}>
                                            {product.name}
                                        </h6>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                color: '#666',
                                                fontFamily: 'monospace',
                                                backgroundColor: '#f0f0f0',
                                                padding: '4px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                ID: {product._id}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(product._id);
                                                }}
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #6b46c1',
                                                    background: 'white',
                                                    color: '#6b46c1',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#6b46c1';
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                    e.currentTarget.style.color = '#6b46c1';
                                                }}
                                            >
                                                <i className="fa fa-copy mr-1"></i>
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    {/* Select Arrow */}
                                    <i className="fa fa-chevron-right" style={{ color: '#6b46c1', fontSize: '1.2rem' }}></i>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Fragment>
    );
};

export default ProductReviews;
