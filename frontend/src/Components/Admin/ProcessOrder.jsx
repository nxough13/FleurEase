import React, { Fragment, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import { getToken } from '../../Utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProcessOrder = () => {
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

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

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/order/${id}`, config);
            setOrder(data.order);
            setStatus(data.order.orderStatus);
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error loading order');
            setLoading(false);
        }
    };

    const updateOrderHandler = async (e) => {
        e.preventDefault();

        if (!status) {
            toast.error('Please select order status');
            return;
        }

        setUpdating(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            await axios.put(
                `${import.meta.env.VITE_API}/admin/order/${id}`,
                { status },
                config
            );

            toast.success('Order status updated successfully! Email sent to customer.');
            navigate('/admin/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating order');
            setUpdating(false);
        }
    };

    const getStatusColor = (orderStatus) => {
        switch (orderStatus) {
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
                <Link to="/admin/orders">Back to Orders</Link>
            </div>
        );
    }

    const { shippingInfo, orderItems, user, totalPrice, orderStatus, paymentInfo, createdAt } = order;
    const isPaid = paymentInfo && paymentInfo.status === 'succeeded';

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Fragment>
            <MetaData title={`Process Order #${id}`} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5'
            }}>
                    <div style={{ padding: '30px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                            padding: '25px',
                            borderRadius: '15px',
                            marginBottom: '30px',
                            boxShadow: '0 4px 15px rgba(107, 70, 193, 0.3)'
                        }}>
                            <h1 style={{ color: 'white', margin: 0, fontWeight: 'bold' }}>
                                <i className="fa fa-edit mr-2"></i>
                                Process Order
                            </h1>
                            <p style={{ color: 'white', margin: '10px 0 0 0', opacity: 0.9, fontFamily: 'monospace' }}>
                                Order ID: #{id}
                            </p>
                        </div>

                        <div className="row">
                            {/* Order Details */}
                            <div className="col-12 col-lg-8">
                                {/* Shipping Info */}
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    marginBottom: '20px'
                                }}>
                                    <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                        <i className="fa fa-truck mr-2"></i>
                                        Shipping Information
                                    </h4>
                                    <p style={{ marginBottom: '10px' }}>
                                        <strong>Customer:</strong> {user?.name}
                                    </p>
                                    <p style={{ marginBottom: '10px' }}>
                                        <strong>Email:</strong> {user?.email}
                                    </p>
                                    <p style={{ marginBottom: '10px' }}>
                                        <strong>Phone:</strong> {shippingInfo.phoneNo}
                                    </p>
                                    <p style={{ marginBottom: '0' }}>
                                        <strong>Address:</strong> {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}
                                    </p>
                                </div>

                                {/* Payment Info */}
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    marginBottom: '20px'
                                }}>
                                    <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                        <i className="fa fa-credit-card mr-2"></i>
                                        Payment Information
                                    </h4>
                                    <p style={{ marginBottom: '10px' }}>
                                        <strong>Payment Method:</strong> {paymentInfo.status}
                                    </p>
                                    <p style={{ marginBottom: '10px' }}>
                                        <strong>Order Date:</strong> {new Date(createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p style={{ marginBottom: '0' }}>
                                        <strong>Total Amount:</strong> <span style={{ color: '#6b46c1', fontWeight: 'bold', fontSize: '1.2rem' }}>₱{totalPrice.toLocaleString()}</span>
                                    </p>
                                </div>

                                {/* Order Items */}
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '15px',
                                    padding: '25px',
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
                                                        fontSize: '1.05rem'
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

                            {/* Update Status Form */}
                            <div className="col-12 col-lg-4">
                                {/* Current Status */}
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                        Current Status
                                    </h4>
                                    <div style={{
                                        padding: '20px',
                                        borderRadius: '12px',
                                        backgroundColor: getStatusColor(orderStatus) + '20',
                                        border: `3px solid ${getStatusColor(orderStatus)}`
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
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
                                </div>

                                {/* Update Status Form */}
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                }}>
                                    <h4 style={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                                        <i className="fa fa-refresh mr-2"></i>
                                        Update Status
                                    </h4>

                                    <form onSubmit={updateOrderHandler}>
                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                                Select New Status
                                            </label>
                                            <select
                                                className="form-control"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                required
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                <option value="">Choose Status</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </div>

                                        <div style={{
                                            backgroundColor: '#e7f3ff',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            marginBottom: '20px',
                                            borderLeft: '4px solid #17a2b8'
                                        }}>
                                            <p style={{ color: '#0c5460', margin: 0, fontSize: '0.9rem' }}>
                                                <i className="fa fa-info-circle mr-2"></i>
                                                <strong>Note:</strong> Updating the order status will automatically send an email with PDF receipt to the customer.
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={updating}
                                            style={{
                                                width: '100%',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: updating ? '#ccc' : 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                                color: 'white',
                                                fontSize: '1.05rem',
                                                fontWeight: '600',
                                                cursor: updating ? 'not-allowed' : 'pointer',
                                                marginBottom: '10px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {updating ? (
                                                <>
                                                    <i className="fa fa-spinner fa-spin mr-2"></i>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa fa-check mr-2"></i>
                                                    Update Order Status
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            to="/admin/orders"
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
                                            Back to Orders
                                        </Link>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </Fragment>
    );
};

export default ProcessOrder;
