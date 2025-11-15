import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const userSchema = yup.object().shape({
    role: yup.string()
        .required('Please select a role')
        .oneOf(['user', 'admin'], 'Invalid role selected')
});

const UpdateUser = () => {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userData, setUserData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(''); // 'suspend' or 'unsuspend'
    const [modalSubject, setModalSubject] = useState('');
    const [modalReason, setModalReason] = useState('');

    const { id } = useParams();
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(userSchema)
    });

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

            setValue('role', data.user.role);
            setUserData(data.user);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading user');
            navigate('/admin/users');
        }
    };

    const onSubmit = async (data) => {
        setUpdating(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            await axios.put(
                `${import.meta.env.VITE_API}/admin/user/${id}`,
                data,
                config
            );

            toast.success('User role updated successfully! 🌸');
            navigate('/admin/users');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating user');
            setUpdating(false);
        }
    };

    const openSuspendModal = (action) => {
        setModalAction(action);
        setModalSubject(action === 'suspend' ? 'Account Suspended' : 'Account Reactivated');
        setModalReason('');
        setShowModal(true);
    };

    const handleSuspendAction = async () => {
        if (!modalReason.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const endpoint = modalAction === 'suspend' 
                ? `${import.meta.env.VITE_API}/admin/user/${id}/suspend`
                : `${import.meta.env.VITE_API}/admin/user/${id}/unsuspend`;

            await axios.put(endpoint, {
                subject: modalSubject,
                reason: modalReason
            }, config);

            toast.success(`User ${modalAction === 'suspend' ? 'suspended' : 'unsuspended'} and email sent! 🌸`);
            setShowModal(false);
            fetchUser();
        } catch (error) {
            toast.error(error.response?.data?.message || `Error ${modalAction}ing user`);
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
            <MetaData title={'Update User'} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '20px',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa'
            }}>
                <div className="row">
                    <div className="col-12 col-md-8 mx-auto">
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            padding: '30px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <h1 style={{ color: '#6b46c1', fontWeight: 'bold', marginBottom: '30px' }}>
                                <i className="fa fa-user-edit mr-2"></i>
                                Update User
                            </h1>

                            {/* User Info Display */}
                            <div style={{ 
                                textAlign: 'center', 
                                marginBottom: '30px',
                                padding: '25px',
                                background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                                borderRadius: '15px',
                                border: '2px solid #e9d5ff'
                            }}>
                                {userData?.avatar && (
                                    <img
                                        src={userData.avatar.url}
                                        alt={userData.name}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '4px solid #6b46c1',
                                            boxShadow: '0 4px 10px rgba(107, 70, 193, 0.2)',
                                            marginBottom: '15px'
                                        }}
                                    />
                                )}
                                <h3 style={{ color: '#333', marginBottom: '5px' }}>{userData?.name}</h3>
                                <p style={{ color: '#666', marginBottom: '10px' }}>{userData?.email}</p>
                                <span style={{
                                    padding: '5px 15px',
                                    borderRadius: '15px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    backgroundColor: userData?.isSuspended ? '#f8d7da' : '#d4edda',
                                    color: userData?.isSuspended ? '#721c24' : '#155724',
                                    display: 'inline-block'
                                }}>
                                    {userData?.isSuspended ? '🚫 SUSPENDED' : '✓ ACTIVE'}
                                </span>
                                {userData?.isSuspended && userData?.suspensionReason && (
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '10px',
                                        backgroundColor: '#fff3cd',
                                        borderRadius: '8px',
                                        border: '1px solid #ffc107'
                                    }}>
                                        <small style={{ color: '#856404' }}>
                                            <strong>Reason:</strong> {userData.suspensionReason}
                                        </small>
                                    </div>
                                )}
                            </div>

                            <div className="alert alert-info" style={{ borderRadius: '10px' }}>
                                <i className="fa fa-info-circle mr-2"></i>
                                <strong>Note:</strong> You can only update the user's role and account status. Personal information (name, email) cannot be modified by admins.
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)}>

                                {/* Role */}
                                <div className="form-group">
                                    <label style={{ fontWeight: '500', color: '#333' }}>
                                        Role <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                                        {...register('role')}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '12px',
                                            border: errors.role ? '1px solid #dc3545' : '1px solid #ddd'
                                        }}
                                    >
                                        <option value="">Select Role</option>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {errors.role && (
                                        <div className="invalid-feedback d-block">
                                            <i className="fa fa-exclamation-circle mr-1"></i>
                                            {errors.role.message}
                                        </div>
                                    )}
                                    <small className="form-text text-muted">
                                        <i className="fa fa-info-circle mr-1"></i>
                                        Admins have full access to the admin panel
                                    </small>
                                </div>

                                {/* Buttons */}
                                <div className="form-group mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-lg mr-2"
                                        disabled={updating}
                                        style={{
                                            backgroundColor: '#6b46c1',
                                            color: 'white',
                                            borderRadius: '25px',
                                            padding: '12px 30px',
                                            fontWeight: '500',
                                            border: 'none'
                                        }}
                                    >
                                        {updating ? (
                                            <>
                                                <i className="fa fa-spinner fa-spin mr-2"></i>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-save mr-2"></i>
                                                Update Role
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/users')}
                                        className="btn btn-lg mr-2"
                                        style={{
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            borderRadius: '25px',
                                            padding: '12px 30px',
                                            fontWeight: '500',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="fa fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                </div>
                            </form>

                            {/* Account Status Actions */}
                            <div style={{
                                marginTop: '30px',
                                padding: '25px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '10px',
                                border: '2px solid #e9ecef'
                            }}>
                                <h4 style={{ color: '#6b46c1', marginBottom: '20px' }}>
                                    <i className="fa fa-shield mr-2"></i>
                                    Account Status Management
                                </h4>
                                {userData?.isSuspended ? (
                                    <button
                                        type="button"
                                        onClick={() => openSuspendModal('unsuspend')}
                                        className="btn btn-lg"
                                        style={{
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            borderRadius: '25px',
                                            padding: '12px 30px',
                                            fontWeight: '500',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="fa fa-check-circle mr-2"></i>
                                        Unsuspend Account
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => openSuspendModal('suspend')}
                                        className="btn btn-lg"
                                        style={{
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            borderRadius: '25px',
                                            padding: '12px 30px',
                                            fontWeight: '500',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="fa fa-ban mr-2"></i>
                                        Suspend Account
                                    </button>
                                )}
                                <p style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
                                    <i className="fa fa-info-circle mr-1"></i>
                                    {userData?.isSuspended 
                                        ? 'Unsuspending will restore the user\'s access and send them an email notification.'
                                        : 'Suspending will block the user\'s access and send them an email notification.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suspend/Unsuspend Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}>
                        <h3 style={{ 
                            color: modalAction === 'suspend' ? '#dc3545' : '#28a745',
                            marginBottom: '20px'
                        }}>
                            <i className={`fa fa-${modalAction === 'suspend' ? 'ban' : 'check-circle'} mr-2`}></i>
                            {modalAction === 'suspend' ? 'Suspend' : 'Unsuspend'} Account
                        </h3>

                        <div className="form-group">
                            <label style={{ fontWeight: '500', color: '#333' }}>
                                Email Subject <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={modalSubject}
                                onChange={(e) => setModalSubject(e.target.value)}
                                placeholder="Enter email subject"
                                style={{
                                    borderRadius: '8px',
                                    padding: '12px',
                                    border: '1px solid #ddd'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ fontWeight: '500', color: '#333' }}>
                                Reason/Message <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className="form-control"
                                value={modalReason}
                                onChange={(e) => setModalReason(e.target.value)}
                                rows="4"
                                placeholder={modalAction === 'suspend' 
                                    ? 'Explain why this account is being suspended...'
                                    : 'Provide a message for account reactivation...'}
                                style={{
                                    borderRadius: '8px',
                                    padding: '12px',
                                    border: '1px solid #ddd'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn"
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    borderRadius: '20px',
                                    padding: '10px 25px',
                                    fontWeight: '500',
                                    border: 'none'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspendAction}
                                className="btn"
                                style={{
                                    backgroundColor: modalAction === 'suspend' ? '#dc3545' : '#28a745',
                                    color: 'white',
                                    borderRadius: '20px',
                                    padding: '10px 25px',
                                    fontWeight: '500',
                                    border: 'none'
                                }}
                            >
                                <i className={`fa fa-${modalAction === 'suspend' ? 'ban' : 'check'} mr-2`}></i>
                                Confirm & Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default UpdateUser;
