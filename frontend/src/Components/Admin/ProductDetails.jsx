import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/product/${id}`,
                config
            );

            setProduct(data.product);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading product details');
            navigate('/admin/products');
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <Fragment>
            <MetaData title={`Product Details - ${product.name}`} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '20px',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
            }}>
                <div className="row">
                    <div className="col-12">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4" style={{
                            background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                            padding: '20px 30px',
                            borderRadius: '15px',
                            boxShadow: '0 4px 15px rgba(107, 70, 193, 0.3)'
                        }}>
                            <h1 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
                                <i className="fa fa-info-circle mr-2"></i>
                                Product Details
                            </h1>
                            <div>
                                <Link
                                    to={`/admin/product/${id}`}
                                    className="btn mr-2"
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#6b46c1',
                                        borderRadius: '20px',
                                        padding: '10px 20px',
                                        fontWeight: '600',
                                        border: '2px solid white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <i className="fa fa-edit mr-2"></i>
                                    Edit Product
                                </Link>
                                <button
                                    onClick={() => navigate('/admin/products')}
                                    className="btn"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        padding: '10px 20px',
                                        fontWeight: '500',
                                        border: '2px solid rgba(255,255,255,0.3)'
                                    }}
                                >
                                    <i className="fa fa-arrow-left mr-2"></i>
                                    Back to List
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="row">
                            {/* Images Section */}
                            <div className="col-md-5">
                                <div style={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(107, 70, 193, 0.1)'
                                }}>
                                    <h4 style={{ 
                                        color: '#6b46c1', 
                                        marginBottom: '20px', 
                                        fontWeight: 'bold',
                                        fontSize: '1.3rem',
                                        borderBottom: '2px solid #e9d5ff',
                                        paddingBottom: '10px'
                                    }}>
                                        <i className="fa fa-images mr-2"></i>
                                        Product Images
                                    </h4>

                                    {/* Main Image Display */}
                                    <div style={{
                                        position: 'relative',
                                        marginBottom: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <img
                                            src={product.images[currentImageIndex]?.url}
                                            alt={product.name}
                                            style={{
                                                width: '100%',
                                                maxHeight: '400px',
                                                objectFit: 'contain',
                                                borderRadius: '15px',
                                                border: '3px solid #e9d5ff',
                                                boxShadow: '0 4px 15px rgba(107, 70, 193, 0.15)',
                                                backgroundColor: 'white',
                                                padding: '10px'
                                            }}
                                        />
                                        {product.images[currentImageIndex]?.isMain && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                backgroundColor: '#6b46c1',
                                                color: 'white',
                                                padding: '5px 15px',
                                                borderRadius: '20px',
                                                fontWeight: 'bold'
                                            }}>
                                                MAIN IMAGE
                                            </span>
                                        )}
                                    </div>

                                    {/* Image Thumbnails */}
                                    {product.images.length > 1 && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            overflowX: 'auto',
                                            padding: '10px 0'
                                        }}>
                                            {product.images.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img.url}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        border: currentImageIndex === index ? '3px solid #6b46c1' : '2px solid #ddd',
                                                        transition: 'all 0.3s'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
                                        Image {currentImageIndex + 1} of {product.images.length}
                                    </div>
                                </div>
                            </div>

                            {/* Product Information */}
                            <div className="col-md-7">
                                <div style={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                    borderRadius: '15px',
                                    padding: '35px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(107, 70, 193, 0.1)'
                                }}>
                                    <h2 style={{ 
                                        background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 'bold', 
                                        marginBottom: '25px',
                                        fontSize: '2rem',
                                        borderBottom: '3px solid #e9d5ff',
                                        paddingBottom: '15px'
                                    }}>
                                        {product.name}
                                    </h2>

                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div style={{
                                                backgroundColor: '#f8f9fa',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                <strong style={{ color: '#6b46c1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    <i className="fa fa-barcode mr-2"></i>Product ID
                                                </strong><br />
                                                <span style={{ color: '#333', fontSize: '0.85rem', fontFamily: 'monospace' }}>{product._id}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div style={{
                                                backgroundColor: '#f8f9fa',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                <strong style={{ color: '#6b46c1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    <i className="fa fa-tag mr-2"></i>Category
                                                </strong><br />
                                                <span style={{
                                                    background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                                    color: 'white',
                                                    padding: '6px 18px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    display: 'inline-block',
                                                    marginTop: '5px',
                                                    boxShadow: '0 2px 8px rgba(107, 70, 193, 0.3)'
                                                }}>
                                                    {product.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div style={{
                                                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: '2px solid #28a745',
                                                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)'
                                            }}>
                                                <strong style={{ color: '#155724', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    <i className="fa fa-money mr-2"></i>Price
                                                </strong><br />
                                                <span style={{ color: '#155724', fontSize: '2rem', fontWeight: 'bold' }}>
                                                    ₱{product.price.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div style={{
                                                background: product.stock > 0 
                                                    ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' 
                                                    : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: product.stock > 0 ? '2px solid #28a745' : '2px solid #dc3545',
                                                boxShadow: product.stock > 0 
                                                    ? '0 4px 12px rgba(40, 167, 69, 0.2)'
                                                    : '0 4px 12px rgba(220, 53, 69, 0.2)'
                                            }}>
                                                <strong style={{ 
                                                    color: product.stock > 0 ? '#155724' : '#721c24', 
                                                    fontSize: '0.85rem', 
                                                    textTransform: 'uppercase', 
                                                    letterSpacing: '0.5px' 
                                                }}>
                                                    <i className="fa fa-cubes mr-2"></i>Stock
                                                </strong><br />
                                                <span style={{
                                                    color: product.stock > 0 ? '#155724' : '#721c24',
                                                    fontSize: '2rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {product.stock}
                                                </span>
                                                <span style={{ 
                                                    color: product.stock > 0 ? '#155724' : '#721c24',
                                                    fontSize: '1rem',
                                                    marginLeft: '8px'
                                                }}>
                                                    units
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p style={{ marginBottom: '15px' }}>
                                                <strong style={{ color: '#666' }}>Seller:</strong><br />
                                                <span style={{ color: '#333' }}>{product.seller}</span>
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p style={{ marginBottom: '15px' }}>
                                                <strong style={{ color: '#666' }}>Status:</strong><br />
                                                <span style={{
                                                    padding: '5px 15px',
                                                    borderRadius: '15px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500',
                                                    backgroundColor: product.isActive ? '#d4edda' : '#f8d7da',
                                                    color: product.isActive ? '#155724' : '#721c24'
                                                }}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p style={{ marginBottom: '15px' }}>
                                                <strong style={{ color: '#666' }}>Ratings:</strong><br />
                                                <span style={{ color: '#fdcc0d', fontSize: '1.2rem' }}>
                                                    {'★'.repeat(Math.round(product.ratings))}
                                                    {'☆'.repeat(5 - Math.round(product.ratings))}
                                                </span>
                                                <span style={{ color: '#666', marginLeft: '10px' }}>
                                                    ({product.ratings.toFixed(1)})
                                                </span>
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p style={{ marginBottom: '15px' }}>
                                                <strong style={{ color: '#666' }}>Reviews:</strong><br />
                                                <span style={{ color: '#333' }}>{product.numOfReviews} reviews</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '25px' }}>
                                        <strong style={{ 
                                            color: '#6b46c1', 
                                            fontSize: '1.1rem',
                                            borderBottom: '2px solid #e9d5ff',
                                            paddingBottom: '8px',
                                            display: 'block',
                                            marginBottom: '15px'
                                        }}>
                                            <i className="fa fa-align-left mr-2"></i>Description
                                        </strong>
                                        <p style={{
                                            marginTop: '10px',
                                            color: '#333',
                                            lineHeight: '1.8',
                                            padding: '20px',
                                            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                                            borderRadius: '12px',
                                            border: '2px solid #e9d5ff',
                                            fontSize: '1rem',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            {product.description}
                                        </p>
                                    </div>

                                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                            <strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Reviews Section */}
                                {product.reviews && product.reviews.length > 0 && (
                                    <div style={{
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                        borderRadius: '15px',
                                        padding: '35px',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                        border: '1px solid rgba(107, 70, 193, 0.1)'
                                    }}>
                                        <h4 style={{ 
                                            background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            marginBottom: '25px', 
                                            fontWeight: 'bold',
                                            fontSize: '1.5rem',
                                            borderBottom: '2px solid #e9d5ff',
                                            paddingBottom: '12px'
                                        }}>
                                            <i className="fa fa-comments mr-2"></i>
                                            Customer Reviews ({product.reviews.length})
                                        </h4>

                                        {product.reviews.map((review, index) => (
                                            <div key={index} style={{
                                                padding: '20px',
                                                marginBottom: '15px',
                                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                                borderRadius: '12px',
                                                borderLeft: '5px solid #6b46c1',
                                                boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                                                transition: 'transform 0.2s, box-shadow 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateX(5px)';
                                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(107, 70, 193, 0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateX(0)';
                                                e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.05)';
                                            }}>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <strong style={{ color: '#333' }}>{review.name}</strong>
                                                    <span style={{ color: '#fdcc0d' }}>
                                                        {'★'.repeat(review.rating)}
                                                        {'☆'.repeat(5 - review.rating)}
                                                    </span>
                                                </div>
                                                <p style={{ color: '#666', marginBottom: '0' }}>
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default ProductDetails;
