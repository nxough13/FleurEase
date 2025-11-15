import React, { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { getUser, getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import axios from 'axios';

const ConfirmOrder = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [loading, setLoading] = useState(false);

    // Get cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Get shipping info from localStorage
    const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');

    // Calculate prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 2000 ? 0 : 100;
    const taxPrice = Number((0.12 * itemsPrice).toFixed(2));
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

    const processPayment = async () => {
        if (!user) {
            toast.error('Please login to place order');
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            navigate('/cart');
            return;
        }

        setLoading(true);

        const order = {
            orderItems: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                image: item.image,
                price: item.price,
                product: item.product
            })),
            shippingInfo,
            itemsPrice: Number(itemsPrice),
            taxPrice: Number(taxPrice),
            shippingPrice: Number(shippingPrice),
            totalPrice: Number(totalPrice),
            paymentInfo: {
                id: 'CASH_ON_DELIVERY_' + Date.now(),
                status: 'Cash on Delivery'
            }
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API}/order/new`,
                order,
                config
            );

            // Clear cart and shipping info
            localStorage.removeItem('cart');
            localStorage.removeItem('shippingInfo');

            toast.success('Order placed successfully!');
            navigate('/orders/me');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error placing order');
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <MetaData title={'Confirm Order'} />

            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 0',
                marginBottom: '30px'
            }}>
                <div className="container">
                    <h1 style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
                        <i className="fa fa-check-circle mr-2"></i>
                        Confirm Order
                    </h1>
                </div>
            </div>

            <div className="container" style={{ marginBottom: '50px' }}>
                <div className="row">
                    {/* Order Details */}
                    <div className="col-12 col-lg-8">
                        {/* Shipping Info */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                <i className="fa fa-truck mr-2"></i>
                                Shipping Information
                            </h4>
                            <p style={{ color: '#333', marginBottom: '10px' }}>
                                <strong>Name:</strong> {user?.name}
                            </p>
                            <p style={{ color: '#333', marginBottom: '10px' }}>
                                <strong>Phone:</strong> {shippingInfo.phoneNo}
                            </p>
                            <p style={{ color: '#333', marginBottom: '0' }}>
                                <strong>Address:</strong> {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}
                            </p>
                        </div>

                        {/* Cart Items */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                            <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                <i className="fa fa-shopping-cart mr-2"></i>
                                Your Cart Items
                            </h4>
                            {cartItems.map(item => (
                                <div key={item.product} style={{
                                    display: 'flex',
                                    gap: '20px',
                                    padding: '15px 0',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '10px'
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <Link
                                            to={`/product/${item.product}`}
                                            style={{
                                                color: '#333',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {item.name}
                                        </Link>
                                        <p style={{ color: '#666', margin: '5px 0' }}>
                                            {item.quantity} x ₱{item.price.toLocaleString()} = <strong style={{ color: '#6b46c1' }}>₱{(item.quantity * item.price).toLocaleString()}</strong>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="col-12 col-lg-4">
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            position: 'sticky',
                            top: '20px'
                        }}>
                            <h4 style={{ color: '#6b46c1', marginBottom: '25px', fontWeight: 'bold' }}>
                                Order Summary
                            </h4>

                            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Subtotal:</span>
                                <span style={{ color: '#333', fontWeight: '600' }}>₱{itemsPrice.toLocaleString()}</span>
                            </div>

                            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Shipping:</span>
                                <span style={{ color: '#333', fontWeight: '600' }}>
                                    {shippingPrice === 0 ? 'FREE' : `₱${shippingPrice.toLocaleString()}`}
                                </span>
                            </div>

                            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Tax (12%):</span>
                                <span style={{ color: '#333', fontWeight: '600' }}>₱{taxPrice.toLocaleString()}</span>
                            </div>

                            <hr style={{ border: 'none', borderTop: '2px solid #e0e0e0', margin: '20px 0' }} />

                            <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>Total:</span>
                                <span style={{ color: '#6b46c1', fontSize: '1.3rem', fontWeight: 'bold' }}>₱{Number(totalPrice).toLocaleString()}</span>
                            </div>

                            <button
                                onClick={processPayment}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: loading ? '#ccc' : '#6b46c1',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = '#8b5cf6';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = '#6b46c1';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {loading ? (
                                    <>
                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-check mr-2"></i>
                                        Place Order (Cash on Delivery)
                                    </>
                                )}
                            </button>

                            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '15px', textAlign: 'center' }}>
                                <i className="fa fa-money mr-2"></i>
                                Payment will be collected upon delivery
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default ConfirmOrder;
