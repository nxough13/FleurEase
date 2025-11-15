import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [showProductSubmenu, setShowProductSubmenu] = useState(false);
    const navigate = useNavigate();

    const logoutHandler = () => {
        logout(() => {
            toast.success('Logged out successfully! See you soon 🌸');
            navigate('/');
        });
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                style={{
                    position: 'fixed',
                    left: isOpen ? '250px' : '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1100,
                    backgroundColor: '#6b46c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: isOpen ? '0 50% 50% 0' : '0 50% 50% 0',
                    padding: '15px 10px',
                    cursor: 'pointer',
                    transition: 'left 0.3s ease',
                    boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
                    fontSize: '1.2rem',
                    width: '40px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <i className={`fa fa-chevron-${isOpen ? 'left' : 'right'}`}></i>
            </button>

            {/* Sidebar */}
            <div 
                className="sidebar-wrapper"
                style={{
                    position: 'fixed',
                    left: isOpen ? '0' : '-250px',
                    top: 0,
                    height: '100vh',
                    width: '250px',
                    backgroundColor: '#6b46c1',
                    transition: 'left 0.3s ease',
                    zIndex: 1000,
                    overflowY: 'auto',
                    boxShadow: isOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none'
                }}
            >
                <nav id="sidebar">
                    <div className="sidebar-header" style={{
                        padding: '20px',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#5a3a9e'
                    }}>
                        <h3 style={{ color: 'white', fontWeight: 'bold', margin: 0, fontSize: '1.3rem' }}>
                            🌸 FleurEase
                        </h3>
                        <p style={{ color: '#e9d5ff', margin: '5px 0 0 0', fontSize: '0.85rem' }}>Admin Panel</p>
                    </div>

                    <ul className="list-unstyled components" style={{ padding: '20px 0' }}>
                        <li style={{ marginBottom: '5px' }}>
                            <Link 
                                to="/admin/dashboard"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    transition: 'background 0.3s',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fa fa-tachometer" style={{ width: '20px' }}></i>
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        <li style={{ marginBottom: '5px' }}>
                            <button
                                onClick={() => setShowProductSubmenu(!showProductSubmenu)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 20px',
                                    color: 'white',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <i className="fa fa-shopping-bag" style={{ width: '20px' }}></i>
                                    <span>Products</span>
                                </div>
                                <i className={`fa fa-chevron-${showProductSubmenu ? 'up' : 'down'}`} style={{ fontSize: '0.8rem' }}></i>
                            </button>
                            
                            {showProductSubmenu && (
                                <ul className="list-unstyled" style={{ 
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    margin: 0,
                                    padding: '5px 0'
                                }}>
                                    <li>
                                        <Link 
                                            to="/admin/products"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '10px 20px 10px 52px',
                                                color: '#e9d5ff',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                gap: '10px'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <i className="fa fa-list" style={{ width: '16px' }}></i>
                                            <span>All Products</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/admin/product/new"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '10px 20px 10px 52px',
                                                color: '#e9d5ff',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                gap: '10px'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <i className="fa fa-plus" style={{ width: '16px' }}></i>
                                            <span>Add Product</span>
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        <li style={{ marginBottom: '5px' }}>
                            <Link 
                                to="/admin/categories"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    transition: 'background 0.3s',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fa fa-tags" style={{ width: '20px' }}></i>
                                <span>Categories</span>
                            </Link>
                        </li>

                        <li style={{ marginBottom: '5px' }}>
                            <Link 
                                to="/admin/orders"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    transition: 'background 0.3s',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fa fa-clipboard" style={{ width: '20px' }}></i>
                                <span>Orders</span>
                            </Link>
                        </li>

                        <li style={{ marginBottom: '5px' }}>
                            <Link 
                                to="/admin/users"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    transition: 'background 0.3s',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fa fa-users" style={{ width: '20px' }}></i>
                                <span>Users</span>
                            </Link>
                        </li>

                        <li style={{ marginBottom: '5px' }}>
                            <Link 
                                to="/admin/reviews"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    transition: 'background 0.3s',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fa fa-star" style={{ width: '20px' }}></i>
                                <span>Reviews</span>
                            </Link>
                        </li>

                        <li style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                            <Link 
                                to="/"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#e9d5ff',
                                    textDecoration: 'none',
                                    transition: 'background 0.3s',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fa fa-home" style={{ width: '20px' }}></i>
                                <span>Go to Store</span>
                            </Link>
                        </li>

                        <li>
                            <button
                                onClick={logoutHandler}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#ff6b6b',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s',
                                    gap: '12px',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,107,107,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="fa fa-sign-out" style={{ width: '20px' }}></i>
                                <span>Logout</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Overlay when sidebar is open */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            )}
        </>
    );
};

export default Sidebar;
