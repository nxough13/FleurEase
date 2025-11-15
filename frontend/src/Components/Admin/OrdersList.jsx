import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './SideBar';
import { getToken } from '../../Utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, config);
            setOrders(data.orders);
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error loading orders');
            setLoading(false);
        }
    };

    const deleteOrderHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                };

                await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, config);
                toast.success('Order deleted successfully');
                fetchOrders();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting order');
            }
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            minWidth: 200,
            flex: 0.5,
            renderCell: (params) => (
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'customer',
            headerName: 'Customer',
            minWidth: 150,
            flex: 0.3
        },
        {
            field: 'numOfItems',
            headerName: 'Items',
            type: 'number',
            minWidth: 100,
            flex: 0.2,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'amount',
            headerName: 'Amount',
            minWidth: 150,
            flex: 0.3,
            renderCell: (params) => (
                <span style={{ fontWeight: 'bold', color: '#6b46c1' }}>
                    ₱{params.value.toLocaleString()}
                </span>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            minWidth: 150,
            flex: 0.3,
            renderCell: (params) => {
                const getStatusColor = (status) => {
                    switch (status) {
                        case 'Processing':
                            return { bg: '#fff3cd', color: '#856404', border: '#ffc107' };
                        case 'Shipped':
                            return { bg: '#d1ecf1', color: '#0c5460', border: '#17a2b8' };
                        case 'Delivered':
                            return { bg: '#d4edda', color: '#155724', border: '#28a745' };
                        default:
                            return { bg: '#f8f9fa', color: '#6c757d', border: '#6c757d' };
                    }
                };
                const colors = getStatusColor(params.value);
                return (
                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: colors.bg,
                        color: colors.color,
                        border: `2px solid ${colors.border}`,
                        display: 'inline-block'
                    }}>
                        {params.value}
                    </span>
                );
            }
        },
        {
            field: 'date',
            headerName: 'Date',
            minWidth: 150,
            flex: 0.3
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 180,
            flex: 0.3,
            sortable: false,
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                        to={`/admin/order/${params.id}`}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#6b46c1',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b46c1'}
                    >
                        <i className="fa fa-eye"></i>
                    </Link>
                    <button
                        onClick={() => deleteOrderHandler(params.id)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    const rows = orders.map(order => ({
        id: order._id,
        customer: order.user?.name || 'N/A',
        numOfItems: order.orderItems?.length || 0,
        amount: order.totalPrice || 0,
        status: order.orderStatus,
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }));

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <Fragment>
            <MetaData title={'All Orders'} />
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
                                <i className="fa fa-shopping-bag mr-2"></i>
                                All Orders
                            </h1>
                            <p style={{ color: 'white', margin: '10px 0 0 0', opacity: 0.9 }}>
                                Total Orders: {orders.length}
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={10}
                                disableSelectionOnClick
                                autoHeight
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid #f0f0f0',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f8f9fa',
                                        color: '#6b46c1',
                                        fontWeight: 'bold',
                                        fontSize: '0.95rem',
                                        borderBottom: '2px solid #e9d5ff',
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: '#f8f9fa',
                                    },
                                }}
                            />
                        </div>
                    </div>
            </div>
        </Fragment>
    );
};

export default OrdersList;
