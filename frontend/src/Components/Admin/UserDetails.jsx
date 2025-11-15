import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const UserDetails = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/admin/user/${id}`,
                config
            );

            setUser(data.user);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading user details');
            navigate('/admin/users');
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <Fragment>
            <MetaData title={`User Details - ${user.name}`} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '20px',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
            }}>
                <div className="row">
                    <div className="col-12">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4" style={{
                            background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                            padding: '20px 30px',
                            borderRadius: '15px',
                            boxShadow: '0 4px 15px rgba(107, 70, 193, 0.3)'
                        }}>
                            <h1 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
                                <i className="fa fa-user mr-2"></i>
                                User Details
                            </h1>
                            <div>
                                <Link
                                    to={`/admin/user/${id}`}
                                    className="btn mr-2"
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#6b46c1',
                                        borderRadius: '20px',
                                        padding: '10px 20px',
                                        fontWeight: '600',
                                        border: '2px solid white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <i className="fa fa-edit mr-2"></i>
                                    Edit User
                                </Link>
                                <button
                                    onClick={() => navigate('/admin/users')}
                                    className="btn"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        padding: '10px 20px',
                                        fontWeight: '500',
                                        border: '2px solid rgba(255,255,255,0.3)'
                                    }}
                                >
                                    <i className="fa fa-arrow-left mr-2"></i>
                                    Back to List
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="row">
                            {/* Avatar Section */}
                            <div className="col-md-4">
                                <div style={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                    borderRadius: '15px',
                                    padding: '30px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(107, 70, 193, 0.1)',
                                    textAlign: 'center'
                                }}>
                                    <h4 style={{ 
                                        color: '#6b46c1', 
                                        marginBottom: '25px', 
                                        fontWeight: 'bold',
                                        fontSize: '1.3rem',
                                        borderBottom: '2px solid #e9d5ff',
                                        paddingBottom: '10px'
                                    }}>
                                        <i className="fa fa-user-circle mr-2"></i>
                                        Profile Picture
                                    </h4>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <img
                                            src={user.avatar?.url || 'https://via.placeholder.com/200'}
                                            alt={user.name}
                                            style={{
                                                width: '200px',
                                                height: '200px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '5px solid #e9d5ff',
                                                boxShadow: '0 4px 15px rgba(107, 70, 193, 0.2)'
                                            }}
                                        />
                                    </div>

                                    <h3 style={{ 
                                        color: '#333', 
                                        fontWeight: 'bold',
                                        marginBottom: '10px'
                                    }}>
                                        {user.name}
                                    </h3>
                                    
                                    <span style={{
                                        background: user.role === 'admin' 
                                            ? 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)'
                                            : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                        color: 'white',
                                        padding: '8px 20px',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        display: 'inline-block',
                                        boxShadow: '0 2px 8px rgba(107, 70, 193, 0.3)'
                                    }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* User Information */}
                            <div className="col-md-8">
                                <div style={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                    borderRadius: '15px',
                                    padding: '35px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(107, 70, 193, 0.1)'
                                }}>
                                    <h2 style={{ 
                                        background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 'bold', 
                                        marginBottom: '25px',
                                        fontSize: '1.8rem',
                                        borderBottom: '3px solid #e9d5ff',
                                        paddingBottom: '15px'
                                    }}>
                                        <i className="fa fa-info-circle mr-2"></i>
                                        User Information
                                    </h2>

                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div style={{
                                                backgroundColor: '#f8f9fa',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: '1px solid #e9ecef',
                                                marginBottom: '15px'
                                            }}>
                                                <strong style={{ 
                                                    color: '#6b46c1', 
                                                    fontSize: '0.85rem', 
                                                    textTransform: 'uppercase', 
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    marginBottom: '8px'
                                                }}>
                                                    <i className="fa fa-id-card mr-2"></i>User ID
                                                </strong>
                                                <span style={{ 
                                                    color: '#333', 
                                                    fontSize: '0.9rem', 
                                                    fontFamily: 'monospace',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    {user._id}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div style={{
                                                backgroundColor: '#f8f9fa',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: '1px solid #e9ecef',
                                                marginBottom: '15px'
                                            }}>
                                                <strong style={{ 
                                                    color: '#6b46c1', 
                                                    fontSize: '0.85rem', 
                                                    textTransform: 'uppercase', 
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    marginBottom: '8px'
                                                }}>
                                                    <i className="fa fa-user mr-2"></i>Full Name
                                                </strong>
                                                <span style={{ 
                                                    color: '#333', 
                                                    fontSize: '1.1rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {user.name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div style={{
                                                backgroundColor: '#f8f9fa',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: '1px solid #e9ecef',
                                                marginBottom: '15px'
                                            }}>
                                                <strong style={{ 
                                                    color: '#6b46c1', 
                                                    fontSize: '0.85rem', 
                                                    textTransform: 'uppercase', 
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    marginBottom: '8px'
                                                }}>
                                                    <i className="fa fa-envelope mr-2"></i>Email Address
                                                </strong>
                                                <span style={{ 
                                                    color: '#333', 
                                                    fontSize: '1.1rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div style={{
                                                background: user.role === 'admin'
                                                    ? 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)'
                                                    : 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: user.role === 'admin' ? '2px solid #6b46c1' : '2px solid #28a745',
                                                boxShadow: user.role === 'admin'
                                                    ? '0 4px 12px rgba(107, 70, 193, 0.2)'
                                                    : '0 4px 12px rgba(40, 167, 69, 0.2)'
                                            }}>
                                                <strong style={{ 
                                                    color: user.role === 'admin' ? '#6b46c1' : '#155724',
                                                    fontSize: '0.85rem', 
                                                    textTransform: 'uppercase', 
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    marginBottom: '8px'
                                                }}>
                                                    <i className="fa fa-shield mr-2"></i>Role
                                                </strong>
                                                <span style={{ 
                                                    color: user.role === 'admin' ? '#6b46c1' : '#155724',
                                                    fontSize: '1.5rem',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div style={{
                                                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                border: '2px solid #ffc107',
                                                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.2)'
                                            }}>
                                                <strong style={{ 
                                                    color: '#856404',
                                                    fontSize: '0.85rem', 
                                                    textTransform: 'uppercase', 
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    marginBottom: '8px'
                                                }}>
                                                    <i className="fa fa-calendar mr-2"></i>Joined Date
                                                </strong>
                                                <span style={{ 
                                                    color: '#856404',
                                                    fontSize: '1rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {user.googleId && (
                                        <div style={{
                                            marginTop: '20px',
                                            padding: '15px',
                                            backgroundColor: '#e3f2fd',
                                            borderRadius: '10px',
                                            border: '1px solid #2196f3'
                                        }}>
                                            <i className="fa fa-google mr-2" style={{ color: '#2196f3' }}></i>
                                            <strong style={{ color: '#1976d2' }}>Google Account Connected</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default UserDetails;
