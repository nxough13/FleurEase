import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [showProductSubmenu, setShowProductSubmenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Close sidebar when route changes
    useEffect(() => {
        if (isOpen) {
            toggleSidebar();
        }
    }, [location.pathname]);

    const logoutHandler = () => {
        logout(() => {
            toast.success('Logged out successfully! See you soon 🌸');
            navigate('/');
        });
    };

    // Backdrop variants for overlay
    const backdropVariants = {
        hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
        visible: { 
            opacity: 1, 
            backdropFilter: 'blur(4px)',
            transition: { duration: 0.3 }
        }
    };

    // Sidebar variants for slide-in animation
    const sidebarVariants = {
        hidden: { 
            x: '-100%',
            opacity: 0.8,
        },
        visible: { 
            x: 0,
            opacity: 1,
            transition: { 
                type: 'spring',
                damping: 25,
                stiffness: 200,
                when: 'beforeChildren',
            }
        },
        exit: { 
            x: '-100%',
            opacity: 0.8,
            transition: { 
                duration: 0.2,
                when: 'afterChildren',
            }
        }
    };
    
    // Animation variants for menu items
    const menuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3
            }
        }),
        exit: { opacity: 0, x: -20 }
    };

    return (
        <>
            {/* Overlay Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={backdropVariants}
                        onClick={toggleSidebar}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            zIndex: 999,
                            pointerEvents: isOpen ? 'auto' : 'none',
                        }}
                    />
                )}
            </AnimatePresence>


            {/* Glass Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="sidebar-wrapper"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={sidebarVariants}
                        style={{
                            position: 'fixed',
                            left: 0,
                            top: '70px',
                            height: 'calc(100vh - 70px)',
                            width: '280px',
                            zIndex: 1000,
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(107, 70, 193, 0.4) transparent',
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(107, 70, 193, 0.4)',
                                borderRadius: '3px',
                            },
                        }}
                    >
                        <nav id="sidebar" style={{
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '4px 0 30px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Sidebar Header */}
                            <div style={{
                                padding: '30px 25px',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '-50px',
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.1)'
                                }}></div>
                                <h3 style={{ 
                                    fontWeight: '700', 
                                    margin: '0 0 5px 0', 
                                    fontSize: '1.5rem',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    🌸 FleurEase
                                </h3>
                                <p style={{ 
                                    margin: '0', 
                                    fontSize: '0.9rem',
                                    opacity: 0.9,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    Admin Dashboard
                                </p>
                            </div>

                            {/* Navigation Items */}
                            <div style={{ padding: '20px 15px', flex: 1, overflowY: 'auto' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <motion.li 
                                        key="dashboard"
                                        style={{ marginBottom: '5px' }}
                                        custom={0}
                                        variants={menuItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <Link 
                                            to="/admin/dashboard"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px 15px',
                                                textDecoration: 'none',
                                                borderRadius: '10px',
                                                transition: 'all 0.3s ease',
                                                background: location.pathname === '/admin/dashboard' ? 'rgba(107, 70, 193, 0.1)' : 'transparent',
                                                fontWeight: location.pathname === '/admin/dashboard' ? '600' : '400',
                                                color: location.pathname === '/admin/dashboard' ? '#6b46c1' : '#4a4a4a'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (location.pathname !== '/admin/dashboard') {
                                                    e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                                    e.target.style.color = '#6b46c1';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (location.pathname !== '/admin/dashboard') {
                                                    e.target.style.background = 'transparent';
                                                    e.target.style.color = '#4a4a4a';
                                                }
                                            }}
                                        >
                                            <i className="fa fa-tachometer" style={{ 
                                                width: '24px',
                                                fontSize: '1.1rem',
                                                textAlign: 'center',
                                                marginRight: '12px',
                                                color: location.pathname === '/admin/dashboard' ? '#6b46c1' : '#6b46c1'
                                            }}></i>
                                            <span>Dashboard</span>
                                        </Link>
                                    </motion.li>

                                    <motion.li 
                                        key="products"
                                        style={{ marginBottom: '5px' }}
                                        custom={1}
                                        variants={menuItemVariants}
                                    >
                                        <div 
                                            onClick={() => setShowProductSubmenu(!showProductSubmenu)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 15px',
                                                textDecoration: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                background: (location.pathname === '/admin/products' || location.pathname === '/admin/product/new') ? 'rgba(107, 70, 193, 0.1)' : 'transparent',
                                                fontWeight: (location.pathname === '/admin/products' || location.pathname === '/admin/product/new') ? '600' : '400',
                                                color: (location.pathname === '/admin/products' || location.pathname === '/admin/product/new') ? '#6b46c1' : '#4a4a4a'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!(location.pathname === '/admin/products' || location.pathname === '/admin/product/new')) {
                                                    e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                                    e.target.style.color = '#6b46c1';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!(location.pathname === '/admin/products' || location.pathname === '/admin/product/new')) {
                                                    e.target.style.background = 'transparent';
                                                    e.target.style.color = '#4a4a4a';
                                                }
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <i className="fa fa-shopping-bag" style={{ 
                                                    width: '24px',
                                                    fontSize: '1.1rem',
                                                    textAlign: 'center',
                                                    marginRight: '12px',
                                                    color: (location.pathname === '/admin/products' || location.pathname === '/admin/product/new') ? '#6b46c1' : '#6b46c1'
                                                }}></i>
                                                <span>Products</span>
                                            </div>
                                            <i 
                                                className={`fa fa-chevron-${showProductSubmenu ? 'up' : 'down'}`} 
                                                style={{ 
                                                    fontSize: '0.8rem',
                                                    transition: 'transform 0.3s ease',
                                                    color: (location.pathname === '/admin/products' || location.pathname === '/admin/product/new') ? '#6b46c1' : '#6b46c1'
                                                }}
                                            />
                                        </div>

                                        {/* Product Submenu */}
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: showProductSubmenu ? 'auto' : 0,
                                                opacity: showProductSubmenu ? 1 : 0,
                                                overflow: 'hidden'
                                            }}
                                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                                            style={{
                                                paddingLeft: '20px',
                                                marginTop: '5px'
                                            }}
                                        >
                                            <Link 
                                                to="/admin/products"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px 15px',
                                                    color: location.pathname === '/admin/products' ? '#6b46c1' : '#555',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    fontWeight: location.pathname === '/admin/products' ? '600' : '400',
                                                    transition: 'all 0.2s ease',
                                                    borderRadius: '6px',
                                                    margin: '0 5px',
                                                    background: location.pathname === '/admin/products' ? 'rgba(107, 70, 193, 0.1)' : 'transparent'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (location.pathname !== '/admin/products') {
                                                        e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                                        e.target.style.color = '#6b46c1';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (location.pathname !== '/admin/products') {
                                                        e.target.style.background = 'transparent';
                                                        e.target.style.color = '#555';
                                                    }
                                                }}
                                            >
                                                <i className="fa fa-list" style={{ 
                                                    width: '20px',
                                                    textAlign: 'center',
                                                    marginRight: '10px',
                                                    fontSize: '0.9rem'
                                                }}></i>
                                                <span>All Products</span>
                                            </Link>
                                        </motion.div>
                                    </motion.li>

                                    <motion.li 
                                        key="new-product"
                                        custom={2}
                                        variants={menuItemVariants}
                                        style={{ marginBottom: '5px' }}
                                    >
                                        <Link 
                                            to="/admin/product/new"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '10px 15px',
                                                color: location.pathname === '/admin/product/new' ? '#6b46c1' : '#555',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: location.pathname === '/admin/product/new' ? '600' : '400',
                                                transition: 'all 0.2s ease',
                                                borderRadius: '6px',
                                                margin: '0 5px',
                                                background: location.pathname === '/admin/product/new' ? 'rgba(107, 70, 193, 0.1)' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (location.pathname !== '/admin/product/new') {
                                                    e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                                    e.target.style.color = '#6b46c1';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (location.pathname !== '/admin/product/new') {
                                                    e.target.style.background = 'transparent';
                                                    e.target.style.color = '#555';
                                                }
                                            }}
                                        >
                                            <i className="fa fa-plus" style={{ 
                                                width: '20px',
                                                textAlign: 'center',
                                                marginRight: '10px',
                                                fontSize: '0.9rem'
                                            }}></i>
                                            <span>Add New Product</span>
                                        </Link>
                                    </motion.li>

                            {/* Categories Link */}
                            <motion.li 
                                key="categories"
                                custom={3}
                                variants={menuItemVariants}
                                style={{ marginBottom: '5px' }}
                            >
                                <Link 
                                    to="/admin/categories"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 15px',
                                        color: location.pathname === '/admin/categories' ? '#6b46c1' : '#4a4a4a',
                                        textDecoration: 'none',
                                        borderRadius: '10px',
                                    transition: 'all 0.3s ease',
                                    background: location.pathname === '/admin/categories' ? 'rgba(107, 70, 193, 0.1)' : 'transparent',
                                    fontWeight: location.pathname === '/admin/categories' ? '600' : '400'
                                }}
                                onMouseEnter={(e) => {
                                    if (location.pathname !== '/admin/categories') {
                                        e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                        e.target.style.color = '#6b46c1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (location.pathname !== '/admin/categories') {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = '#4a4a4a';
                                    }
                                }}
                            >
                                <i className="fa fa-tags" style={{ 
                                    width: '24px',
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    marginRight: '12px',
                                    color: location.pathname === '/admin/categories' ? '#6b46c1' : '#6b46c1'
                                }}></i>
                                <span>Categories</span>
                            </Link>
                        </motion.li>

                        <motion.li 
                            key="store"
                            custom={7}
                            variants={menuItemVariants}
                            style={{ marginTop: 'auto', marginBottom: '10px' }}
                        >
                            <Link 
                                to="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    color: '#4a4a4a',
                                    textDecoration: 'none',
                                    borderRadius: '10px',
                                    transition: 'all 0.3s ease',
                                    background: 'transparent',
                                    fontWeight: '400'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                    e.target.style.color = '#6b46c1';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#4a4a4a';
                                }}
                            >
                                <i className="fa fa-home" style={{ 
                                    width: '24px',
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    marginRight: '12px',
                                    color: '#6b46c1'
                                }}></i>
                                <span>Go to Store</span>
                            </Link>
                        </motion.li>

                        {/* Orders Link */}
                        <motion.li 
                            key="orders"
                            custom={4}
                            variants={menuItemVariants}
                            style={{ marginBottom: '5px' }}
                        >
                            <Link 
                                to="/admin/orders"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    color: location.pathname === '/admin/orders' ? '#6b46c1' : '#4a4a4a',
                                    textDecoration: 'none',
                                    borderRadius: '10px',
                                    transition: 'all 0.3s ease',
                                    background: location.pathname === '/admin/orders' ? 'rgba(107, 70, 193, 0.1)' : 'transparent',
                                    fontWeight: location.pathname === '/admin/orders' ? '600' : '400'
                                }}
                                onMouseEnter={(e) => {
                                    if (location.pathname !== '/admin/orders') {
                                        e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                        e.target.style.color = '#6b46c1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (location.pathname !== '/admin/orders') {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = '#4a4a4a';
                                    }
                                }}
                            >
                                <i className="fa fa-shopping-cart" style={{ 
                                    width: '24px',
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    marginRight: '12px',
                                    color: location.pathname === '/admin/orders' ? '#6b46c1' : '#6b46c1'
                                }}></i>
                                <span>Orders</span>
                            </Link>
                        </motion.li>

                        {/* Users Link */}
                        <motion.li 
                            key="users"
                            custom={5}
                            variants={menuItemVariants}
                            style={{ marginBottom: '5px' }}
                        >
                            <Link 
                                to="/admin/users"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    color: location.pathname === '/admin/users' ? '#6b46c1' : '#4a4a4a',
                                    textDecoration: 'none',
                                    borderRadius: '10px',
                                    transition: 'all 0.3s ease',
                                    background: location.pathname === '/admin/users' ? 'rgba(107, 70, 193, 0.1)' : 'transparent',
                                    fontWeight: location.pathname === '/admin/users' ? '600' : '400'
                                }}
                                onMouseEnter={(e) => {
                                    if (location.pathname !== '/admin/users') {
                                        e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                        e.target.style.color = '#6b46c1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (location.pathname !== '/admin/users') {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = '#4a4a4a';
                                    }
                                }}
                            >
                                <i className="fa fa-users" style={{ 
                                    width: '24px',
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    marginRight: '12px',
                                    color: location.pathname === '/admin/users' ? '#6b46c1' : '#6b46c1'
                                }}></i>
                                <span>Users</span>
                            </Link>
                        </motion.li>

                        {/* Reviews Link */}
                        <motion.li 
                            key="reviews"
                            custom={6}
                            variants={menuItemVariants}
                            style={{ marginBottom: '5px' }}
                        >
                            <Link 
                                to="/admin/reviews"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    color: location.pathname === '/admin/reviews' ? '#6b46c1' : '#4a4a4a',
                                    textDecoration: 'none',
                                    borderRadius: '10px',
                                    transition: 'all 0.3s ease',
                                    background: location.pathname === '/admin/reviews' ? 'rgba(107, 70, 193, 0.1)' : 'transparent',
                                    fontWeight: location.pathname === '/admin/reviews' ? '600' : '400'
                                }}
                                onMouseEnter={(e) => {
                                    if (location.pathname !== '/admin/reviews') {
                                        e.target.style.background = 'rgba(0, 0, 0, 0.03)';
                                        e.target.style.color = '#6b46c1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (location.pathname !== '/admin/reviews') {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = '#4a4a4a';
                                    }
                                }}
                            >
                                <i className="fa fa-star" style={{ 
                                    width: '24px',
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    marginRight: '12px',
                                    color: location.pathname === '/admin/reviews' ? '#6b46c1' : '#6b46c1'
                                }}></i>
                                <span>Reviews</span>
                            </Link>
                        </motion.li>

                        <motion.li 
                            key="store"
                            custom={7}
                            variants={menuItemVariants}
                            style={{ 
                                marginTop: '20px', 
                                borderTop: '1px solid rgba(255,255,255,0.2)', 
                                paddingTop: '20px' 
                            }}
                        >
                            <Link 
                                to="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#e9d5ff',
                                    textDecoration: 'none',
                                    gap: '12px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fa fa-home" style={{ width: '20px' }}></i>
                                <span>Go to Store</span>
                            </Link>
                        </motion.li>

                        <motion.li 
                            key="logout"
                            custom={8}
                            variants={menuItemVariants}
                            style={{ 
                                marginTop: 'auto', 
                                padding: '15px', 
                                borderTop: '1px solid rgba(0, 0, 0, 0.05)' 
                            }}
                        >
                            <button
                                onClick={logoutHandler}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '12px 20px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e53e3e',
                                    borderRadius: '8px',
                                    color: '#e53e3e',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500',
                                    fontSize: '0.9rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#e53e3e';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#e53e3e';
                                }}
                            >
                                <i className="fa fa-sign-out" style={{ marginRight: '8px' }}></i>
                                Logout
                            </button>
                        </motion.li>
                    </ul>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '15px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#888',
                    borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                    <p style={{ margin: '5px 0' }}>FleurEase Admin v1.0</p>
                    <p style={{ margin: '5px 0', fontSize: '0.7rem' }}> {new Date().getFullYear()} All Rights Reserved</p>
                </div>
            </nav>
        </motion.div>
    )}
</AnimatePresence>
</>
);
};

export default Sidebar;
