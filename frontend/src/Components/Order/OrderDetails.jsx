import React, { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getToken } from '../../Utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderDetails = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${id}`, config);
            setOrder(data.order);
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error loading order details');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing':
                return '#ffc107';
            case 'Shipped':
                return '#17a2b8';
            case 'Delivered':
                return '#28a745';
            default:
                return '#6c757d';
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!order) {
        return (
            <div className="container" style={{ padding: '50px 0', textAlign: 'center' }}>
                <h3>Order not found</h3>
                <Link to="/orders/me">Back to Orders</Link>
            </div>
        );
    }

    const { shippingInfo, orderItems, user, totalPrice, orderStatus, paymentInfo, createdAt } = order;

    return (
        <Fragment>
            <MetaData title={`Order #${id}`} />

            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 0',
                marginBottom: '30px'
            }}>
                <div className="container">
                    <h1 style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
                        <i className="fa fa-file-text mr-2"></i>
                        Order Details
                    </h1>
                    <p style={{ color: 'white', textAlign: 'center', margin: '10px 0 0 0', fontSize: '1.1rem' }}>
                        Order ID: #{id}
                    </p>
                </div>
            </div>

            <div className="container" style={{ marginBottom: '50px' }}>
                <div className="row">
                    {/* Left Column - Order Info */}
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
                            <p style={{ color: '#333', marginBottom: '10px' }}>
                                <strong>Address:</strong> {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}
                            </p>
                        </div>

                        {/* Payment Info */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                <i className="fa fa-credit-card mr-2"></i>
                                Payment Information
                            </h4>
                            <p style={{ color: '#333', marginBottom: '10px' }}>
                                <strong>Payment Method:</strong> {paymentInfo.status}
                            </p>
                            <p style={{ color: '#333', marginBottom: '0' }}>
                                <strong>Order Date:</strong> {new Date(createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        {/* Order Items */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                            <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                <i className="fa fa-shopping-cart mr-2"></i>
                                Order Items
                            </h4>
                            {orderItems && orderItems.map(item => (
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

                    {/* Right Column - Order Summary */}
                    <div className="col-12 col-lg-4">
                        {/* Order Status */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                Order Status
                            </h4>
                            <div style={{
                                padding: '20px',
                                borderRadius: '12px',
                                backgroundColor: getStatusColor(orderStatus) + '20',
                                border: `3px solid ${getStatusColor(orderStatus)}`,
                                marginBottom: '15px'
                            }}>
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '10px'
                                }}>
                                    {orderStatus === 'Processing' && '⏳'}
                                    {orderStatus === 'Shipped' && '🚚'}
                                    {orderStatus === 'Delivered' && '✅'}
                                </div>
                                <h3 style={{
                                    color: getStatusColor(orderStatus),
                                    fontWeight: 'bold',
                                    margin: 0
                                }}>
                                    {orderStatus}
                                </h3>
                            </div>
                            {orderStatus === 'Processing' && (
                                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                    Your order is being prepared
                                </p>
                            )}
                            {orderStatus === 'Shipped' && (
                                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                    Your order is on the way
                                </p>
                            )}
                            {orderStatus === 'Delivered' && (
                                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                    Your order has been delivered
                                </p>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '30px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                            <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                Order Summary
                            </h4>

                            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Subtotal:</span>
                                <span style={{ color: '#333', fontWeight: '600' }}>₱{order.itemsPrice?.toLocaleString()}</span>
                            </div>

                            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Shipping:</span>
                                <span style={{ color: '#333', fontWeight: '600' }}>
                                    {order.shippingPrice === 0 ? 'FREE' : `₱${order.shippingPrice?.toLocaleString()}`}
                                </span>
                            </div>

                            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Tax (12%):</span>
                                <span style={{ color: '#333', fontWeight: '600' }}>₱{order.taxPrice?.toLocaleString()}</span>
                            </div>

                            <hr style={{ border: 'none', borderTop: '2px solid #e0e0e0', margin: '20px 0' }} />

                            <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>Total:</span>
                                <span style={{ color: '#6b46c1', fontSize: '1.3rem', fontWeight: 'bold' }}>₱{totalPrice?.toLocaleString()}</span>
                            </div>

                            <Link
                                to="/orders/me"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    padding: '15px',
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
                                Back to Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default OrderDetails;
