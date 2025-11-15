import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUser();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [showDropdown, setShowDropdown] = useState(false);

    const logoutHandler = () => {
        logout(() => {
            toast.success('Logged out successfully! See you soon 🌸');
            navigate('/');
        });
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // Admin Header
    if (isAdminRoute && user && user.role === 'admin') {
        return (
            <nav className="navbar row" style={{ backgroundColor: '#6b46c1' }}>
                <div className="col-12 col-md-4">
                    <div className="navbar-brand">
                        <Link to="/admin/dashboard">
                            <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                🌸 FleurEase Admin
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="col-12 col-md-4 mt-2 mt-md-0 text-center">
                    <span style={{ color: 'white', fontSize: '1.1rem' }}>
                        Admin Dashboard
                    </span>
                </div>

                <div className="col-12 col-md-4 mt-4 mt-md-0 text-right">
                    <div className="dropdown d-inline">
                        <Link
                            to="#!"
                            className="btn dropdown-toggle text-white"
                            type="button"
                            id="dropDownMenuButton"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                            <figure className="avatar avatar-nav">
                                <img
                                    src={user.avatar && user.avatar.url}
                                    alt={user && user.name}
                                    className="rounded-circle"
                                />
                            </figure>
                            <span>{user && user.name}</span>
                        </Link>

                        <div className="dropdown-menu" aria-labelledby="dropDownMenuButton">
                            <Link className="dropdown-item" to="/">
                                <i className="fa fa-home"></i> Go to Store
                            </Link>
                            <Link className="dropdown-item" to="/admin/dashboard">
                                <i className="fa fa-tachometer"></i> Dashboard
                            </Link>
                            <Link className="dropdown-item" to="/me">
                                <i className="fa fa-user"></i> Profile
                            </Link>
                            <div className="dropdown-divider"></div>
                            <Link className="dropdown-item text-danger" to="/" onClick={logoutHandler}>
                                <i className="fa fa-sign-out"></i> Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    // Regular User/Guest Header
    return (
        <nav className="navbar row" style={{ backgroundColor: '#6b46c1' }}>
            <div className="col-12 col-md-3">
                <div className="navbar-brand">
                    <Link to="/">
                        <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            🌸 FleurEase
                        </span>
                    </Link>
                </div>
            </div>

            <div className="col-12 col-md-6 mt-2 mt-md-0">
                <div className="input-group">
                    <input
                        type="text"
                        id="search_field"
                        className="form-control"
                        placeholder="Search flowers..."
                    />
                    <div className="input-group-append">
                        <button id="search_btn" className="btn">
                            <i className="fa fa-search" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="col-12 col-md-3 mt-4 mt-md-0 text-center d-flex align-items-center justify-content-end" style={{ gap: '10px' }}>
                {/* Products Link */}
                <Link to="/products" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-light" style={{ 
                        borderRadius: '20px',
                        padding: '8px 20px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i className="fa fa-shopping-bag"></i>
                        <span>Products</span>
                    </button>
                </Link>

                {/* Wishlist Button */}
                {user && (
                    <Link to="/wishlist" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-light" style={{ 
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <i className="fa fa-heart" style={{ color: '#e74c3c' }}></i>
                            <span>Wishlist</span>
                        </button>
                    </Link>
                )}

                {/* Cart Button */}
                <Link to="/cart" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-light" style={{ 
                        borderRadius: '20px',
                        padding: '8px 20px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i className="fa fa-shopping-cart"></i>
                        <span>Cart</span>
                    </button>
                </Link>

                {user ? (
                    <div className="dropdown d-inline" style={{ position: 'relative' }}>
                        <button
                            onClick={toggleDropdown}
                            className="btn text-white"
                            type="button"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '25px',
                                padding: '8px 15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <figure className="avatar avatar-nav" style={{ margin: 0 }}>
                                <img
                                    src={user.avatar && user.avatar.url}
                                    alt={user && user.name}
                                    className="rounded-circle"
                                    style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                />
                            </figure>
                            <span style={{ fontWeight: '500' }}>{user && user.name}</span>
                            <i className={`fa fa-chevron-${showDropdown ? 'up' : 'down'}`} style={{ fontSize: '0.8rem' }}></i>
                        </button>

                        <div className={`dropdown-menu dropdown-menu-right ${showDropdown ? 'show' : ''}`} style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '5px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: 'none',
                            minWidth: '220px'
                        }}>
                            {/* User Info Header */}
                            <div style={{
                                padding: '15px',
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: '#f8f9fa'
                            }}>
                                <div style={{ fontWeight: 'bold', color: '#6b46c1' }}>{user.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.email}</div>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    marginTop: '5px',
                                    padding: '3px 8px',
                                    backgroundColor: user.role === 'admin' ? '#6b46c1' : '#9f7aea',
                                    color: 'white',
                                    borderRadius: '10px',
                                    display: 'inline-block'
                                }}>
                                    {user.role === 'admin' ? '👑 Admin' : '🌸 Customer'}
                                </div>
                            </div>

                            {/* Navigation Links - Only for Regular Users */}
                            {user && user.role !== 'admin' && (
                                <>
                                    <Link className="dropdown-item" to="/" style={{
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <i className="fa fa-home" style={{ color: '#9f7aea', width: '20px' }}></i>
                                        <span>Home</span>
                                    </Link>
                                    <Link className="dropdown-item" to="/products" style={{
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <i className="fa fa-shopping-bag" style={{ color: '#9f7aea', width: '20px' }}></i>
                                        <span>All Products</span>
                                    </Link>
                                    <Link className="dropdown-item" to="/wishlist" style={{
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <i className="fa fa-heart" style={{ color: '#e74c3c', width: '20px' }}></i>
                                        <span>My Wishlist</span>
                                    </Link>
                                    <Link className="dropdown-item" to="/cart" style={{
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <i className="fa fa-shopping-cart" style={{ color: '#9f7aea', width: '20px' }}></i>
                                        <span>Shopping Cart</span>
                                    </Link>
                                    <Link className="dropdown-item" to="/orders/me" style={{
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <i className="fa fa-clipboard" style={{ color: '#9f7aea', width: '20px' }}></i>
                                        <span>My Orders</span>
                                    </Link>
                                    <Link className="dropdown-item" to="/me" style={{
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <i className="fa fa-user" style={{ color: '#9f7aea', width: '20px' }}></i>
                                        <span>My Profile</span>
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                </>
                            )}

                            {/* Admin - Direct to Dashboard */}
                            {user && user.role === 'admin' && (
                                <>
                                    <Link className="dropdown-item" to="/admin/dashboard" style={{
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        backgroundColor: '#f8f4ff'
                                    }}>
                                        <i className="fa fa-tachometer" style={{ color: '#6b46c1', width: '20px' }}></i>
                                        <span style={{ fontWeight: 'bold', color: '#6b46c1' }}>Go to Admin Dashboard</span>
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                </>
                            )}
                            
                            <div className="dropdown-divider"></div>
                            
                            {/* Logout Button */}
                            <Link 
                                className="dropdown-item" 
                                to="/" 
                                onClick={logoutHandler}
                                style={{
                                    padding: '12px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#dc3545',
                                    fontWeight: '500'
                                }}
                            >
                                <i className="fa fa-sign-out" style={{ width: '20px' }}></i>
                                <span>Logout</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="d-flex gap-2">
                        <Link to="/login" className="btn btn-light" style={{
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontWeight: '500',
                            marginRight: '10px'
                        }}>
                            <i className="fa fa-sign-in mr-2"></i>
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-light" style={{
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontWeight: '500',
                            backgroundColor: 'white',
                            color: '#6b46c1'
                        }}>
                            <i className="fa fa-user-plus mr-2"></i>
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Header;
