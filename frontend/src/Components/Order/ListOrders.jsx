import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getToken } from '../../Utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, config);
            setOrders(data.orders);
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error loading orders');
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

    return (
        <Fragment>
            <MetaData title={'My Orders'} />

            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 0',
                marginBottom: '30px'
            }}>
                <div className="container">
                    <h1 style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
                        <i className="fa fa-shopping-bag mr-2"></i>
                        My Orders
                    </h1>
                </div>
            </div>

            <div className="container" style={{ marginBottom: '50px' }}>
                {orders.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                        <i className="fa fa-shopping-bag" style={{ fontSize: '5rem', color: '#e0e0e0', marginBottom: '20px' }}></i>
                        <h3 style={{ color: '#666', marginBottom: '15px' }}>No Orders Yet</h3>
                        <p style={{ color: '#999', marginBottom: '30px' }}>
                            You haven't placed any orders yet. Start shopping now!
                        </p>
                        <Link
                            to="/products"
                            style={{
                                display: 'inline-block',
                                padding: '15px 40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <i className="fa fa-shopping-cart mr-2"></i>
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-12">
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                padding: '30px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }}>
                                <h4 style={{ color: '#6b46c1', marginBottom: '25px', fontWeight: 'bold' }}>
                                    <i className="fa fa-list mr-2"></i>
                                    Order History ({orders.length})
                                </h4>

                                <div className="table-responsive">
                                    <table className="table table-hover" style={{ marginBottom: 0 }}>
                                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                                            <tr>
                                                <th style={{ padding: '15px', color: '#6b46c1', fontWeight: 'bold', borderBottom: '2px solid #e9d5ff' }}>
                                                    Order ID
                                                </th>
                                                <th style={{ padding: '15px', color: '#6b46c1', fontWeight: 'bold', borderBottom: '2px solid #e9d5ff' }}>
                                                    Date
                                                </th>
                                                <th style={{ padding: '15px', color: '#6b46c1', fontWeight: 'bold', borderBottom: '2px solid #e9d5ff' }}>
                                                    Total
                                                </th>
                                                <th style={{ padding: '15px', color: '#6b46c1', fontWeight: 'bold', borderBottom: '2px solid #e9d5ff' }}>
                                                    Status
                                                </th>
                                                <th style={{ padding: '15px', color: '#6b46c1', fontWeight: 'bold', borderBottom: '2px solid #e9d5ff', textAlign: 'center' }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order._id} style={{ transition: 'background-color 0.2s ease' }}>
                                                    <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                                                        <span style={{ 
                                                            fontFamily: 'monospace', 
                                                            fontSize: '0.9rem',
                                                            color: '#666'
                                                        }}>
                                                            #{order._id.substring(0, 8)}...
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                                                        <span style={{ color: '#666' }}>
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                                                        <span style={{ 
                                                            fontWeight: 'bold', 
                                                            color: '#6b46c1',
                                                            fontSize: '1.1rem'
                                                        }}>
                                                            ₱{order.totalPrice.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px', verticalAlign: 'middle' }}>
                                                        <span style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            backgroundColor: getStatusColor(order.orderStatus) + '20',
                                                            color: getStatusColor(order.orderStatus),
                                                            border: `2px solid ${getStatusColor(order.orderStatus)}`,
                                                            display: 'inline-block'
                                                        }}>
                                                            {order.orderStatus === 'Processing' && <i className="fa fa-clock-o mr-1"></i>}
                                                            {order.orderStatus === 'Shipped' && <i className="fa fa-truck mr-1"></i>}
                                                            {order.orderStatus === 'Delivered' && <i className="fa fa-check-circle mr-1"></i>}
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                        <Link
                                                            to={`/order/${order._id}`}
                                                            style={{
                                                                padding: '10px 20px',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#6b46c1',
                                                                color: 'white',
                                                                textDecoration: 'none',
                                                                fontSize: '0.9rem',
                                                                fontWeight: '600',
                                                                transition: 'all 0.3s ease',
                                                                display: 'inline-block'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#8b5cf6';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#6b46c1';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <i className="fa fa-eye mr-2"></i>
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default ListOrders;
