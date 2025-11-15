import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import axios from 'axios';
import { getToken, getUser } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config);
            setUser(data.user);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading profile');
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <Fragment>
            <MetaData title={'My Profile'} />
            
            <div style={{
                minHeight: '80vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                padding: '40px 0'
            }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-10 col-lg-8">
                            {/* Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                padding: '30px',
                                borderRadius: '15px 15px 0 0',
                                boxShadow: '0 4px 15px rgba(107, 70, 193, 0.3)',
                                textAlign: 'center'
                            }}>
                                <h1 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
                                    <i className="fa fa-user-circle mr-2"></i>
                                    My Profile
                                </h1>
                            </div>

                            {/* Profile Content */}
                            <div style={{
                                background: 'white',
                                borderRadius: '0 0 15px 15px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                overflow: 'hidden'
                            }}>
                                {user?.isSuspended && (
                                    <div style={{
                                        backgroundColor: '#f8d7da',
                                        color: '#721c24',
                                        padding: '20px',
                                        borderBottom: '2px solid #dc3545'
                                    }}>
                                        <h4 style={{ margin: 0, marginBottom: '10px' }}>
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            Account Suspended
                                        </h4>
                                        <p style={{ margin: 0 }}>
                                            <strong>Reason:</strong> {user.suspensionReason || 'No reason provided'}
                                        </p>
                                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>
                                            Please contact support if you believe this is a mistake.
                                        </p>
                                    </div>
                                )}

                                <div className="row" style={{ padding: '40px' }}>
                                    {/* Avatar Section */}
                                    <div className="col-md-4" style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <div style={{
                                            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                                            padding: '30px',
                                            borderRadius: '15px',
                                            border: '2px solid #e9d5ff'
                                        }}>
                                            <img
                                                src={user?.avatar?.url || 'https://via.placeholder.com/200'}
                                                alt={user?.name}
                                                style={{
                                                    width: '180px',
                                                    height: '180px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '5px solid #6b46c1',
                                                    boxShadow: '0 4px 15px rgba(107, 70, 193, 0.2)',
                                                    marginBottom: '20px'
                                                }}
                                            />
                                            <h3 style={{ color: '#333', marginBottom: '10px', fontWeight: 'bold' }}>
                                                {user?.name}
                                            </h3>
                                            <span style={{
                                                background: user?.role === 'admin'
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
                                                {user?.role?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Information Section */}
                                    <div className="col-md-8">
                                        <h4 style={{
                                            color: '#6b46c1',
                                            marginBottom: '25px',
                                            fontWeight: 'bold',
                                            borderBottom: '2px solid #e9d5ff',
                                            paddingBottom: '10px'
                                        }}>
                                            <i className="fa fa-info-circle mr-2"></i>
                                            Personal Information
                                        </h4>

                                        {/* Email */}
                                        <div style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            marginBottom: '15px',
                                            border: '1px solid #e9ecef'
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
                                            <span style={{ color: '#333', fontSize: '1.1rem', fontWeight: '500' }}>
                                                {user?.email}
                                            </span>
                                        </div>

                                        {/* Phone Number */}
                                        <div style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            marginBottom: '15px',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <strong style={{
                                                color: '#6b46c1',
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                <i className="fa fa-phone mr-2"></i>Phone Number
                                            </strong>
                                            <span style={{ color: user?.phoneNo ? '#333' : '#999', fontSize: '1.1rem', fontWeight: '500' }}>
                                                {user?.phoneNo || 'Not provided'}
                                            </span>
                                        </div>

                                        {/* Address */}
                                        <div style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            marginBottom: '15px',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <strong style={{
                                                color: '#6b46c1',
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                <i className="fa fa-map-marker mr-2"></i>Address
                                            </strong>
                                            <span style={{ color: user?.address ? '#333' : '#999', fontSize: '1.1rem', fontWeight: '500' }}>
                                                {user?.address ? (
                                                    <>
                                                        {user.address}
                                                        {user.city && `, ${user.city}`}
                                                        {user.postalCode && ` ${user.postalCode}`}
                                                    </>
                                                ) : 'Not provided'}
                                            </span>
                                        </div>

                                        {/* Joined Date */}
                                        <div style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            marginBottom: '15px',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <strong style={{
                                                color: '#6b46c1',
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                <i className="fa fa-calendar mr-2"></i>Member Since
                                            </strong>
                                            <span style={{ color: '#333', fontSize: '1.1rem', fontWeight: '500' }}>
                                                {new Date(user?.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {/* Account Status */}
                                        <div style={{
                                            background: user?.isSuspended
                                                ? 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)'
                                                : 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            marginBottom: '25px',
                                            border: user?.isSuspended ? '2px solid #dc3545' : '2px solid #28a745',
                                            boxShadow: user?.isSuspended
                                                ? '0 4px 12px rgba(220, 53, 69, 0.2)'
                                                : '0 4px 12px rgba(40, 167, 69, 0.2)'
                                        }}>
                                            <strong style={{
                                                color: user?.isSuspended ? '#721c24' : '#155724',
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                <i className="fa fa-shield mr-2"></i>Account Status
                                            </strong>
                                            <span style={{
                                                color: user?.isSuspended ? '#721c24' : '#155724',
                                                fontSize: '1.3rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {user?.isSuspended ? '🚫 SUSPENDED' : '✓ ACTIVE'}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <Link
                                                to="/me/update"
                                                className="btn"
                                                style={{
                                                    background: 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                                    color: 'white',
                                                    borderRadius: '25px',
                                                    padding: '12px 30px',
                                                    fontWeight: '600',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)'
                                                }}
                                            >
                                                <i className="fa fa-edit mr-2"></i>
                                                Edit Profile
                                            </Link>

                                            <Link
                                                to="/password/update"
                                                className="btn"
                                                style={{
                                                    backgroundColor: '#17a2b8',
                                                    color: 'white',
                                                    borderRadius: '25px',
                                                    padding: '12px 30px',
                                                    fontWeight: '600',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)'
                                                }}
                                            >
                                                <i className="fa fa-key mr-2"></i>
                                                Change Password
                                            </Link>

                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="btn"
                                                    style={{
                                                        backgroundColor: '#ffc107',
                                                        color: '#333',
                                                        borderRadius: '25px',
                                                        padding: '12px 30px',
                                                        fontWeight: '600',
                                                        border: 'none',
                                                        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                                                    }}
                                                >
                                                    <i className="fa fa-tachometer mr-2"></i>
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Profile;
