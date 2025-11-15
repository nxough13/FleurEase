import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';

const UpdatePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/password/update`,
                { oldPassword, password },
                config
            );

            toast.success('Password updated successfully');
            navigate('/me');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating password');
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <MetaData title={'Change Password'} />

            <div style={{
                minHeight: '80vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                padding: '40px 0'
            }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            {/* Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                                padding: '30px',
                                borderRadius: '15px 15px 0 0',
                                boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)',
                                textAlign: 'center'
                            }}>
                                <h1 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
                                    <i className="fa fa-key mr-2"></i>
                                    Change Password
                                </h1>
                            </div>

                            {/* Form Content */}
                            <div style={{
                                background: 'white',
                                borderRadius: '0 0 15px 15px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                padding: '40px'
                            }}>
                                <form onSubmit={submitHandler}>
                                    {/* Old Password */}
                                    <div className="form-group" style={{ marginBottom: '25px' }}>
                                        <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            <i className="fa fa-lock mr-2" style={{ color: '#17a2b8' }}></i>
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                            placeholder="Enter your current password"
                                            style={{
                                                padding: '15px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '1rem',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = '#17a2b8'}
                                            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                        />
                                    </div>

                                    {/* New Password */}
                                    <div className="form-group" style={{ marginBottom: '25px' }}>
                                        <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            <i className="fa fa-key mr-2" style={{ color: '#17a2b8' }}></i>
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter new password (min 6 characters)"
                                            style={{
                                                padding: '15px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '1rem',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = '#17a2b8'}
                                            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="form-group" style={{ marginBottom: '30px' }}>
                                        <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            <i className="fa fa-check-circle mr-2" style={{ color: '#17a2b8' }}></i>
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="Confirm your new password"
                                            style={{
                                                padding: '15px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '1rem',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = '#17a2b8'}
                                            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                        />
                                    </div>

                                    {/* Password Requirements */}
                                    <div style={{
                                        backgroundColor: '#e7f6f8',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        marginBottom: '25px',
                                        borderLeft: '4px solid #17a2b8'
                                    }}>
                                        <p style={{ color: '#0c5460', margin: 0, fontSize: '0.9rem' }}>
                                            <i className="fa fa-info-circle mr-2"></i>
                                            <strong>Password Requirements:</strong>
                                        </p>
                                        <ul style={{ color: '#0c5460', marginTop: '10px', marginBottom: 0, paddingLeft: '25px' }}>
                                            <li>Minimum 6 characters</li>
                                            <li>Both passwords must match</li>
                                        </ul>
                                    </div>

                                    {/* Buttons */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                flex: 1,
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                backgroundColor: loading ? '#ccc' : '#17a2b8',
                                                color: 'white',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!loading) e.currentTarget.style.backgroundColor = '#138496';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!loading) e.currentTarget.style.backgroundColor = '#17a2b8';
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="fa fa-spinner fa-spin mr-2"></i>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa fa-check mr-2"></i>
                                                    Update Password
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/me')}
                                            style={{
                                                flex: 1,
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: '2px solid #17a2b8',
                                                background: 'white',
                                                color: '#17a2b8',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'white';
                                            }}
                                        >
                                            <i className="fa fa-times mr-2"></i>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default UpdatePassword;
