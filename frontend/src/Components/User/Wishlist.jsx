import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API}/wishlist`, config);
            setWishlist(data.wishlist);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading wishlist');
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };
            await axios.delete(`${import.meta.env.VITE_API}/wishlist/${productId}`, config);
            setWishlist(prev => prev.filter(item => item._id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Error removing from wishlist');
        }
    };

    const addToCart = (product) => {
        if (product.stock === 0) {
            toast.error('Product is out of stock');
            return;
        }

        const cartItem = {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url,
            stock: product.stock,
            quantity: 1
        };

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex(item => item.product === product._id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
            toast.success('Quantity updated in cart');
        } else {
            cart.push(cartItem);
            toast.success('Added to cart! 🛒');
        }

        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<i key={i} className="fa fa-star" style={{ color: '#fdcc0d' }}></i>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<i key={i} className="fa fa-star-half-o" style={{ color: '#fdcc0d' }}></i>);
            } else {
                stars.push(<i key={i} className="fa fa-star-o" style={{ color: '#fdcc0d' }}></i>);
            }
        }
        return stars;
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <Fragment>
            <MetaData title={'My Wishlist'} />

            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 0' }}>
                <div className="container">
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                        padding: '30px',
                        borderRadius: '15px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
                    }}>
                        <h1 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
                            <i className="fa fa-heart mr-2"></i>
                            My Wishlist
                        </h1>
                        <p style={{ color: '#ffeaa7', margin: '10px 0 0 0' }}>
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
                        </p>
                    </div>

                    {wishlist.length === 0 ? (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '60px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💜</div>
                            <h3 style={{ color: '#6b46c1', marginBottom: '15px' }}>Your wishlist is empty</h3>
                            <p style={{ color: '#666', marginBottom: '30px' }}>
                                Save your favorite flowers for later!
                            </p>
                            <Link
                                to="/products"
                                style={{
                                    display: 'inline-block',
                                    padding: '15px 40px',
                                    backgroundColor: '#6b46c1',
                                    color: 'white',
                                    borderRadius: '25px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b46c1'}
                            >
                                <i className="fa fa-shopping-bag mr-2"></i>
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="row">
                            {wishlist.map(product => (
                                <div key={product._id} className="col-sm-12 col-md-6 col-lg-3 my-3">
                                    <div style={{
                                        backgroundColor: 'white',
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        border: '2px solid #f0f0f0',
                                        position: 'relative',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(231, 76, 60, 0.2)';
                                        e.currentTarget.style.borderColor = '#e74c3c';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.borderColor = '#f0f0f0';
                                    }}
                                    >
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromWishlist(product._id)}
                                            style={{
                                                position: 'absolute',
                                                top: '15px',
                                                right: '15px',
                                                zIndex: 10,
                                                backgroundColor: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                e.currentTarget.style.backgroundColor = '#fee';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.backgroundColor = 'white';
                                            }}
                                        >
                                            <i className="fa fa-times" style={{ color: '#e74c3c', fontSize: '1.2rem' }}></i>
                                        </button>

                                        {/* Product Image */}
                                        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                                            <div style={{
                                                width: '100%',
                                                height: '250px',
                                                overflow: 'hidden',
                                                backgroundColor: '#f8f9fa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <img
                                                    src={product.images[0]?.url || 'https://via.placeholder.com/250'}
                                                    alt={product.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </div>
                                        </Link>

                                        {/* Product Info */}
                                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Link 
                                                to={`/product/${product._id}`} 
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                <h5 style={{
                                                    color: '#333',
                                                    fontWeight: 'bold',
                                                    marginBottom: '10px',
                                                    fontSize: '1.1rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {product.name}
                                                </h5>
                                            </Link>

                                            {/* Rating */}
                                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    {renderStars(product.ratings)}
                                                </div>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>
                                                    ({product.numOfReviews})
                                                </span>
                                            </div>

                                            {/* Price */}
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: '#6b46c1',
                                                marginBottom: '15px'
                                            }}>
                                                ₱{product.price.toLocaleString()}
                                            </div>

                                            {/* Stock Status */}
                                            <div style={{ marginBottom: '15px' }}>
                                                {product.stock > 0 ? (
                                                    <span style={{
                                                        color: '#28a745',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        <i className="fa fa-check-circle mr-1"></i>
                                                        In Stock
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        color: '#dc3545',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        <i className="fa fa-times-circle mr-1"></i>
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.stock === 0}
                                                    style={{
                                                        flex: 1,
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        border: 'none',
                                                        backgroundColor: product.stock === 0 ? '#ccc' : '#6b46c1',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (product.stock > 0) {
                                                            e.currentTarget.style.backgroundColor = '#8b5cf6';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (product.stock > 0) {
                                                            e.currentTarget.style.backgroundColor = '#6b46c1';
                                                        }
                                                    }}
                                                >
                                                    <i className="fa fa-shopping-cart mr-2"></i>
                                                    Add to Cart
                                                </button>

                                                <Link
                                                    to={`/product/${product._id}`}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '50px',
                                                        borderRadius: '10px',
                                                        border: '2px solid #6b46c1',
                                                        backgroundColor: 'white',
                                                        color: '#6b46c1',
                                                        textDecoration: 'none',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#6b46c1';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                        e.currentTarget.style.color = '#6b46c1';
                                                    }}
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
};

export default Wishlist;
