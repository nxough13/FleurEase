import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MetaData from '../Layout/MetaData';
import axios from 'axios';
import { getToken, authenticate } from '../../Utils/helpers';
import { toast } from 'react-toastify';

// Validation Schema
const updateProfileSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(30, 'Name cannot exceed 30 characters')
        .required('Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    address: Yup.string(),
    city: Yup.string(),
    postalCode: Yup.string(),
    phoneNo: Yup.string()
        .matches(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits')
});

const UpdateProfile = () => {
    const [initialValues, setInitialValues] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        phoneNo: ''
    });
    const [avatar, setAvatar] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('https://res.cloudinary.com/dmisd2xs9/image/upload/v1/avatars/default_avatar');
    const [loading, setLoading] = useState(false);

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
            setInitialValues({
                name: data.user.name,
                email: data.user.email,
                address: data.user.address || '',
                city: data.user.city || '',
                postalCode: data.user.postalCode || '',
                phoneNo: data.user.phoneNo || ''
            });
            setAvatarPreview(data.user.avatar.url);
        } catch (error) {
            toast.error('Error loading profile');
        }
    };

    const onChange = e => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result);
                setAvatar(reader.result);
            }
        };

        reader.readAsDataURL(e.target.files[0]);
    };

    const submitHandler = async (values) => {
        setLoading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const formData = {
                ...values,
                avatar
            };

            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/me/update`,
                formData,
                config
            );

            // Update sessionStorage with new user data
            authenticate(data, () => {
                toast.success('Profile updated successfully');
                navigate('/me');
            });

        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <MetaData title={'Update Profile'} />

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
                                    <i className="fa fa-edit mr-2"></i>
                                    Update Profile
                                </h1>
                            </div>

                            {/* Form Content */}
                            <div style={{
                                background: 'white',
                                borderRadius: '0 0 15px 15px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                padding: '40px'
                            }}>
                                <form onSubmit={submitHandler} encType='multipart/form-data'>
                                    {/* Avatar Upload */}
                                    <div className="form-group text-center" style={{ marginBottom: '30px' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar Preview"
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '5px solid #6b46c1',
                                                    boxShadow: '0 4px 15px rgba(107, 70, 193, 0.2)'
                                                }}
                                            />
                                        </div>
                                        <div className="custom-file" style={{ maxWidth: '400px', margin: '0 auto' }}>
                                            <input
                                                type='file'
                                                name='avatar'
                                                className='custom-file-input'
                                                id='customFile'
                                                accept="image/*"
                                                onChange={onChange}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label className='custom-file-label' htmlFor='customFile' style={{
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0'
                                            }}>
                                                Choose Avatar
                                            </label>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            <i className="fa fa-user mr-2" style={{ color: '#6b46c1' }}></i>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            minLength="2"
                                            maxLength="50"
                                            pattern="[A-Za-z\s]+"
                                            title="Name must be 2-50 characters (letters and spaces only)"
                                            style={{
                                                padding: '12px 15px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            <i className="fa fa-envelope mr-2" style={{ color: '#6b46c1' }}></i>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            readOnly
                                            disabled
                                            style={{
                                                padding: '12px 15px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '1rem',
                                                backgroundColor: '#f8f9fa',
                                                color: '#6c757d',
                                                cursor: 'not-allowed'
                                            }}
                                        />
                                        <small style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                                            <i className="fa fa-info-circle mr-1"></i>
                                            Email cannot be changed
                                        </small>
                                    </div>

                                    {/* Phone Number */}
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            <i className="fa fa-phone mr-2" style={{ color: '#6b46c1' }}></i>
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={phoneNo}
                                            onChange={(e) => setPhoneNo(e.target.value)}
                                            placeholder="09XXXXXXXXX"
                                            pattern="[0-9]{10,11}"
                                            title="Phone number must be 10-11 digits (numbers only)"
                                            maxLength="11"
                                            style={{
                                                padding: '12px 15px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                            <i className="fa fa-home mr-2" style={{ color: '#6b46c1' }}></i>
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter your street address"
                                            minLength="10"
                                            maxLength="200"
                                            title="Address must be between 10 and 200 characters"
                                            style={{
                                                padding: '12px 15px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    {/* City and Postal Code Row */}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                                <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                                    <i className="fa fa-building mr-2" style={{ color: '#6b46c1' }}></i>
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    placeholder="Enter your city"
                                                    style={{
                                                        padding: '12px 15px',
                                                        borderRadius: '8px',
                                                        border: '2px solid #e0e0e0',
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                                <label style={{ color: '#333', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                                    <i className="fa fa-map-marker mr-2" style={{ color: '#6b46c1' }}></i>
                                                    Postal Code
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={postalCode}
                                                    onChange={(e) => setPostalCode(e.target.value)}
                                                    placeholder="Enter 4-digit postal code"
                                                    pattern="[0-9]{4}"
                                                    title="Postal code must be 4 digits"
                                                    maxLength="4"
                                                    style={{
                                                        padding: '12px 15px',
                                                        borderRadius: '8px',
                                                        border: '2px solid #e0e0e0',
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                flex: 1,
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: loading ? '#ccc' : 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)',
                                                color: 'white',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease'
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
                                                    Update Profile
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
                                                border: '2px solid #6b46c1',
                                                background: 'white',
                                                color: '#6b46c1',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
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

export default UpdateProfile;
