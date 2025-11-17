import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import AdminHeader from '../Layout/AdminHeader';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Legend 
} from 'recharts';
import { 
    Box, Card, CardContent, Typography, Grid, Avatar, Chip, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, Button, Dialog, DialogTitle, DialogContent
} from '@mui/material';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Dashboard Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                        Something went wrong in the Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {this.state.error?.toString()}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => window.location.reload()}
                    >
                        Reload Dashboard
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

const Dashboard = () => {
    const [error, setError] = useState(null);
    const [showPieChartModal, setShowPieChartModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [productSales, setProductSales] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
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
        const fetchData = async () => {
            try {
                await getDashboardData();
            } catch (err) {
                console.error('Error in Dashboard:', err);
                setError(err.message || 'Failed to load dashboard data');
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 900) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Set initial state
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
            },
            withCredentials: true
        };

        try {
            const API_URL = import.meta.env.VITE_API || 'http://localhost:4001/api/v1';
            console.log('Starting dashboard data fetch...');
            
            // Make all API requests in parallel
            const [productsRes, ordersRes, usersRes, salesRes, monthlySalesRes] = await Promise.all([
                axios.get(`${API_URL}/admin/products`, config),
                axios.get(`${API_URL}/admin/orders`, config),
                axios.get(`${API_URL}/admin/users`, config),
                axios.get(`${API_URL}/admin/product-sales`, config),
                axios.get(`${API_URL}/admin/sales-per-month`, config)
            ]);

            // Update state with the fetched data
            setProducts(productsRes.data.products || []);
            setOrders(ordersRes.data.orders || []);
            setUsers(usersRes.data.users || []);
            setTotalAmount(ordersRes.data.totalAmount || 0);
            setProductSales(salesRes.data.totalPercentage || []);
            setMonthlySales(monthlySalesRes.data.salesPerMonth || []);
            setLoading(false);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Error loading dashboard data');
            setLoading(false);
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                // Unauthorized - token might be invalid or expired
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (error.response?.status === 403) {
                // Forbidden - user doesn't have admin role
                toast.error('You do not have permission to access the dashboard');
                window.location.href = '/';
            }
        };
    };

    const parseMonthYear = (monthStr) => {
        // Handle different date formats: "October 2024", "Oct 2024", "10-2024", "10/2024"
        if (!monthStr) return null;
        
        // Try parsing as "Month YYYY" (e.g., "October 2024")
        let date = new Date(monthStr);
        if (!isNaN(date.getTime())) return date;
        
        // Try parsing as "MM-YYYY" or "MM/YYYY"
        const parts = monthStr.split(/[\s/-]+/);
        if (parts.length === 2) {
            const month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
            const year = parseInt(parts[1], 10);
            if (!isNaN(month) && !isNaN(year)) {
                return new Date(year, month, 1);
            }
        }
        
        // Try parsing as "Month, YYYY" (e.g., "October, 2024")
        date = new Date(monthStr.replace(/(\w+)\s*,\s*(\d{4})/, '$1 1, $2'));
        if (!isNaN(date.getTime())) return date;
        
        console.warn('Could not parse date:', monthStr);
        return null;
    };

    const filterDataByDateRange = () => {
        if (!startDate || !endDate) {
            setFilteredOrders(orders);
            setFilteredAmount(totalAmount);
            setFilteredMonthlySales(monthlySales);
            return;
        }

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
            const itemDate = parseMonthYear(item.month);
            if (!itemDate) return false;
            
            // Create start/end of month for comparison
            const itemMonthStart = new Date(itemDate.getFullYear(), itemDate.getMonth(), 1);
            const itemMonthEnd = new Date(itemDate.getFullYear(), itemDate.getMonth() + 1, 0);
            itemMonthEnd.setHours(23, 59, 59, 999);
            
            // Check if the month range overlaps with the selected date range
            return itemMonthStart <= end && itemMonthEnd >= start;
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

    if (error) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                    Error Loading Dashboard
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    {error}
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Loader />
            </Box>
        );
    }

    return (
        <ErrorBoundary>
            <MetaData title={'Admin Dashboard'} />
            <AdminHeader toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            
            <Box 
                component="main"
                sx={{
                    marginLeft: { xs: '0', md: sidebarOpen ? '280px' : '0' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: { xs: '16px', md: '24px' },
                    paddingTop: { xs: '80px', md: '32px' },
                    minHeight: '100vh',
                    backgroundColor: '#f8fafc',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflowX: 'hidden'
                }}
            >
                <Box 
                    sx={{ 
                        maxWidth: '1440px', 
                        margin: '0 auto',
                        width: '100%'
                    }}
                >
                    {/* Header with Animation */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '32px',
                            animation: 'fadeIn 0.5s ease-out'
                        }}
                    >
                        <Box>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    color: '#1e293b', 
                                    fontWeight: '700',
                                    fontSize: { xs: '1.75rem', md: '2rem' },
                                    lineHeight: 1.2,
                                    background: 'linear-gradient(90deg, #6b46c1 0%, #8b5cf6 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'inline-block'
                                }}
                            >
                                Dashboard Overview
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: '#64748b',
                                    mt: 0.5,
                                    fontSize: '0.95rem'
                                }}
                            >
                                Welcome back! Here's what's happening with your store today.
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={() => setShowPDFModal(true)}
                            startIcon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 9H15V3H9V9H5L12 16L19 9Z" fill="currentColor"/>
                                    <path d="M5 18V20H19V18H5Z" fill="currentColor"/>
                                </svg>
                            }
                            sx={{
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                borderRadius: '12px',
                                padding: '10px 20px',
                                textTransform: 'none',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                boxShadow: '0 4px 14px rgba(107, 70, 193, 0.25)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a3a9e 0%, #7c3aed 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(107, 70, 193, 0.35)'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            Export Report
                        </Button>
                    </Box>

                {/* Date Range Filter with Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card sx={{
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(145deg, #ffffff, #f8f5ff)',
                        border: '1px solid rgba(233, 213, 255, 0.5)',
                        marginBottom: '30px',
                        padding: { xs: '16px', md: '24px' },
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            boxShadow: '0 8px 24px rgba(107, 70, 193, 0.15)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            marginBottom: '16px'
                        }}>
                            <Typography variant="h6" sx={{ 
                                color: '#4c1d95', 
                                fontWeight: '700',
                                mb: { xs: 2, sm: 0 },
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Filter Dashboard Data
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: '16px',
                                flexWrap: 'wrap',
                                width: { xs: '100%', sm: 'auto' }
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: '8px',
                                    flex: { xs: '1 1 100%', sm: '0 0 auto' }
                                }}>
                                    <Typography variant="body2" sx={{ 
                                        color: '#4b5563',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.875rem',
                                        fontWeight: '500'
                                    }}>
                                        From:
                                    </Typography>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="date-input"
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#fff',
                                            color: '#1e293b',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            width: '100%',
                                            maxWidth: '160px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s ease',
                                            '&:focus': {
                                                outline: 'none',
                                                borderColor: '#8b5cf6',
                                                boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2)'
                                            }
                                        }}
                                    />
                                </Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: '8px',
                                    flex: { xs: '1 1 100%', sm: '0 0 auto' }
                                }}>
                                    <Typography variant="body2" sx={{ 
                                        color: '#4b5563',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.875rem',
                                        fontWeight: '500'
                                    }}>
                                        To:
                                    </Typography>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="date-input"
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#fff',
                                            color: '#1e293b',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            width: '100%',
                                            maxWidth: '160px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s ease',
                                            '&:focus': {
                                                outline: 'none',
                                                borderColor: '#8b5cf6',
                                                boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2)'
                                            }
                                        }}
                                    />
                                </Box>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                    sx={{
                                        color: '#6b46c1',
                                        borderColor: '#e2e8f0',
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        '&:hover': {
                                            backgroundColor: '#f5f3ff',
                                            borderColor: '#c4b5fd',
                                            color: '#5b21b6'
                                        },
                                        transition: 'all 0.2s ease',
                                        flex: { xs: '1 1 100%', sm: '0 0 auto' },
                                        justifyContent: 'center'
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                </motion.div>

                {/* KPI Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Total Sales */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                color: 'white',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 25px -5px rgba(107, 70, 193, 0.4)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                                Total Sales
                                            </Typography>
                                            <Typography variant="h4" sx={{ mt: 1, fontWeight: '700', fontSize: '1.75rem' }}>
                                                ${(startDate && endDate ? filteredAmount : totalAmount).toFixed(2)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Box sx={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '12px',
                                                    padding: '2px 8px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    backdropFilter: 'blur(4px)'
                                                }}>
                                                    <span style={{ marginRight: '4px' }}>↑</span>
                                                    <span>12% from last month</span>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 1L3 5V11C3 16.55 6.16 21.74 12 23C17.84 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="white"/>
                                            </svg>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #8b5cf6 0%, #c4b5fd 100%)',
                                    opacity: 0.8
                                }} />
                            </Card>
                        </Grid>

                        {/* Total Orders */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                color: 'white',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                                Total Orders
                                            </Typography>
                                            <Typography variant="h4" sx={{ mt: 1, fontWeight: '700', fontSize: '1.75rem' }}>
                                                {startDate && endDate ? filteredOrders.length : orders.length}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Box sx={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '12px',
                                                    padding: '2px 8px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    backdropFilter: 'blur(4px)'
                                                }}>
                                                    <span style={{ marginRight: '4px' }}>↑</span>
                                                    <span>8% from last month</span>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 11V7H8V11H5L12 18L19 11H16ZM5 20V18H19V20H5Z" fill="white"/>
                                            </svg>
                                        </Box>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        {/* Total Products */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                color: 'white',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                                Total Products
                                            </Typography>
                                            <Typography variant="h4" sx={{ mt: 1, fontWeight: '700', fontSize: '1.75rem' }}>
                                                {products.length}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Box sx={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '12px',
                                                    padding: '2px 8px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    backdropFilter: 'blur(4px)'
                                                }}>
                                                    <span style={{ marginRight: '4px' }}>↑</span>
                                                    <span>{Math.floor(products.length * 0.15)} new this month</span>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L4 7V20H20V7L12 2ZM12 4.5L18 8.5V18H6V8.5L12 4.5ZM12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11ZM8 17V15.5C8 13.83 10.5 13 12 13C13.5 13 16 13.83 16 15.5V17H8Z" fill="white"/>
                                            </svg>
                                        </Box>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        {/* Out of Stock */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                color: 'white',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                                Out of Stock
                                            </Typography>
                                            <Typography variant="h4" sx={{ mt: 1, fontWeight: '700', fontSize: '1.75rem' }}>
                                                {outOfStock}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Box sx={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '12px',
                                                    padding: '2px 8px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    backdropFilter: 'blur(4px)'
                                                }}>
                                                    <span style={{ marginRight: '4px' }}>↓</span>
                                                    <span>{Math.ceil(outOfStock * 0.3)} restocked</span>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L4 7V20H20V7L12 2ZM12 4.5L18 8.5V18H6V8.5L12 4.5ZM12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11ZM8 17V15.5C8 13.83 10.5 13 12 13C13.5 13 16 13.83 16 15.5V17H8Z" fill="white"/>
                                                <path d="M8 9H16V11H8V9Z" fill="white"/>
                                            </svg>
                                        </Box>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </motion.div>

                {/* Charts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Sales Chart */}
                        <Grid item xs={12} md={8}>
                            <Card sx={{
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                border: '1px solid rgba(0,0,0,0.04)',
                                height: '100%',
                                '&:hover': {
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" sx={{ 
                                            fontWeight: '700',
                                            color: '#1e293b',
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 3V21H21" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M7 13L10 10L13.5 13.5L17 10V17H7V13Z" fill="#8b5cf6" fillOpacity="0.2" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Sales Overview
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: '8px' }}>
                                            <Chip 
                                                label="This Month" 
                                                size="small" 
                                                sx={{ 
                                                    bgcolor: '#f5f3ff', 
                                                    color: '#6b46c1',
                                                    fontWeight: '600',
                                                    '&:hover': {
                                                        bgcolor: '#ede9fe'
                                                    }
                                                }} 
                                            />
                                            <Chip 
                                                label="Export" 
                                                size="small" 
                                                variant="outlined"
                                                onClick={() => {}}
                                                sx={{ 
                                                    borderColor: '#e2e8f0',
                                                    color: '#64748b',
                                                    fontWeight: '500',
                                                    '&:hover': {
                                                        bgcolor: '#f8fafc',
                                                        borderColor: '#cbd5e1'
                                                    }
                                                }}
                                                icon={
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 16L12 8M12 16L8 12M12 16L16 12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                }
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ height: '300px', width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={startDate && endDate ? filteredMonthlySales : monthlySales}
                                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis 
                                                    dataKey="month" 
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: '#e2e8f0' }}
                                                />
                                                <YAxis 
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => `$${value}`}
                                                />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <Tooltip 
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                        padding: '8px 12px',
                                                        backgroundColor: 'white'
                                                    }}
                                                    formatter={(value) => [`$${value}`, 'Sales']}
                                                    labelFormatter={(label) => `Month: ${label}`}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="total" 
                                                    stroke="#8b5cf6" 
                                                    fillOpacity={1} 
                                                    fill="url(#colorSales)"
                                                    strokeWidth={2}
                                                    activeDot={{ 
                                                        r: 6, 
                                                        stroke: '#fff', 
                                                        strokeWidth: 2, 
                                                        fill: '#8b5cf6' 
                                                    }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Top Products Chart */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                border: '1px solid rgba(0,0,0,0.04)',
                                height: '100%',
                                '&:hover': {
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: '700',
                                        color: '#1e293b',
                                        fontSize: '1.1rem',
                                        mb: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#6b46c1" fillOpacity="0.2" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Top Products
                                    </Typography>
                                    {productSales.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 50px)' }}>
                                            <Box sx={{ flex: 1, minHeight: '200px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={productSales}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="percent"
                                                            nameKey="name"
                                                            label={({ name, percent }) => `${name}: ${(percent).toFixed(0)}%`}
                                                        >
                                                            {productSales.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip 
                                                            formatter={(value) => [`${value}%`, 'Market Share']}
                                                            contentStyle={{
                                                                borderRadius: '8px',
                                                                border: '1px solid #e2e8f0',
                                                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                                padding: '8px 12px',
                                                                backgroundColor: 'white'
                                                            }}
                                                        />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                            <Box sx={{ mt: 2, maxHeight: '120px', overflowY: 'auto', pr: 1 }}>
                                                {productSales.map((product, index) => (
                                                    <Box key={product._id} sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        mb: 1.5,
                                                        p: 1,
                                                        borderRadius: '8px',
                                                        '&:hover': {
                                                            backgroundColor: '#f8fafc'
                                                        }
                                                    }}>
                                                        <Box sx={{
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '3px',
                                                            backgroundColor: COLORS[index % COLORS.length],
                                                            mr: 1.5,
                                                            flexShrink: 0
                                                        }} />
                                                        <Typography variant="body2" sx={{ 
                                                            flex: 1, 
                                                            color: '#334155',
                                                            fontWeight: '500',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {product.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#64748b',
                                                            fontWeight: '600',
                                                            ml: 1,
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {product.percent.toFixed(1)}%
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ 
                                            height: '300px', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            p: 3
                                        }}>
                                            <Box sx={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                backgroundColor: '#f5f3ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 2
                                            }}>
                                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#8b5cf6" fillOpacity="0.2" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: '#64748b', mb: 1, fontWeight: '500' }}>
                                                No product data available
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                                Product sales data will appear here once available
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </motion.div>

                {/* Recent Orders & Users */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    style={{ marginBottom: '30px' }}
                >
                    <Grid container spacing={3}>
                        {/* Recent Orders */}
                        <Grid item xs={12} lg={8}>
                            <Card sx={{
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                border: '1px solid rgba(0,0,0,0.04)',
                                height: '100%',
                                '&:hover': {
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <CardContent>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        mb: 3
                                    }}>
                                        <Typography variant="h6" sx={{ 
                                            fontWeight: '700',
                                            color: '#1e293b',
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Recent Orders
                                        </Typography>
                                        <Button 
                                            component={Link}
                                            to="/admin/orders"
                                            size="small"
                                            variant="text"
                                            sx={{
                                                color: '#6b46c1',
                                                textTransform: 'none',
                                                fontWeight: '600',
                                                fontSize: '0.875rem',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(107, 70, 193, 0.04)'
                                                }
                                            }}
                                            endIcon={
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            }
                                        >
                                            View All
                                        </Button>
                                    </Box>
                                    
                                    {filteredOrders.length > 0 ? (
                                        <Box sx={{ overflowX: 'auto' }}>
                                            <TableContainer component={Paper} elevation={0} sx={{ boxShadow: 'none' }}>
                                                <Table size="small" sx={{ minWidth: 650 }}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: '700', color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>Order ID</TableCell>
                                                            <TableCell sx={{ fontWeight: '700', color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>Date</TableCell>
                                                            <TableCell sx={{ fontWeight: '700', color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>Status</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: '700', color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>Amount</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {filteredOrders.slice(0, 5).map((order) => (
                                                            <TableRow 
                                                                key={order._id}
                                                                component={Link}
                                                                to={`/admin/order/${order._id}`}
                                                                sx={{ 
                                                                    textDecoration: 'none',
                                                                    '&:last-child td': { borderBottom: 0 },
                                                                    '&:hover': {
                                                                        backgroundColor: '#f8fafc'
                                                                    }
                                                                }}
                                                            >
                                                                <TableCell component="th" scope="row" sx={{ color: '#3b82f6', fontWeight: '500', borderBottom: '1px solid #f1f5f9' }}>
                                                                    {order._id.substring(0, 8)}...
                                                                </TableCell>
                                                                <TableCell sx={{ color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                    <Chip 
                                                                        label={order.orderStatus} 
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: getStatusBgColor(order.orderStatus),
                                                                            color: getStatusColor(order.orderStatus),
                                                                            fontWeight: '600',
                                                                            fontSize: '0.7rem',
                                                                            textTransform: 'capitalize',
                                                                            height: '22px'
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ color: '#1e293b', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                                                                    ${order.totalPrice.toFixed(2)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    ) : (
                                        <Box sx={{ 
                                            height: '200px', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            p: 3
                                        }}>
                                            <Box sx={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                backgroundColor: '#f5f3ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 2
                                            }}>
                                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M16 11V7H8V11H5L12 18L19 11H16Z" fill="#8b5cf6" fillOpacity="0.2" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: '#64748b', mb: 1, fontWeight: '500' }}>
                                                No orders found
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                                {startDate && endDate 
                                                    ? 'No orders found in the selected date range.' 
                                                    : 'No recent orders to display.'}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Recent Users */}
                        <Grid item xs={12} lg={4}>
                            <Card sx={{
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                border: '1px solid rgba(0,0,0,0.04)',
                                height: '100%',
                                '&:hover': {
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <CardContent>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        mb: 3
                                    }}>
                                        <Typography variant="h6" sx={{ 
                                            fontWeight: '700',
                                            color: '#1e293b',
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7121 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7121 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Recent Users
                                        </Typography>
                                        <Button 
                                            component={Link}
                                            to="/admin/users"
                                            size="small"
                                            variant="text"
                                            sx={{
                                                color: '#6b46c1',
                                                textTransform: 'none',
                                                fontWeight: '600',
                                                fontSize: '0.875rem',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(107, 70, 193, 0.04)'
                                                }
                                            }}
                                            endIcon={
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            }
                                        >
                                            View All
                                        </Button>
                                    </Box>

                                    {users.length > 0 ? (
                                        <Box sx={{ mt: 2 }}>
                                            {users.slice(0, 5).map((user) => (
                                                <Box 
                                                    key={user._id}
                                                    component={Link}
                                                    to={`/admin/user/${user._id}`}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        p: 1.5,
                                                        borderRadius: '8px',
                                                        textDecoration: 'none',
                                                        mb: 1,
                                                        '&:hover': {
                                                            backgroundColor: '#f8fafc'
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <Avatar 
                                                        src={user.avatar?.url || ''} 
                                                        alt={user.name}
                                                        sx={{ 
                                                            width: 40, 
                                                            height: 40,
                                                            bgcolor: '#e9d5ff',
                                                            color: '#7c3aed',
                                                            fontWeight: '600',
                                                            fontSize: '1rem'
                                                        }}
                                                    >
                                                        {user.name?.charAt(0) || 'U'}
                                                    </Avatar>
                                                    <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            sx={{ 
                                                                fontWeight: '600', 
                                                                color: '#1e293b',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                        >
                                                            {user.name || 'Unnamed User'}
                                                        </Typography>
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                color: '#64748b',
                                                                fontSize: '0.8rem',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                        >
                                                            {user.email || 'No email'}
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={user.role} 
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: user.role === 'admin' ? '#f0f9ff' : '#f5f3ff',
                                                            color: user.role === 'admin' ? '#0369a1' : '#6b46c1',
                                                            fontWeight: '600',
                                                            fontSize: '0.65rem',
                                                            height: '20px',
                                                            textTransform: 'capitalize'
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{ 
                                            height: '200px', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            p: 3
                                        }}>
                                            <Box sx={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                backgroundColor: '#f5f3ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 2
                                            }}>
                                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7121 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7121 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="#6b46c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </Box>
                                            <Typography variant="body1" sx={{ color: '#64748b', mb: 1, fontWeight: '500' }}>
                                                No users found
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                                User data will appear here once available
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </motion.div>

                </Box>

                {/* Footer */}
                <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        © {new Date().getFullYear()} FleurEase. All rights reserved.
                    </Typography>
                </Box>
            </Box>
            </ErrorBoundary>
        );
    };

    export default Dashboard;
    