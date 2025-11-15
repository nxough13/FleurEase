import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import { getUser, getToken } from '../../Utils/helpers';
import axios from 'axios';

const Shipping = () => {
    const navigate = useNavigate();
    const user = getUser();
    
    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        phoneNo: '',
        postalCode: '',
        country: 'Philippines'
    });

    useEffect(() => {
        // Fetch user profile to get saved address
        const fetchUserAddress = async () => {
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                };

                const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config);
                
                // Auto-fill with user's saved address if available
                if (data.user) {
                    setShippingInfo({
                        address: data.user.address || '',
                        city: data.user.city || '',
                        phoneNo: data.user.phoneNo || '',
                        postalCode: data.user.postalCode || '',
                        country: 'Philippines'
                    });
                }
            } catch (error) {
                // If error, just use empty fields
                console.log('Could not fetch user address');
            }
        };

        if (user) {
            fetchUserAddress();
        }
    }, []);

    const { address, city, phoneNo, postalCode, country } = shippingInfo;

    const onChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();

        if (!address || !city || !phoneNo || !postalCode) {
            toast.error('Please fill in all fields');
            return;
        }

        if (phoneNo.length < 10) {
            toast.error('Phone number must be at least 10 digits');
            return;
        }

        // Save to localStorage
        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
        navigate('/confirm-order');
    };

    return (
        <>
            <MetaData title={'Shipping Info'} />
            
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 0',
                marginBottom: '30px'
            }}>
                <div className="container">
                    <h1 style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
                        <i className="fa fa-truck mr-2"></i>
                        Shipping Information
                    </h1>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '600px', marginBottom: '50px' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    padding: '40px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    <form onSubmit={submitHandler}>
                        {/* Address */}
                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label style={{ color: '#333', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                <i className="fa fa-home mr-2" style={{ color: '#6b46c1' }}></i>
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={address}
                                onChange={onChange}
                                placeholder="Enter your complete address"
                                required
                                minLength="10"
                                maxLength="200"
                                title="Address must be between 10 and 200 characters"
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#6b46c1'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        {/* City */}
                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label style={{ color: '#333', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                <i className="fa fa-building mr-2" style={{ color: '#6b46c1' }}></i>
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={city}
                                onChange={onChange}
                                placeholder="Enter your city"
                                required
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#6b46c1'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label style={{ color: '#333', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                <i className="fa fa-phone mr-2" style={{ color: '#6b46c1' }}></i>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNo"
                                value={phoneNo}
                                onChange={onChange}
                                placeholder="09XXXXXXXXX"
                                required
                                pattern="[0-9]{10,11}"
                                title="Phone number must be 10-11 digits (numbers only)"
                                maxLength="11"
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#6b46c1'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        {/* Postal Code */}
                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label style={{ color: '#333', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                <i className="fa fa-map-marker mr-2" style={{ color: '#6b46c1' }}></i>
                                Postal Code
                            </label>
                            <input
                                type="text"
                                name="postalCode"
                                value={postalCode}
                                onChange={onChange}
                                placeholder="Enter 4-digit postal code"
                                required
                                pattern="[0-9]{4}"
                                title="Postal code must be 4 digits"
                                maxLength="4"
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#6b46c1'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                            />
                        </div>

                        {/* Country */}
                        <div className="form-group" style={{ marginBottom: '30px' }}>
                            <label style={{ color: '#333', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                <i className="fa fa-globe mr-2" style={{ color: '#6b46c1' }}></i>
                                Country
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={country}
                                onChange={onChange}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    backgroundColor: '#f8f9fa',
                                    color: '#666'
                                }}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: '#6b46c1',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#8b5cf6';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#6b46c1';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <i className="fa fa-arrow-right mr-2"></i>
                            Continue to Order Summary
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Shipping;
