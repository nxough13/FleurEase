import React, { Fragment, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import axios from 'axios';
import { getToken, getUser } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import ReviewDialog from '../Review/ReviewDialog';
import ListReviews from '../Review/ListReviews';

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();
    const user = getUser();

    useEffect(() => {
        fetchProduct();
        if (user) {
            checkWishlist();
            checkPurchaseStatus();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`);
            setProduct(data.product);
            
            // If user has existing reviews, they must have purchased it
            if (user && data.product.reviews) {
                const hasReview = data.product.reviews.some(review => review.user === user._id);
                if (hasReview) {
                    setHasPurchased(true);
                }
            }
            
            setLoading(false);
        } catch (error) {
            toast.error('Error loading product');
            navigate('/products');
        }
    };

    const checkWishlist = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API}/wishlist`, config);
            setIsInWishlist(data.wishlist.some(item => item._id === id));
        } catch (error) {
            console.error('Error checking wishlist');
        }
    };

    const checkPurchaseStatus = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, config);
            
            // Check if user has purchased this product
            const purchased = data.orders.some(order => 
                order.orderItems.some(item => item.product === id)
            );
            setHasPurchased(purchased);
        } catch (error) {
            console.error('Error checking purchase status');
            // If there's an error checking orders, check if user has existing reviews
            // If they have reviews, they must have purchased it before
            if (product && product.reviews) {
                const hasReview = product.reviews.some(review => review.user === user._id);
                if (hasReview) {
                    setHasPurchased(true);
                }
            }
        }
    };

    const handleAddReview = () => {
        if (!user) {
            toast.info('Please login to write a review');
            navigate('/login');
            return;
        }

        if (!hasPurchased) {
            toast.error('You can only review products you have purchased');
            return;
        }

        setEditingReview(null);
        setReviewDialogOpen(true);
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setReviewDialogOpen(true);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            await axios.delete(
                `${import.meta.env.VITE_API}/review/user?id=${reviewId}&productId=${id}`,
                config
            );

            toast.success('Review deleted successfully');
            fetchProduct(); // Refresh product
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting review');
        }
    };

    const handleReviewSuccess = () => {
        fetchProduct(); // Refresh product to show new/updated review
    };

    const toggleWishlist = async () => {
        if (!user) {
            toast.info('Please login to add to wishlist');
            navigate('/login');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            if (isInWishlist) {
                await axios.delete(`${import.meta.env.VITE_API}/wishlist/${id}`, config);
                setIsInWishlist(false);
                toast.success('Removed from wishlist');
            } else {
                await axios.post(`${import.meta.env.VITE_API}/wishlist`, { productId: id }, config);
                setIsInWishlist(true);
                toast.success('Added to wishlist! 💜');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating wishlist');
        }
    };

    const addToCart = () => {
        if (!user) {
            toast.info('Please login to add to cart');
            navigate('/login');
            return;
        }

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
            quantity: quantity
        };

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex(item => item.product === product._id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        toast.success('Added to cart! 🛒');
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<i key={i} className="fa fa-star" style={{ color: '#fdcc0d', fontSize: '1.5rem' }}></i>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<i key={i} className="fa fa-star-half-o" style={{ color: '#fdcc0d', fontSize: '1.5rem' }}></i>);
            } else {
                stars.push(<i key={i} className="fa fa-star-o" style={{ color: '#fdcc0d', fontSize: '1.5rem' }}></i>);
            }
        }
        return stars;
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <Fragment>
            <MetaData title={product.name} />

            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 0' }}>
                <div className="container">
                    <div className="row">
                        {/* Image Gallery */}
                        <div className="col-md-6">
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                padding: '20px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                position: 'sticky',
                                top: '20px'
                            }}>
                                {/* Main Image */}
                                <div style={{
                                    width: '100%',
                                    height: '450px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    marginBottom: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <img
                                        src={product.images[currentImageIndex]?.url || 'https://via.placeholder.com/450'}
                                        alt={product.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>

                                {/* Thumbnail Images */}
                                {product.images.length > 1 && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        overflowX: 'auto',
                                        padding: '5px 0'
                                    }}>
                                        {product.images.map((image, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: currentImageIndex === index ? '3px solid #6b46c1' : '2px solid #e0e0e0',
                                                    flexShrink: 0,
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`${product.name} ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="col-md-6">
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                padding: '30px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }}>
                                {/* Product Name */}
                                <h1 style={{
                                    color: '#333',
                                    fontWeight: 'bold',
                                    marginBottom: '15px',
                                    fontSize: '2rem'
                                }}>
                                    {product.name}
                                </h1>

                                {/* Product ID */}
                                <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '20px' }}>
                                    Product ID: {product._id}
                                </p>

                                {/* Rating */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '25px',
                                    paddingBottom: '20px',
                                    borderBottom: '2px solid #f0f0f0'
                                }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {renderStars(product.ratings)}
                                    </div>
                                    <span style={{ color: '#666', fontSize: '1.1rem', fontWeight: '500' }}>
                                        {product.ratings.toFixed(1)} ({product.numOfReviews} reviews)
                                    </span>
                                </div>

                                {/* Price */}
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    color: '#6b46c1',
                                    marginBottom: '20px'
                                }}>
                                    ₱{product.price.toLocaleString()}
                                </div>

                                {/* Stock Status */}
                                <div style={{
                                    marginBottom: '25px',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    backgroundColor: product.stock > 0 ? '#d4edda' : '#f8d7da'
                                }}>
                                    {product.stock > 0 ? (
                                        <span style={{
                                            color: '#155724',
                                            fontSize: '1.1rem',
                                            fontWeight: '600'
                                        }}>
                                            <i className="fa fa-check-circle mr-2"></i>
                                            In Stock ({product.stock} available)
                                        </span>
                                    ) : (
                                        <span style={{
                                            color: '#721c24',
                                            fontSize: '1.1rem',
                                            fontWeight: '600'
                                        }}>
                                            <i className="fa fa-times-circle mr-2"></i>
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Quantity Selector */}
                                {product.stock > 0 && (
                                    <div style={{ marginBottom: '25px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            marginBottom: '10px',
                                            color: '#333'
                                        }}>
                                            Quantity:
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #6b46c1',
                                                    backgroundColor: 'white',
                                                    color: '#6b46c1',
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
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
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                                style={{
                                                    width: '80px',
                                                    height: '40px',
                                                    textAlign: 'center',
                                                    border: '2px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600'
                                                }}
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #6b46c1',
                                                    backgroundColor: 'white',
                                                    color: '#6b46c1',
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
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
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                                    <button
                                        onClick={addToCart}
                                        disabled={product.stock === 0}
                                        style={{
                                            flex: 1,
                                            padding: '15px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: product.stock === 0 ? '#ccc' : '#6b46c1',
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (product.stock > 0) {
                                                e.currentTarget.style.backgroundColor = '#8b5cf6';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (product.stock > 0) {
                                                e.currentTarget.style.backgroundColor = '#6b46c1';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        <i className="fa fa-shopping-cart mr-2"></i>
                                        Add to Cart
                                    </button>

                                    <button
                                        onClick={toggleWishlist}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '10px',
                                            border: '2px solid #e0e0e0',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                            e.currentTarget.style.borderColor = '#e74c3c';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.borderColor = '#e0e0e0';
                                        }}
                                    >
                                        <i
                                            className={isInWishlist ? "fa fa-heart" : "fa fa-heart-o"}
                                            style={{
                                                color: isInWishlist ? '#e74c3c' : '#999',
                                                fontSize: '1.5rem'
                                            }}
                                        ></i>
                                    </button>
                                </div>

                                {/* Product Details */}
                                <div style={{
                                    padding: '20px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '10px',
                                    marginBottom: '20px'
                                }}>
                                    <h4 style={{ color: '#6b46c1', marginBottom: '15px', fontWeight: 'bold' }}>
                                        Product Details
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <strong style={{ color: '#666' }}>Category:</strong>
                                            <p style={{ margin: '5px 0 0 0', color: '#333' }}>{product.category}</p>
                                        </div>
                                        <div>
                                            <strong style={{ color: '#666' }}>Seller:</strong>
                                            <p style={{ margin: '5px 0 0 0', color: '#333' }}>{product.seller}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 style={{ color: '#6b46c1', marginBottom: '15px', fontWeight: 'bold' }}>
                                        Description
                                    </h4>
                                    <p style={{ color: '#666', lineHeight: '1.8', fontSize: '1rem' }}>
                                        {product.description}
                                    </p>
                                </div>
                            </div>

                            {/* Write Review Button */}
                            {user && hasPurchased && (
                                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddReview}
                                        startIcon={<i className="fa fa-plus"></i>}
                                        sx={{
                                            backgroundColor: '#6b46c1',
                                            color: 'white',
                                            padding: '12px 30px',
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)',
                                            '&:hover': {
                                                backgroundColor: '#8b5cf6'
                                            }
                                        }}
                                    >
                                        Write a Review
                                    </Button>
                                </div>
                            )}

                            {/* Purchase Required Message */}
                            {user && !hasPurchased && (
                                <div style={{
                                    backgroundColor: '#fff3cd',
                                    borderRadius: '15px',
                                    padding: '20px',
                                    marginTop: '20px',
                                    borderLeft: '4px solid #ffc107'
                                }}>
                                    <p style={{ color: '#856404', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa fa-info-circle" style={{ fontSize: '1.2rem' }}></i>
                                        <span>You need to purchase this product before you can write a review.</span>
                                    </p>
                                </div>
                            )}

                            {/* Reviews Section with MUI */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                                <ListReviews 
                                    reviews={product.reviews || []} 
                                    onEdit={handleEditReview}
                                    onDelete={handleDeleteReview}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Dialog */}
            <ReviewDialog
                open={reviewDialogOpen}
                onClose={() => setReviewDialogOpen(false)}
                productId={id}
                existingReview={editingReview}
                onSuccess={handleReviewSuccess}
            />
        </Fragment>
    );
};

export default ProductDetails;
