import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedCart = cartItems.map(item => {
            if (item.product === productId) {
                if (newQuantity > item.stock) {
                    toast.error('Cannot exceed available stock');
                    return item;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        });

        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const removeItem = (productId) => {
        const updatedCart = cartItems.filter(item => item.product !== productId);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success('Item removed from cart');
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        toast.success('Cart cleared');
    };

    const getSubtotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    };

    const getTax = () => {
        return getSubtotal() * 0.12; // 12% tax
    };

    const getTotal = () => {
        return getSubtotal() + getTax();
    };

    return (
        <Fragment>
            <MetaData title={'Shopping Cart'} />

            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 0' }}>
                <div className="container">
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                        padding: '30px',
                        borderRadius: '15px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 15px rgba(107, 70, 193, 0.3)'
                    }}>
                        <h1 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
                            <i className="fa fa-shopping-cart mr-2"></i>
                            Shopping Cart
                        </h1>
                        <p style={{ color: '#e9d5ff', margin: '10px 0 0 0' }}>
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>

                    {cartItems.length === 0 ? (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '60px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
                            <h3 style={{ color: '#6b46c1', marginBottom: '15px' }}>Your cart is empty</h3>
                            <p style={{ color: '#666', marginBottom: '30px' }}>
                                Add some beautiful flowers to your cart!
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
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="row">
                            {/* Cart Items */}
                            <div className="col-lg-8">
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    marginBottom: '20px'
                                }}>
                                    {cartItems.map((item, index) => (
                                        <div
                                            key={item.product}
                                            style={{
                                                display: 'flex',
                                                gap: '20px',
                                                padding: '20px',
                                                borderBottom: index !== cartItems.length - 1 ? '2px solid #f0f0f0' : 'none',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {/* Product Image */}
                                            <Link to={`/product/${item.product}`}>
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/100'}
                                                    alt={item.name}
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10px',
                                                        border: '2px solid #f0f0f0'
                                                    }}
                                                />
                                            </Link>

                                            {/* Product Info */}
                                            <div style={{ flex: 1 }}>
                                                <Link
                                                    to={`/product/${item.product}`}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    <h5 style={{
                                                        color: '#333',
                                                        fontWeight: 'bold',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {item.name}
                                                    </h5>
                                                </Link>
                                                <p style={{
                                                    color: '#6b46c1',
                                                    fontSize: '1.3rem',
                                                    fontWeight: 'bold',
                                                    margin: 0
                                                }}>
                                                    ₱{item.price.toLocaleString()}
                                                </p>
                                                <p style={{ color: '#999', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                                                    Stock: {item.stock} available
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button
                                                    onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                                    style={{
                                                        width: '35px',
                                                        height: '35px',
                                                        borderRadius: '8px',
                                                        border: '2px solid #6b46c1',
                                                        backgroundColor: 'white',
                                                        color: '#6b46c1',
                                                        fontSize: '1.1rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    -
                                                </button>
                                                <span style={{
                                                    width: '50px',
                                                    textAlign: 'center',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                                    style={{
                                                        width: '35px',
                                                        height: '35px',
                                                        borderRadius: '8px',
                                                        border: '2px solid #6b46c1',
                                                        backgroundColor: 'white',
                                                        color: '#6b46c1',
                                                        fontSize: '1.1rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Subtotal */}
                                            <div style={{
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                color: '#333',
                                                minWidth: '120px',
                                                textAlign: 'right'
                                            }}>
                                                ₱{(item.price * item.quantity).toLocaleString()}
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeItem(item.product)}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#fee',
                                                    color: '#dc3545',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee'}
                                                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                                                onMouseOut={(e) => e.currentTarget.style.color = '#dc3545'}
                                            >
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Clear Cart Button */}
                                    <div style={{ padding: '20px 20px 0 20px', textAlign: 'right' }}>
                                        <button
                                            onClick={clearCart}
                                            style={{
                                                padding: '10px 25px',
                                                borderRadius: '20px',
                                                border: '2px solid #dc3545',
                                                backgroundColor: 'white',
                                                color: '#dc3545',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#dc3545';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'white';
                                                e.currentTarget.style.color = '#dc3545';
                                            }}
                                        >
                                            <i className="fa fa-trash mr-2"></i>
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="col-lg-4">
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    position: 'sticky',
                                    top: '20px'
                                }}>
                                    <h4 style={{
                                        color: '#6b46c1',
                                        fontWeight: 'bold',
                                        marginBottom: '20px',
                                        paddingBottom: '15px',
                                        borderBottom: '2px solid #f0f0f0'
                                    }}>
                                        Order Summary
                                    </h4>

                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '10px'
                                        }}>
                                            <span style={{ color: '#666' }}>Subtotal:</span>
                                            <span style={{ fontWeight: '600' }}>₱{getSubtotal().toLocaleString()}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '10px'
                                        }}>
                                            <span style={{ color: '#666' }}>Tax (12%):</span>
                                            <span style={{ fontWeight: '600' }}>₱{getTax().toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '15px 0',
                                        borderTop: '2px solid #f0f0f0',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '1.3rem'
                                        }}>
                                            <span style={{ fontWeight: 'bold', color: '#333' }}>Total:</span>
                                            <span style={{ fontWeight: 'bold', color: '#6b46c1' }}>
                                                ₱{getTotal().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/shipping')}
                                        style={{
                                            width: '100%',
                                            padding: '15px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            marginBottom: '15px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <i className="fa fa-credit-card mr-2"></i>
                                        Proceed to Checkout
                                    </button>

                                    <Link
                                        to="/products"
                                        style={{
                                            display: 'block',
                                            textAlign: 'center',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '2px solid #6b46c1',
                                            color: '#6b46c1',
                                            textDecoration: 'none',
                                            fontWeight: '600',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#6b46c1';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#6b46c1';
                                        }}
                                    >
                                        <i className="fa fa-arrow-left mr-2"></i>
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
};

export default Cart;
