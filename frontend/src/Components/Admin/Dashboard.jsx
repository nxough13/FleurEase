import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import { 
    Box, Card, CardContent, Typography, Grid, Avatar, Chip, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, Button
} from '@mui/material';

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

    // Get last 3 orders
    const lastThreeOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    // Get last 3 users
    const lastThreeUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing':
                return '#ffc107';
            case 'Shipped':
                return '#17a2b8';
            case 'Delivered':
                return '#28a745';
            case 'Cancelled':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case 'Processing':
                return '#fff3cd';
            case 'Shipped':
                return '#d1ecf1';
            case 'Delivered':
                return '#d4edda';
            case 'Cancelled':
                return '#f8d7da';
            default:
                return '#e2e3e5';
        }
    };

    return (
        <Fragment>
            <MetaData title={'Admin Dashboard'} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            
            <Box sx={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '24px',
                minHeight: '100vh',
                backgroundColor: '#f5f7fa',
                width: sidebarOpen ? 'calc(100% - 250px)' : '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}>
                <MetaData title={'Admin Dashboard'} />
                
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <Typography variant="h4" sx={{ color: '#6b46c1', fontWeight: 'bold' }}>
                        Dashboard
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setShowPDFModal(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                            borderRadius: '10px',
                            padding: '10px 24px',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a3a9e 0%, #7c3aed 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(107, 70, 193, 0.4)'
                            }
                        }}
                    >
                        <i className="fa fa-download mr-2"></i>
                        Export PDF Report
                    </Button>
                </Box>

                {/* Date Range Filter */}
                <Card sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e9d5ff',
                    marginBottom: '30px',
                    padding: '24px'
                }}>
                    <Typography variant="h6" sx={{ color: '#6b46c1', marginBottom: '20px', fontWeight: 'bold' }}>
                        <i className="fa fa-calendar mr-2"></i>
                        Filter by Date Range
                    </Typography>
                    <Grid container spacing={3} alignItems="flex-end">
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                                Start Date
                            </Typography>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                                End Date
                            </Typography>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                fullWidth
                                sx={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    borderColor: '#e9d5ff',
                                    color: '#6b46c1',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: '#6b46c1',
                                        backgroundColor: '#f8f9fa'
                                    }
                                }}
                            >
                                <i className="fa fa-times mr-2"></i>
                                Clear Filter
                            </Button>
                        </Grid>
                    </Grid>
                    {startDate && endDate && (
                        <Box sx={{
                            marginTop: '20px',
                            padding: '12px',
                            background: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #86efac'
                        }}>
                            <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600 }}>
                                <i className="fa fa-info-circle mr-2"></i>
                                Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}
                </Card>

                    {loading ? <Loader /> : (
                        <Fragment>
                        {/* KPI Cards - Full Width */}
                        <Grid container spacing={3} sx={{ marginBottom: '30px', width: '100%' }}>
                            <Grid item xs={12} sm={6} lg={3}>
                                <Card sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '16px',
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                    color: 'white',
                                        transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{ padding: '24px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: '8px' }}>
                                                    Total Sales
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                    ${(startDate && endDate ? filteredAmount : totalAmount).toFixed(2)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="fa fa-dollar-sign" style={{ fontSize: '1.5rem' }}></i>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} lg={3}>
                                <Card sx={{
                                        background: 'linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%)',
                                        borderRadius: '16px',
                                    boxShadow: '0 8px 24px rgba(159, 122, 234, 0.3)',
                                    color: 'white',
                                        transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 32px rgba(159, 122, 234, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{ padding: '24px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: '8px' }}>
                                                    Orders
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                    {startDate && endDate ? filteredOrders.length : (orders && orders.length)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="fa fa-shopping-cart" style={{ fontSize: '1.5rem' }}></i>
                                            </Box>
                                        </Box>
                                        <Link to="/admin/orders" style={{ textDecoration: 'none', color: 'white', marginTop: '12px', display: 'block', fontSize: '0.875rem' }}>
                                            View Details <i className="fa fa-arrow-right ml-1"></i>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} lg={3}>
                                <Card sx={{
                                        background: 'linear-gradient(135deg, #c084fc 0%, #9f7aea 100%)',
                                        borderRadius: '16px',
                                    boxShadow: '0 8px 24px rgba(192, 132, 252, 0.3)',
                                    color: 'white',
                                        transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 32px rgba(192, 132, 252, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{ padding: '24px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: '8px' }}>
                                                    Products
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                    {products && products.length}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="fa fa-box" style={{ fontSize: '1.5rem' }}></i>
                                            </Box>
                                        </Box>
                                        <Link to="/admin/products" style={{ textDecoration: 'none', color: 'white', marginTop: '12px', display: 'block', fontSize: '0.875rem' }}>
                                            View Details <i className="fa fa-arrow-right ml-1"></i>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} lg={3}>
                                <Card sx={{
                                        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                                        borderRadius: '16px',
                                    boxShadow: '0 8px 24px rgba(167, 139, 250, 0.3)',
                                    color: 'white',
                                        transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 32px rgba(167, 139, 250, 0.4)'
                                    }
                                }}>
                                    <CardContent sx={{ padding: '24px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: '8px' }}>
                                                    Users
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                    {users && users.length}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="fa fa-users" style={{ fontSize: '1.5rem' }}></i>
                                            </Box>
                                        </Box>
                                        <Link to="/admin/users" style={{ textDecoration: 'none', color: 'white', marginTop: '12px', display: 'block', fontSize: '0.875rem' }}>
                                            View Details <i className="fa fa-arrow-right ml-1"></i>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Monthly Sales Chart - Full Width */}
                        <Card sx={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '2px solid #e9d5ff',
                            marginBottom: '30px',
                            width: '100%'
                        }}>
                            <CardContent sx={{ padding: '24px' }}>
                                <Typography variant="h6" sx={{ color: '#6b46c1', fontWeight: 'bold', marginBottom: '20px' }}>
                                    📈 Monthly Sales
                                </Typography>
                                {(startDate && endDate ? filteredMonthlySales : monthlySales).length > 0 ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart data={startDate && endDate ? filteredMonthlySales : monthlySales}>
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6b46c1" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#6b46c1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis dataKey="month" stroke="#999" />
                                            <YAxis stroke="#999" />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} formatter={(value) => `$${value.toFixed(2)}`} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="total" 
                                                stroke="#6b46c1" 
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorSales)"
                                                name="Sales ($)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                                        No sales data available yet
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Product Sales Pie Chart - Full Width */}
                        <Card sx={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '2px solid #e9d5ff',
                            marginBottom: '30px',
                            width: '100%'
                        }}>
                            <CardContent sx={{ padding: '24px' }}>
                                <Typography variant="h6" sx={{ color: '#6b46c1', fontWeight: 'bold', marginBottom: '20px' }}>
                                    🌸 Product Sales
                                </Typography>
                                {productSales.length > 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <PieChart>
                                                <Pie
                                                    data={productSales}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={120}
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
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                                        No product sales data yet
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Current Ordered Products Table - Full Width */}
                        <Card sx={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '2px solid #e9d5ff',
                            marginBottom: '30px',
                            width: '100%'
                        }}>
                            <CardContent sx={{ padding: '24px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="h6" sx={{ color: '#6b46c1', fontWeight: 'bold' }}>
                                        Current Ordered Products
                                    </Typography>
                                    <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
                                        <Button size="small" sx={{ color: '#6b46c1', textTransform: 'none' }}>
                                            View All <i className="fa fa-arrow-right ml-1"></i>
                                        </Button>
                                    </Link>
                                </Box>
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', backgroundColor: 'transparent', width: '100%' }}>
                                    <Table sx={{ width: '100%' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#6b46c1', width: '30%' }}>Product</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#6b46c1', width: '25%' }}>Customer</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#6b46c1', width: '20%' }}>Amount</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#6b46c1', width: '25%' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {lastThreeOrders.length > 0 ? (
                                                lastThreeOrders.map((order) => (
                                                    <TableRow key={order._id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                {order.orderItems && order.orderItems[0] && (
                                                                    <Avatar
                                                                        src={order.orderItems[0].image}
                                                                        alt={order.orderItems[0].name}
                                                                        sx={{ width: 40, height: 40 }}
                                                                    />
                                                                )}
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {order.orderItems && order.orderItems[0] ? order.orderItems[0].name : 'N/A'}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                                        Qty: {order.orderItems && order.orderItems[0] ? order.orderItems[0].quantity : 0}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {order.user && order.user.name ? order.user.name : 'N/A'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#6b46c1' }}>
                                                                ${order.totalPrice.toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={order.orderStatus}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getStatusBgColor(order.orderStatus),
                                                                    color: getStatusColor(order.orderStatus),
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        <Typography variant="body2" sx={{ color: '#999', padding: '20px' }}>
                                                            No orders yet
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Users Table - Full Width */}
                        <Card sx={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '2px solid #e9d5ff',
                            marginBottom: '30px',
                            width: '100%'
                        }}>
                            <CardContent sx={{ padding: '24px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="h6" sx={{ color: '#6b46c1', fontWeight: 'bold' }}>
                                        Recent Users
                                    </Typography>
                                    <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                                        <Button size="small" sx={{ color: '#6b46c1', textTransform: 'none' }}>
                                            View All <i className="fa fa-arrow-right ml-1"></i>
                                        </Button>
                                    </Link>
                                </Box>
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', backgroundColor: 'transparent', width: '100%' }}>
                                    <Table sx={{ width: '100%' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#6b46c1', width: '25%' }}>User</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#6b46c1', width: '35%' }}>Email</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#6b46c1', width: '20%' }}>Role</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#6b46c1', width: '20%' }}>Joined</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {lastThreeUsers.length > 0 ? (
                                                lastThreeUsers.map((user) => (
                                                    <TableRow key={user._id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <Avatar
                                                                    src={user.avatar && user.avatar.url}
                                                                    alt={user.name}
                                                                    sx={{ width: 40, height: 40 }}
                                                                />
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {user.name}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                                {user.email}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={user.role === 'admin' ? 'Admin' : 'User'}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: user.role === 'admin' ? '#e9d5ff' : '#f3f4f6',
                                                                    color: user.role === 'admin' ? '#6b46c1' : '#666',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ color: '#999', fontSize: '0.875rem' }}>
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        <Typography variant="body2" sx={{ color: '#999', padding: '20px' }}>
                                                            No users yet
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
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
            </Box>
        </Fragment>
    );
};

export default Dashboard;
