import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [productSales, setProductSales] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filteredAmount, setFilteredAmount] = useState(0);
    const [filteredMonthlySales, setFilteredMonthlySales] = useState([]);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [pdfFields, setPdfFields] = useState({
        summary: true,
        products: true,
        monthly: true,
        orders: true
    });

    const COLORS = ['#6b46c1', '#9f7aea', '#e9d5ff', '#c084fc', '#a78bfa', '#8b5cf6'];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            filterDataByDateRange();
        } else {
            setFilteredOrders(orders);
            setFilteredAmount(totalAmount);
        }
    }, [startDate, endDate, orders, totalAmount]);

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

    const filterDataByDateRange = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date

        // Filter orders
        const filtered = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
        });

        const amount = filtered.reduce((acc, order) => acc + order.totalPrice, 0);
        setFilteredOrders(filtered);
        setFilteredAmount(amount);

        // Filter monthly sales data
        const filtered_monthly = monthlySales.filter(item => {
            // Parse month string like "October 2024" or "Oct-2024"
            const monthYear = item.month.toLowerCase();
            const startMonth = start.toLocaleString('default', { month: 'long', year: 'numeric' }).toLowerCase();
            const endMonth = end.toLocaleString('default', { month: 'long', year: 'numeric' }).toLowerCase();
            
            // Check if month is within range
            const itemDate = new Date(`${item.month} 1`);
            return itemDate >= start && itemDate <= end;
        });

        setFilteredMonthlySales(filtered_monthly);
    };

    const generatePDF = () => {
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            let finalY = 20;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 14;
            const lineHeight = 7;
            
            // Helper function to add a simple table
            const addTable = (title, headers, rows) => {
                if (finalY > pageHeight - 40) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(12);
                doc.setTextColor(0);
                doc.text(title, margin, finalY);
                finalY += 8;
                
                // Draw header
                doc.setFillColor(107, 70, 193);
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                
                const colWidths = headers.map(() => (210 - 2 * margin) / headers.length);
                let xPos = margin;
                
                headers.forEach((header, i) => {
                    doc.rect(xPos, finalY - 5, colWidths[i], 7, 'F');
                    doc.text(header, xPos + 2, finalY, { maxWidth: colWidths[i] - 4 });
                    xPos += colWidths[i];
                });
                
                finalY += 8;
                
                // Draw rows
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(9);
                
                rows.forEach((row) => {
                    if (finalY > pageHeight - 15) {
                        doc.addPage();
                        finalY = 20;
                    }
                    
                    xPos = margin;
                    row.forEach((cell, i) => {
                        doc.text(String(cell), xPos + 2, finalY, { maxWidth: colWidths[i] - 4 });
                        xPos += colWidths[i];
                    });
                    finalY += lineHeight;
                });
                
                finalY += 5;
            };
            
            // Add title
            doc.setFontSize(20);
            doc.setTextColor(107, 70, 193);
            doc.text('FleurEase - Dashboard Report', margin, finalY);
            finalY += 10;
            
            // Add date range
            doc.setFontSize(10);
            doc.setTextColor(100);
            if (startDate && endDate) {
                doc.text(`Report Period: ${startDate} to ${endDate}`, margin, finalY);
            } else {
                doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, margin, finalY);
            }
            finalY += 12;
            
            // Add summary statistics
            if (pdfFields.summary) {
                const summaryRows = [
                    ['Total Sales', `$${(startDate && endDate ? filteredAmount : totalAmount).toFixed(2)}`],
                    ['Total Orders', `${startDate && endDate ? filteredOrders.length : orders.length}`],
                    ['Total Products', `${products.length}`],
                    ['Total Users', `${users.length}`],
                    ['Out of Stock', `${outOfStock}`]
                ];
                addTable('Summary Statistics', ['Metric', 'Value'], summaryRows);
            }
            
            // Add product sales
            if (pdfFields.products && productSales.length > 0) {
                const productRows = productSales.map(item => [
                    item.name.substring(0, 25),
                    `${item.percent.toFixed(2)}%`
                ]);
                addTable('Product Sales', ['Product', 'Sales %'], productRows);
            }
            
            // Add monthly sales
            if (pdfFields.monthly) {
                const monthlyToShow = startDate && endDate ? filteredMonthlySales : monthlySales;
                if (monthlyToShow.length > 0) {
                    const monthlyRows = monthlyToShow.map(item => [
                        item.month,
                        `$${item.total.toFixed(2)}`
                    ]);
                    addTable('Monthly Sales', ['Month', 'Sales'], monthlyRows);
                }
            }
            
            // Add orders
            if (pdfFields.orders) {
                const ordersToShow = startDate && endDate ? filteredOrders : orders.slice(0, 15);
                if (ordersToShow.length > 0) {
                    const ordersRows = ordersToShow.map(order => [
                        order._id.substring(0, 8),
                        new Date(order.createdAt).toLocaleDateString(),
                        `$${order.totalPrice.toFixed(2)}`,
                        order.orderStatus
                    ]);
                    addTable('Recent Orders', ['Order ID', 'Date', 'Amount', 'Status'], ordersRows);
                }
            }
            
            // Save PDF
            const filename = startDate && endDate 
                ? `dashboard-report-${startDate}-to-${endDate}.pdf`
                : `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            toast.success('PDF report downloaded successfully!');
            setShowPDFModal(false);
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Error generating PDF');
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h1 style={{ color: '#6b46c1', margin: 0 }}>Dashboard</h1>
                        <button
                            onClick={() => setShowPDFModal(true)}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(107, 70, 193, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <i className="fa fa-download mr-2"></i>
                            Export PDF Report
                        </button>
                    </div>

                    {/* Date Range Filter */}
                    <div className="row pr-4 mb-4">
                        <div className="col-12">
                            <div className="card" style={{ 
                                borderRadius: '15px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                border: '1px solid #e9d5ff',
                                padding: '20px'
                            }}>
                                <h5 style={{ color: '#6b46c1', marginBottom: '15px' }}>
                                    <i className="fa fa-calendar mr-2"></i>
                                    Filter by Date Range
                                </h5>
                                <div className="row">
                                    <div className="col-md-4">
                                        <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0'
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0'
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <button
                                            onClick={() => {
                                                setStartDate('');
                                                setEndDate('');
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#e9d5ff',
                                                color: '#6b46c1',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                width: '100%'
                                            }}
                                        >
                                            <i className="fa fa-times mr-2"></i>
                                            Clear Filter
                                        </button>
                                    </div>
                                </div>
                                {startDate && endDate && (
                                    <div style={{ marginTop: '15px', padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
                                        <i className="fa fa-info-circle mr-2" style={{ color: '#16a34a' }}></i>
                                        <span style={{ color: '#16a34a', fontWeight: '600' }}>
                                            Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

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
                                                <b>${(startDate && endDate ? filteredAmount : totalAmount).toFixed(2)}</b>
                                                {startDate && endDate && (
                                                    <div style={{ fontSize: '0.75rem', marginTop: '5px', opacity: 0.9 }}>
                                                        (Filtered)
                                                    </div>
                                                )}
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
                                                <b>{startDate && endDate ? filteredOrders.length : (orders && orders.length)}</b>
                                                {startDate && endDate && (
                                                    <div style={{ fontSize: '0.75rem', marginTop: '5px', opacity: 0.9 }}>
                                                        (Filtered)
                                                    </div>
                                                )}
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
                                            {(startDate && endDate ? filteredMonthlySales : monthlySales).length > 0 ? (
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={startDate && endDate ? filteredMonthlySales : monthlySales}>
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

                    {/* PDF Export Modal */}
                    {showPDFModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '30px',
                                maxWidth: '500px',
                                width: '90%',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                            }}>
                                <h3 style={{ color: '#6b46c1', marginBottom: '20px' }}>
                                    <i className="fa fa-cog mr-2"></i>
                                    PDF Report Configuration
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{ fontWeight: '600', marginBottom: '15px', color: '#333' }}>
                                        Select fields to include in the report:
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={pdfFields.summary}
                                                onChange={(e) => setPdfFields({ ...pdfFields, summary: e.target.checked })}
                                                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: '500' }}>Summary Statistics</span>
                                        </label>

                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={pdfFields.products}
                                                onChange={(e) => setPdfFields({ ...pdfFields, products: e.target.checked })}
                                                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: '500' }}>Product Sales</span>
                                        </label>

                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={pdfFields.monthly}
                                                onChange={(e) => setPdfFields({ ...pdfFields, monthly: e.target.checked })}
                                                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: '500' }}>Monthly Sales</span>
                                        </label>

                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={pdfFields.orders}
                                                onChange={(e) => setPdfFields({ ...pdfFields, orders: e.target.checked })}
                                                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: '500' }}>Orders</span>
                                        </label>
                                    </div>
                                </div>

                                {startDate && endDate && (
                                    <div style={{
                                        background: '#f0fdf4',
                                        border: '1px solid #86efac',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        marginBottom: '20px'
                                    }}>
                                        <p style={{ margin: 0, color: '#16a34a', fontSize: '0.9rem' }}>
                                            <i className="fa fa-info-circle mr-2"></i>
                                            Report will include data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={generatePDF}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                    >
                                        <i className="fa fa-download mr-2"></i>
                                        Download PDF
                                    </button>

                                    <button
                                        onClick={() => setShowPDFModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: '#e9d5ff',
                                            color: '#6b46c1',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.background = '#ddd6fe'}
                                        onMouseOut={(e) => e.target.style.background = '#e9d5ff'}
                                    >
                                        <i className="fa fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </Fragment>
    );
};

export default Dashboard;
