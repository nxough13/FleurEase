import React, { Fragment, useState, useEffect } from 'react';
import MetaData from './Layout/MetaData';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        getProducts();
        setTimeout(() => setIsVisible(true), 50);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(24px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            .hero-section {
                width: 100%;
                min-height: 92vh;
                position: relative;
                display: flex;
                align-items: center;
                background-image: url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1800&q=85');
                background-size: cover;
                background-position: center 40%;
                overflow: hidden;
            }
            .hero-overlay {
                position: absolute;
                inset: 0;
                background: linear-gradient(
                    105deg,
                    rgba(74, 29, 150, 0.82) 0%,
                    rgba(107, 70, 193, 0.65) 45%,
                    rgba(107, 70, 193, 0.15) 100%
                );
            }
            .hero-content {
                position: relative;
                z-index: 2;
                max-width: 580px;
                padding: 0 0 0 7vw;
            }
            .hero-tag {
                display: inline-block;
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.35);
                color: #e9d5ff;
                font-size: 0.8rem;
                letter-spacing: 2px;
                text-transform: uppercase;
                padding: 6px 18px;
                border-radius: 50px;
                margin-bottom: 24px;
            }
            .hero-title {
                font-size: clamp(2.4rem, 5vw, 4rem);
                font-weight: 800;
                line-height: 1.15;
                color: #fff;
                margin-bottom: 20px;
                letter-spacing: -0.5px;
            }
            .hero-title span {
                color: #c084fc;
            }
            .hero-subtitle {
                font-size: 1.05rem;
                color: rgba(255,255,255,0.78);
                line-height: 1.7;
                margin-bottom: 36px;
                max-width: 440px;
            }
            .hero-buttons {
                display: flex;
                gap: 14px;
                flex-wrap: wrap;
            }
            .btn-primary-hero {
                background: #fff;
                color: #6b46c1;
                font-weight: 700;
                font-size: 0.95rem;
                padding: 14px 36px;
                border-radius: 50px;
                border: none;
                text-decoration: none;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 6px 24px rgba(0,0,0,0.25);
                display: inline-block;
            }
            .btn-primary-hero:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 32px rgba(0,0,0,0.3);
                color: #6b46c1;
                text-decoration: none;
            }
            .btn-outline-hero {
                background: transparent;
                color: #fff;
                font-weight: 600;
                font-size: 0.95rem;
                padding: 13px 34px;
                border-radius: 50px;
                border: 2px solid rgba(255,255,255,0.6);
                text-decoration: none;
                transition: background 0.2s, border-color 0.2s;
                display: inline-block;
            }
            .btn-outline-hero:hover {
                background: rgba(255,255,255,0.12);
                border-color: #fff;
                color: #fff;
                text-decoration: none;
            }
            .hero-stats {
                position: absolute;
                bottom: 48px;
                left: 7vw;
                z-index: 2;
                display: flex;
                gap: 40px;
            }
            .hero-stat-item {
                text-align: left;
            }
            .hero-stat-number {
                font-size: 1.9rem;
                font-weight: 800;
                color: #fff;
                line-height: 1;
            }
            .hero-stat-label {
                font-size: 0.78rem;
                color: rgba(255,255,255,0.65);
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 4px;
            }
            .hero-stat-divider {
                width: 1px;
                background: rgba(255,255,255,0.25);
                align-self: stretch;
            }

            /* Occasions */
            .occasions-section {
                padding: 60px 0;
                background: #faf9ff;
            }
            .section-label {
                font-size: 0.75rem;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #9f7aea;
                font-weight: 600;
                margin-bottom: 12px;
            }
            .section-title {
                font-size: clamp(1.8rem, 3.5vw, 2.6rem);
                font-weight: 800;
                color: #1e1b4b;
                margin-bottom: 10px;
                line-height: 1.2;
            }
            .section-title span {
                color: #6b46c1;
            }
            .section-subtitle {
                color: #64748b;
                font-size: 1rem;
                margin-bottom: 50px;
            }
            .occasion-card {
                background: #fff;
                border-radius: 20px;
                padding: 32px 16px;
                text-align: center;
                border: 2px solid #ede9fe;
                transition: all 0.25s ease;
                text-decoration: none;
                display: block;
                height: 100%;
            }
            .occasion-card:hover {
                border-color: #6b46c1;
                transform: translateY(-6px);
                box-shadow: 0 16px 40px rgba(107,70,193,0.15);
                text-decoration: none;
            }
            .occasion-icon {
                font-size: 2.6rem;
                margin-bottom: 12px;
                display: block;
            }
            .occasion-name {
                font-weight: 700;
                color: #1e1b4b;
                font-size: 0.95rem;
                margin-bottom: 4px;
            }
            .occasion-count {
                font-size: 0.8rem;
                color: #9f7aea;
            }

            /* Products */
            .products-section {
                padding: 60px 0;
                background: #fff;
            }
            .product-card {
                border: 2px solid #ede9fe;
                border-radius: 20px;
                overflow: hidden;
                transition: all 0.25s ease;
                background: #fff;
                height: 100%;
            }
            .product-card:hover {
                border-color: #6b46c1;
                transform: translateY(-6px);
                box-shadow: 0 16px 40px rgba(107,70,193,0.15);
            }
            .product-card img {
                width: 100%;
                height: 220px;
                object-fit: cover;
                display: block;
            }
            .product-card-body {
                padding: 20px;
            }
            .product-card-title {
                font-weight: 700;
                color: #1e1b4b;
                font-size: 1rem;
                margin-bottom: 8px;
                text-decoration: none;
                display: block;
            }
            .product-card-title:hover {
                color: #6b46c1;
            }
            .product-price {
                color: #6b46c1;
                font-weight: 800;
                font-size: 1.1rem;
                margin: 10px 0;
            }
            .btn-view {
                display: block;
                width: 100%;
                text-align: center;
                background: linear-gradient(135deg, #6b46c1, #8b5cf6);
                color: #fff;
                font-weight: 600;
                font-size: 0.88rem;
                padding: 10px;
                border-radius: 10px;
                text-decoration: none;
                transition: opacity 0.2s;
                margin-top: 12px;
            }
            .btn-view:hover {
                opacity: 0.88;
                color: #fff;
                text-decoration: none;
            }

            /* Why Choose Us */
            .why-section {
                padding: 60px 0;
                background: linear-gradient(135deg, #4c1d95 0%, #6b46c1 50%, #7c3aed 100%);
                position: relative;
                overflow: hidden;
            }
            .why-section::before {
                content: '';
                position: absolute;
                top: -120px;
                right: -120px;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                background: rgba(255,255,255,0.04);
            }
            .why-section::after {
                content: '';
                position: absolute;
                bottom: -80px;
                left: -80px;
                width: 300px;
                height: 300px;
                border-radius: 50%;
                background: rgba(255,255,255,0.04);
            }
            .why-card {
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 20px;
                padding: 36px 24px;
                text-align: center;
                transition: background 0.25s, transform 0.25s;
                height: 100%;
            }
            .why-card:hover {
                background: rgba(255,255,255,0.14);
                transform: translateY(-6px);
            }
            .why-icon {
                font-size: 2.4rem;
                margin-bottom: 16px;
                display: block;
            }
            .why-title {
                font-weight: 700;
                color: #fff;
                font-size: 1.05rem;
                margin-bottom: 8px;
            }
            .why-desc {
                color: rgba(255,255,255,0.65);
                font-size: 0.88rem;
                line-height: 1.6;
            }

            .fade-up {
                opacity: 0;
                animation: fadeUp 0.7s ease forwards;
            }
            .fade-in {
                opacity: 0;
                animation: fadeIn 1s ease forwards;
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

    const occasions = [
        { icon: '💍', name: 'Wedding',       count: '44 Products' },
        { icon: '🎁', name: 'Birthday',      count: '56 Products' },
        { icon: '💝', name: 'Anniversary',   count: '11 Products' },
        { icon: '🙏', name: 'Thank You',     count: '28 Products' },
        { icon: '🎓', name: 'Graduation',    count: '15 Products' },
        { icon: '🤒', name: 'Get Well Soon', count: '18 Products' },
    ];

    const features = [
        { icon: '🚚', title: 'Fast Delivery',       desc: 'Same-day delivery available for local orders' },
        { icon: '🌸', title: 'Fresh Flowers',        desc: 'Handpicked daily straight from local farms' },
        { icon: '💯', title: 'Quality Guaranteed',  desc: '100% satisfaction or we make it right' },
        { icon: '💳', title: 'Secure Payment',      desc: 'Safe, encrypted checkout every time' },
    ];

    return (
        <Fragment>
            <MetaData title={'Home'} />

            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="hero-section">
                <div className="hero-overlay" />

                <div className={`hero-content ${isVisible ? 'fade-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                    <span className="hero-tag">🌸 Premium Flower Shop</span>

                    <h1 className="hero-title">
                        Nature's Beauty,<br />
                        <span>Delivered to</span><br />
                        Your Door.
                    </h1>

                    <p className="hero-subtitle">
                        Fresh flowers for every occasion — handpicked with love and delivered with care, right to your doorstep.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/products" className="btn-primary-hero">
                            Shop Now
                        </Link>
                        <Link to="/products" className="btn-outline-hero">
                            View All Products
                        </Link>
                    </div>
                </div>

                <div className={`hero-stats ${isVisible ? 'fade-up' : ''}`} style={{ animationDelay: '0.4s' }}>
                    <div className="hero-stat-item">
                        <div className="hero-stat-number">1000+</div>
                        <div className="hero-stat-label">Products</div>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-item">
                        <div className="hero-stat-number">800+</div>
                        <div className="hero-stat-label">Customers</div>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-item">
                        <div className="hero-stat-number">4.9★</div>
                        <div className="hero-stat-label">Rating</div>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-item">
                        <div className="hero-stat-number">99%</div>
                        <div className="hero-stat-label">Satisfied</div>
                    </div>
                </div>
            </section>

            {/* ── OCCASIONS ────────────────────────────────────── */}
            <section className="occasions-section">
                <div className="container">
                    <div className="text-center">
                        <p className="section-label">Browse by occasion</p>
                        <h2 className="section-title">Shop By <span>Occasions</span></h2>
                        <p className="section-subtitle" style={{ marginBottom: '30px' }}>Find the perfect flowers for every special moment</p>
                    </div>
                    <div className="row">
                        {occasions.map((occasion, i) => (
                            <div key={i} className="col-6 col-sm-4 col-md-2 mb-4">
                                <Link to="/products" className="occasion-card">
                                    <span className="occasion-icon">{occasion.icon}</span>
                                    <div className="occasion-name">{occasion.name}</div>
                                    <div className="occasion-count">{occasion.count}</div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURED PRODUCTS ────────────────────────────── */}
            <section className="products-section">
                <div className="container">
                    <div className="text-center">
                        <p className="section-label">Our bestsellers</p>
                        <h2 className="section-title">Top Seller <span>Products</span></h2>
                        <p className="section-subtitle" style={{ marginBottom: '30px' }}>Handpicked favourites loved by our customers</p>
                    </div>

                    <div className="row">
                        {loading ? (
                            <div className="col-12 text-center py-5">
                                <div className="spinner-border text-purple" role="status" style={{ color: '#6b46c1' }} />
                            </div>
                        ) : products.length > 0 ? (
                            products.slice(0, 4).map(product => (
                                <div key={product._id} className="col-sm-6 col-lg-3 mb-4 d-flex">
                                    <div className="product-card w-100">
                                        <img
                                            src={product.images[0]?.url || 'https://via.placeholder.com/400x220?text=No+Image'}
                                            alt={product.name}
                                        />
                                        <div className="product-card-body">
                                            <Link to={`/product/${product._id}`} className="product-card-title">
                                                {product.name}
                                            </Link>
                                            <div className="ratings">
                                                <div className="rating-outer">
                                                    <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                    ({product.numOfReviews} reviews)
                                                </span>
                                            </div>
                                            <div className="product-price">${product.price}</div>
                                            <Link to={`/product/${product._id}`} className="btn-view">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <p style={{ color: '#64748b' }}>No products available yet. Check back soon! 🌸</p>
                            </div>
                        )}
                    </div>

                    {products.length > 4 && (
                        <div className="text-center mt-4">
                            <Link to="/products" className="btn-primary-hero" style={{ display: 'inline-block' }}>
                                View All Products
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── WHY CHOOSE US ─────────────────────────────────── */}
            <section className="why-section">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="text-center mb-4">
                        <p className="section-label" style={{ color: '#c4b5fd' }}>Our promise</p>
                        <h2 className="section-title" style={{ color: '#fff' }}>
                            Why Choose <span style={{ color: '#c084fc' }}>FleurEase?</span>
                        </h2>
                        <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Experience the difference with our premium service
                        </p>
                    </div>
                    <div className="row">
                        {features.map((f, i) => (
                            <div key={i} className="col-sm-6 col-md-3 mb-4 d-flex">
                                <div className="why-card w-100">
                                    <span className="why-icon">{f.icon}</span>
                                    <div className="why-title">{f.title}</div>
                                    <div className="why-desc">{f.desc}</div>
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
