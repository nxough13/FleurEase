import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUser();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Transparent on hero, solid after scroll
    const isHome = location.pathname === '/';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const logoutHandler = () => {
        setShowDropdown(false);
        logout(() => {
            toast.success('Logged out successfully! See you soon 🌸');
            navigate('/');
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?keyword=${searchTerm.trim()}`);
            setSearchTerm('');
        }
    };

    const navBg = isHome && !scrolled
        ? 'transparent'
        : 'rgba(74, 29, 150, 0.97)';

    const navStyle = {
        position: isHome ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: navBg,
        backdropFilter: scrolled || !isHome ? 'blur(12px)' : 'none',
        borderBottom: scrolled || !isHome ? '1px solid rgba(255,255,255,0.1)' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        padding: '0 5vw',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
    };

    // ── ADMIN HEADER ──────────────────────────────────────────
    if (isAdminRoute && user && user.role === 'admin') {
        return (
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: 'rgba(74, 29, 150, 0.97)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '0 5vw',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Link to="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🌸</span>
                    <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
                        FleurEase <span style={{ color: '#c084fc', fontWeight: '500', fontSize: '0.85rem' }}>Admin</span>
                    </span>
                </Link>

                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowDropdown(!showDropdown)} style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50px',
                        padding: '6px 14px 6px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: '#fff',
                    }}>
                        <img
                            src={user.avatar?.url}
                            alt={user.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c084fc' }}
                        />
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</span>
                        <i className={`fa fa-chevron-${showDropdown ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', opacity: 0.7 }}></i>
                    </button>

                    {showDropdown && (
                        <div style={{
                            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                            background: '#fff', borderRadius: '14px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                            minWidth: '200px', overflow: 'hidden', zIndex: 2000,
                        }}>
                            <div style={{ padding: '14px 16px', background: '#f5f3ff', borderBottom: '1px solid #ede9fe' }}>
                                <div style={{ fontWeight: '700', color: '#4c1d95', fontSize: '0.9rem' }}>{user.name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#9f7aea' }}>{user.email}</div>
                            </div>
                            {[
                                { to: '/', icon: 'fa-home', label: 'Go to Store' },
                                { to: '/admin/dashboard', icon: 'fa-tachometer', label: 'Dashboard' },
                                { to: '/me', icon: 'fa-user', label: 'Profile' },
                            ].map(item => (
                                <Link key={item.to} to={item.to} onClick={() => setShowDropdown(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', color: '#374151', textDecoration: 'none', fontSize: '0.9rem' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <i className={`fa ${item.icon}`} style={{ color: '#9f7aea', width: '18px' }}></i>
                                    {item.label}
                                </Link>
                            ))}
                            <div style={{ borderTop: '1px solid #f3f4f6' }} />
                            <button onClick={logoutHandler} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '11px 16px', width: '100%', background: 'none',
                                border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.9rem',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                <i className="fa fa-sign-out" style={{ width: '18px' }}></i>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        );
    }

    // ── REGULAR HEADER ────────────────────────────────────────
    return (
        <nav style={navStyle}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '1.4rem' }}>🌸</span>
                <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
                    FleurEase
                </span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} style={{
                flex: 1, maxWidth: '480px',
                display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50px',
                padding: '0 6px 0 18px',
                transition: 'background 0.2s',
            }}
                onFocus={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onBlur={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search flowers..."
                    style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        color: '#fff', fontSize: '0.9rem', padding: '10px 0',
                    }}
                />
                <button type="submit" style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50px',
                    width: '34px', height: '34px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0,
                }}>
                    <i className="fa fa-search" style={{ fontSize: '0.85rem' }}></i>
                </button>
            </form>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <NavBtn to="/products" icon="fa-shopping-bag" label="Products" />
                {user && <NavBtn to="/cart" icon="fa-shopping-cart" label="Cart" />}
                {user && <NavBtn to="/wishlist" icon="fa-heart" label="Wishlist" iconColor="#f472b6" />}

                {user ? (
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button onClick={() => setShowDropdown(!showDropdown)} style={{
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50px',
                            padding: '5px 14px 5px 5px',
                            display: 'flex', alignItems: 'center', gap: '9px',
                            cursor: 'pointer', color: '#fff',
                            transition: 'background 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                        >
                            <img
                                src={user.avatar?.url}
                                alt={user.name}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c084fc' }}
                            />
                            <span style={{ fontWeight: '600', fontSize: '0.88rem', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </span>
                            <i className={`fa fa-chevron-${showDropdown ? 'up' : 'down'}`} style={{ fontSize: '0.68rem', opacity: 0.7 }}></i>
                        </button>

                        {showDropdown && (
                            <div style={{
                                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                background: '#fff', borderRadius: '14px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                                minWidth: '210px', overflow: 'hidden', zIndex: 2000,
                            }}>
                                <div style={{ padding: '14px 16px', background: '#f5f3ff', borderBottom: '1px solid #ede9fe' }}>
                                    <div style={{ fontWeight: '700', color: '#4c1d95', fontSize: '0.9rem' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#9f7aea', marginBottom: '6px' }}>{user.email}</div>
                                    <span style={{
                                        fontSize: '0.7rem', padding: '2px 10px',
                                        background: user.role === 'admin' ? '#6b46c1' : '#ede9fe',
                                        color: user.role === 'admin' ? '#fff' : '#6b46c1',
                                        borderRadius: '50px', fontWeight: '600',
                                    }}>
                                        {user.role === 'admin' ? '👑 Admin' : '🌸 Customer'}
                                    </span>
                                </div>

                                {user.role !== 'admin' && (
                                    <>
                                        {[
                                            { to: '/',          icon: 'fa-home',          label: 'Home' },
                                            { to: '/products',  icon: 'fa-shopping-bag',  label: 'All Products' },
                                            { to: '/wishlist',  icon: 'fa-heart',         label: 'My Wishlist',  color: '#f472b6' },
                                            { to: '/cart',      icon: 'fa-shopping-cart', label: 'Shopping Cart' },
                                            { to: '/orders/me', icon: 'fa-clipboard',     label: 'My Orders' },
                                            { to: '/me',        icon: 'fa-user',          label: 'My Profile' },
                                        ].map(item => (
                                            <DropdownItem key={item.to} {...item} onClose={() => setShowDropdown(false)} />
                                        ))}
                                        <div style={{ borderTop: '1px solid #f3f4f6' }} />
                                    </>
                                )}

                                {user.role === 'admin' && (
                                    <>
                                        <DropdownItem to="/admin/dashboard" icon="fa-tachometer" label="Admin Dashboard" color="#6b46c1" bold onClose={() => setShowDropdown(false)} />
                                        <div style={{ borderTop: '1px solid #f3f4f6' }} />
                                    </>
                                )}

                                <button onClick={logoutHandler} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '11px 16px', width: '100%', background: 'none',
                                    border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.9rem',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                    <i className="fa fa-sign-out" style={{ width: '18px' }}></i>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link to="/login" style={{
                            color: '#fff', fontWeight: '600', fontSize: '0.88rem',
                            padding: '8px 18px', borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            textDecoration: 'none', background: 'rgba(255,255,255,0.1)',
                            transition: 'background 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            Login
                        </Link>
                        <Link to="/register" style={{
                            color: '#6b46c1', fontWeight: '700', fontSize: '0.88rem',
                            padding: '8px 18px', borderRadius: '50px',
                            background: '#fff', textDecoration: 'none',
                            transition: 'opacity 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

// ── small reusable pieces ──────────────────────────────────────
const NavBtn = ({ to, icon, label, iconColor }) => (
    <Link to={to} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        color: 'rgba(255,255,255,0.85)', fontWeight: '500', fontSize: '0.88rem',
        textDecoration: 'none', padding: '7px 14px', borderRadius: '50px',
        transition: 'background 0.2s',
    }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
        <i className={`fa ${icon}`} style={{ color: iconColor || 'inherit', fontSize: '0.9rem' }}></i>
        <span>{label}</span>
    </Link>
);

const DropdownItem = ({ to, icon, label, color, bold, onClose }) => (
    <Link to={to} onClick={onClose} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '11px 16px', color: color || '#374151',
        textDecoration: 'none', fontSize: '0.9rem',
        fontWeight: bold ? '700' : '400',
        background: bold ? '#faf5ff' : 'transparent',
    }}
        onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
        onMouseLeave={e => e.currentTarget.style.background = bold ? '#faf5ff' : 'transparent'}
    >
        <i className={`fa ${icon}`} style={{ color: color || '#9f7aea', width: '18px' }}></i>
        {label}
    </Link>
);

export default Header;
