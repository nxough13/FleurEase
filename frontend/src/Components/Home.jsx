import React, { Fragment, useState, useEffect } from 'react';
import MetaData from './Layout/MetaData';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card, CardContent, CardMedia, Typography, Button, Chip, Container, Grid, Box } from '@mui/material';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        getProducts();
        setIsVisible(true);
        
        // Add floating animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
        `;
        document.head.appendChild(style);
        
        return () => document.head.removeChild(style);
    }, []);

    const getProducts = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/products`);
            setProducts(data.products);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading products');
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <MetaData title={'Home'} />
            
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 15s ease infinite',
                padding: '100px 0',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Floating decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '5%',
                    fontSize: '4rem',
                    opacity: 0.2,
                    animation: 'float 6s ease-in-out infinite'
                }}>🌸</div>
                <div style={{
                    position: 'absolute',
                    top: '60%',
                    right: '10%',
                    fontSize: '3rem',
                    opacity: 0.2,
                    animation: 'float 8s ease-in-out infinite 1s'
                }}>🌺</div>
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '15%',
                    fontSize: '3.5rem',
                    opacity: 0.2,
                    animation: 'float 7s ease-in-out infinite 2s'
                }}>🌼</div>
                
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="row align-items-center">
                        <div className="col-md-6 text-left" style={{
                            animation: isVisible ? 'fadeInUp 1s ease-out' : 'none'
                        }}>
                            <h1 style={{ 
                                fontSize: '3.5rem', 
                                fontWeight: 'bold', 
                                marginBottom: '1rem',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                The Ultimate <span style={{ 
                                    color: '#ffd700',
                                    textShadow: '0 0 20px rgba(255,215,0,0.5)'
                                }}>Flower</span><br />
                                Shopping Destination
                            </h1>
                            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#e9d5ff' }}>
                                Delivering Nature's Beauty to Your Door. Fresh flowers for every occasion, 
                                handpicked with love and care.
                            </p>
                            <Link to="/products" className="btn btn-lg" style={{
                                backgroundColor: 'white',
                                color: '#6b46c1',
                                padding: '15px 45px',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                border: 'none',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s ease',
                                display: 'inline-block'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                            }}>
                                Shop Now →
                            </Link>
                            <Link to="/register" className="btn btn-lg ml-3" style={{
                                backgroundColor: 'transparent',
                                color: 'white',
                                padding: '12px 40px',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                border: '2px solid white'
                            }}>
                                View All Products
                            </Link>
                        </div>
                        <div className="col-md-6" style={{
                            animation: isVisible ? 'fadeInUp 1s ease-out 0.3s both' : 'none'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: '25px',
                                padding: '40px',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <div style={{ 
                                    fontSize: '5rem', 
                                    marginBottom: '20px',
                                    animation: 'pulse 3s ease-in-out infinite'
                                }}>🌸</div>
                                <h3 style={{ marginBottom: '15px' }}>4.9★ Ratings</h3>
                                <p style={{ color: '#e9d5ff' }}>Trusted by 800+ Customers</p>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-around', 
                                    marginTop: '30px',
                                    flexWrap: 'wrap'
                                }}>
                                    <div>
                                        <h4 style={{ fontSize: '2rem', fontWeight: 'bold' }}>20+</h4>
                                        <p style={{ color: '#e9d5ff' }}>Categories</p>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '2rem', fontWeight: 'bold' }}>1000+</h4>
                                        <p style={{ color: '#e9d5ff' }}>Products</p>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '2rem', fontWeight: 'bold' }}>99%</h4>
                                        <p style={{ color: '#e9d5ff' }}>Satisfied Customers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shop By Occasions */}
            <section style={{ 
                padding: '80px 0', 
                background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)'
            }}>
                <div className="container">
                    <div className="text-center mb-5" style={{
                        animation: isVisible ? 'fadeInUp 1s ease-out 0.5s both' : 'none'
                    }}>
                        <h2 style={{ 
                            color: '#6b46c1', 
                            fontSize: '2.8rem', 
                            fontWeight: 'bold',
                            marginBottom: '10px'
                        }}>
                            Shop By <span style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>Occasions</span>
                        </h2>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>Find the perfect flowers for every special moment</p>
                    </div>
                    <div className="row text-center">
                        {[
                            { icon: '💍', name: 'Wedding', count: '44 Products' },
                            { icon: '🎁', name: 'Birthday', count: '56 Products' },
                            { icon: '💝', name: 'Anniversary', count: '11 Products' },
                            { icon: '🙏', name: 'Thank You', count: '28 Products' },
                            { icon: '🎓', name: 'Graduation', count: '15 Products' },
                            { icon: '🤒', name: 'Get Well Soon', count: '18 Products' }
                        ].map((occasion, index) => (
                            <div key={index} className="col-md-2 col-sm-4 col-6 mb-4">
                                <Link to="/products" style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        backgroundColor: 'white',
                                        borderRadius: '20px',
                                        padding: '35px 20px',
                                        boxShadow: '0 5px 15px rgba(107, 70, 193, 0.1)',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        animation: isVisible ? `fadeInUp 1s ease-out ${0.6 + index * 0.1}s both` : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(107, 70, 193, 0.3)';
                                        e.currentTarget.style.borderColor = '#6b46c1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(107, 70, 193, 0.1)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                    >
                                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{occasion.icon}</div>
                                        <h5 style={{ color: '#6b46c1', fontWeight: 'bold' }}>{occasion.name}</h5>
                                        <p style={{ color: '#9f7aea', fontSize: '0.9rem' }}>{occasion.count}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section style={{ 
                padding: '80px 0',
                background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)'
            }}>
                <div className="container">
                    <div className="text-center mb-5" style={{
                        animation: isVisible ? 'fadeInUp 1s ease-out 1s both' : 'none'
                    }}>
                        <h2 style={{ 
                            color: '#6b46c1', 
                            fontSize: '2.8rem', 
                            fontWeight: 'bold',
                            marginBottom: '10px'
                        }}>
                            Top Seller <span style={{ 
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>Products</span>
                        </h2>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>Handpicked bestsellers loved by our customers</p>
                    </div>
                    <div className="row">
                        {loading ? (
                            <div className="col-12 text-center">
                                <div className="loader"></div>
                            </div>
                        ) : products.length > 0 ? (
                            products.slice(0, 4).map(product => (
                                <div key={product._id} className="col-sm-12 col-md-6 col-lg-3 my-3">
                                    <div className="card p-3 rounded" style={{ 
                                        border: '2px solid #e9d5ff',
                                        borderRadius: '20px',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        animation: isVisible ? 'fadeInUp 1s ease-out 1.2s both' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(107, 70, 193, 0.3)';
                                        e.currentTarget.style.borderColor = '#6b46c1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#e9d5ff';
                                    }}
                                    >
                                        <img
                                            className="card-img-top mx-auto"
                                            src={product.images[0]?.url || 'https://via.placeholder.com/200'}
                                            alt={product.name}
                                        />
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">
                                                <Link to={`/product/${product._id}`}>{product.name}</Link>
                                            </h5>
                                            <div className="ratings mt-auto">
                                                <div className="rating-outer">
                                                    <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                                                </div>
                                                <span id="no_of_reviews">({product.numOfReviews} Reviews)</span>
                                            </div>
                                            <p className="card-text" style={{ color: '#6b46c1', fontWeight: 'bold' }}>
                                                ${product.price}
                                            </p>
                                            <Link to={`/product/${product._id}`} id="view_btn" className="btn btn-block">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <p>No products available yet. Check back soon! 🌸</p>
                            </div>
                        )}
                    </div>
                    {products.length > 4 && (
                        <div className="text-center mt-4">
                            <Link to="/products" className="btn btn-lg" style={{
                                backgroundColor: '#6b46c1',
                                color: 'white',
                                padding: '12px 40px',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                border: 'none'
                            }}>
                                View All Products
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Why Choose Us */}
            <section style={{ 
                padding: '80px 0', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 15s ease infinite',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container">
                    <div className="text-center mb-5" style={{
                        animation: isVisible ? 'fadeInUp 1s ease-out 1.5s both' : 'none'
                    }}>
                        <h2 style={{ 
                            fontSize: '2.8rem', 
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                            marginBottom: '10px'
                        }}>
                            Why Choose FleurEase?
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#e9d5ff' }}>Experience the difference with our premium service</p>
                    </div>
                    <div className="row">
                        {[
                            { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day delivery available' },
                            { icon: '🌸', title: 'Fresh Flowers', desc: 'Handpicked daily from farms' },
                            { icon: '💯', title: 'Quality Guaranteed', desc: '100% satisfaction or refund' },
                            { icon: '💳', title: 'Secure Payment', desc: 'Safe and encrypted checkout' }
                        ].map((feature, index) => (
                            <div key={index} className="col-md-3 col-sm-6 mb-4 text-center" style={{
                                animation: isVisible ? `fadeInUp 1s ease-out ${1.6 + index * 0.1}s both` : 'none'
                            }}>
                                <div style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: '20px',
                                    padding: '30px 20px',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                }}>
                                    <div style={{ 
                                        fontSize: '3.5rem', 
                                        marginBottom: '15px',
                                        animation: 'pulse 3s ease-in-out infinite'
                                    }}>{feature.icon}</div>
                                    <h4 style={{ fontWeight: 'bold', marginBottom: '10px', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>{feature.title}</h4>
                                    <p style={{ color: '#e9d5ff' }}>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Fragment>
    );
};

export default Home;
