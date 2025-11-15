import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [productSales, setProductSales] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const COLORS = ['#6b46c1', '#9f7aea', '#e9d5ff', '#c084fc', '#a78bfa', '#8b5cf6'];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    const getDashboardData = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        };

        try {
            const [productsRes, ordersRes, usersRes, salesRes, monthlySalesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API}/admin/products`, config),
                axios.get(`${import.meta.env.VITE_API}/admin/orders`, config),
                axios.get(`${import.meta.env.VITE_API}/admin/users`, config),
                axios.get(`${import.meta.env.VITE_API}/admin/product-sales`, config),
                axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month`, config)
            ]);

            setProducts(productsRes.data.products);
            setOrders(ordersRes.data.orders);
            setUsers(usersRes.data.users);
            setTotalAmount(ordersRes.data.totalAmount);
            setProductSales(salesRes.data.totalPercentage || []);
            setMonthlySales(monthlySalesRes.data.salesPerMonth || []);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading dashboard data');
            setLoading(false);
        }
    };

    let outOfStock = 0;
    products.forEach(product => {
        if (product.stock === 0) {
            outOfStock += 1;
        }
    });

    return (
        <Fragment>
            <MetaData title={'Admin Dashboard'} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            
            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '20px',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa'
            }}>
                    <MetaData title={'Admin Dashboard'} />
                    <h1 className="my-4" style={{ color: '#6b46c1' }}>Dashboard</h1>

                    {loading ? <Loader /> : (
                        <Fragment>
                            {/* Stats Cards */}
                            <div className="row pr-4">
                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white o-hidden h-100" style={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '15px',
                                        boxShadow: '0 4px 6px rgba(107, 70, 193, 0.3)'
                                    }}>
                                        <div className="card-body">
                                            <div className="text-center card-font-size">
                                                Total Sales<br /> 
                                                <b>${totalAmount && totalAmount.toFixed(2)}</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white o-hidden h-100" style={{ 
                                        background: 'linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%)',
                                        borderRadius: '15px',
                                        boxShadow: '0 4px 6px rgba(159, 122, 234, 0.3)'
                                    }}>
                                        <div className="card-body">
                                            <div className="text-center card-font-size">
                                                Orders<br /> 
                                                <b>{orders && orders.length}</b>
                                            </div>
                                        </div>
                                        <Link className="card-footer text-white clearfix small z-1" to="/admin/orders">
                                            <span className="float-left">View Details</span>
                                            <span className="float-right">
                                                <i className="fa fa-angle-right"></i>
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white o-hidden h-100" style={{ 
                                        background: 'linear-gradient(135deg, #c084fc 0%, #9f7aea 100%)',
                                        borderRadius: '15px',
                                        boxShadow: '0 4px 6px rgba(192, 132, 252, 0.3)'
                                    }}>
                                        <div className="card-body">
                                            <div className="text-center card-font-size">
                                                Products<br /> 
                                                <b>{products && products.length}</b>
                                            </div>
                                        </div>
                                        <Link className="card-footer text-white clearfix small z-1" to="/admin/products">
                                            <span className="float-left">View Details</span>
                                            <span className="float-right">
                                                <i className="fa fa-angle-right"></i>
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white o-hidden h-100" style={{ 
                                        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                                        borderRadius: '15px',
                                        boxShadow: '0 4px 6px rgba(167, 139, 250, 0.3)'
                                    }}>
                                        <div className="card-body">
                                            <div className="text-center card-font-size">
                                                Users<br /> 
                                                <b>{users && users.length}</b>
                                            </div>
                                        </div>
                                        <Link className="card-footer text-white clearfix small z-1" to="/admin/users">
                                            <span className="float-left">View Details</span>
                                            <span className="float-right">
                                                <i className="fa fa-angle-right"></i>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="row pr-4">
                                {/* Monthly Sales Chart */}
                                <div className="col-xl-8 col-sm-12 mb-3">
                                    <div className="card" style={{ 
                                        borderRadius: '15px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: '1px solid #e9d5ff'
                                    }}>
                                        <div className="card-body">
                                            <h4 className="mb-3" style={{ color: '#6b46c1' }}>
                                                📈 Monthly Sales
                                            </h4>
                                            {monthlySales.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={monthlySales}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="total" 
                                                            stroke="#6b46c1" 
                                                            strokeWidth={3}
                                                            name="Sales ($)"
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <p className="text-center">No sales data available yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Product Sales Pie Chart */}
                                <div className="col-xl-4 col-sm-12 mb-3">
                                    <div className="card" style={{ 
                                        borderRadius: '15px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: '1px solid #e9d5ff'
                                    }}>
                                        <div className="card-body">
                                            <h4 className="mb-3" style={{ color: '#6b46c1' }}>
                                                🌸 Product Sales
                                            </h4>
                                            {productSales.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={productSales}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) => `${name}: ${percent}%`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="percent"
                                                        >
                                                            {productSales.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <p className="text-center">No product sales data yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="row pr-4">
                                <div className="col-12">
                                    <div className="card" style={{ 
                                        borderRadius: '15px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: '1px solid #e9d5ff'
                                    }}>
                                        <div className="card-body">
                                            <h4 style={{ color: '#6b46c1' }}>📊 Quick Stats</h4>
                                            <div className="row mt-3">
                                                <div className="col-md-4">
                                                    <div style={{ 
                                                        backgroundColor: '#f3f4f6', 
                                                        padding: '20px', 
                                                        borderRadius: '10px',
                                                        textAlign: 'center'
                                                    }}>
                                                        <h5 style={{ color: '#6b46c1' }}>Out of Stock</h5>
                                                        <h2 style={{ color: '#ef4444', fontWeight: 'bold' }}>{outOfStock}</h2>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div style={{ 
                                                        backgroundColor: '#f3f4f6', 
                                                        padding: '20px', 
                                                        borderRadius: '10px',
                                                        textAlign: 'center'
                                                    }}>
                                                        <h5 style={{ color: '#6b46c1' }}>In Stock</h5>
                                                        <h2 style={{ color: '#10b981', fontWeight: 'bold' }}>
                                                            {products.length - outOfStock}
                                                        </h2>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div style={{ 
                                                        backgroundColor: '#f3f4f6', 
                                                        padding: '20px', 
                                                        borderRadius: '10px',
                                                        textAlign: 'center'
                                                    }}>
                                                        <h5 style={{ color: '#6b46c1' }}>Avg Order Value</h5>
                                                        <h2 style={{ color: '#6b46c1', fontWeight: 'bold' }}>
                                                            ${orders.length > 0 ? (totalAmount / orders.length).toFixed(2) : '0.00'}
                                                        </h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Fragment>
                    )}
            </div>
        </Fragment>
    );
};

export default Dashboard;
