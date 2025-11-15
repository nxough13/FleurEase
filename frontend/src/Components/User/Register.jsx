import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import axios from 'axios';
import { toast } from 'react-toastify';
import { authenticate, getUser } from '../../Utils/helpers';
import { signInWithGoogle } from '../../firebase';
import FacebookLogin from '@greatsumini/react-facebook-login';

// Validation Schema
const registerSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(30, 'Name cannot exceed 30 characters')
        .required('Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password')
});

const Register = () => {
    const [avatar, setAvatar] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg');
    const [loading, setLoading] = useState(false);

    let navigate = useNavigate();

    useEffect(() => {
        if (getUser()) {
            navigate('/');
        }
    }, [navigate]);

    const submitHandler = async (values) => {
        if (!avatar) {
            toast.error('Please upload an avatar');
            return;
        }

        setLoading(true);

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API}/register`,
                { name: values.name, email: values.email, password: values.password, avatar },
                config
            );

            setLoading(false);
            toast.success(data.message || 'Registration successful! Please check your email to verify your account.', {
                autoClose: 8000
            });
            
            // Reset form
            setAvatar('');
            setAvatarPreview('/images/default_avatar.jpg');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result);
                setAvatar(reader.result);
            }
        };

        reader.readAsDataURL(e.target.files[0]);
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            const googleUser = await signInWithGoogle();
            
            // Send Google user data to backend
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API}/google-login`,
                {
                    email: googleUser.email,
                    name: googleUser.displayName,
                    googleId: googleUser.uid,
                    avatar: googleUser.photoURL
                },
                config
            );

            authenticate(data, () => {
                toast.success('Google Sign-In successful! Welcome to FleurEase 🌸');
                navigate('/');
            });
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            toast.error('Google Sign-In failed. Please try again.');
            setLoading(false);
        }
    };

    const handleFacebookLogin = async (response) => {
        if (response.accessToken) {
            try {
                setLoading(true);
                
                const config = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                const { data } = await axios.post(
                    `${import.meta.env.VITE_API}/facebook-login`,
                    {
                        email: response.email,
                        name: response.name,
                        facebookId: response.userID,
                        avatar: response.picture?.data?.url
                    },
                    config
                );

                authenticate(data, () => {
                    toast.success('Facebook Sign-In successful! Welcome 🌸');
                    navigate('/');
                });
            } catch (error) {
                console.error('Facebook Sign-In Error:', error);
                toast.error('Facebook Sign-In failed. Please try again.');
                setLoading(false);
            }
        } else {
            toast.error('Facebook Sign-In was cancelled.');
        }
    };

    return (
        <Fragment>
            <MetaData title={'Register'} />

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url(https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2070)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                padding: '20px'
            }}>
                {/* Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(107, 70, 193, 0.3)',
                    backdropFilter: 'blur(3px)'
                }}></div>

                {loading ? <Loader /> : (
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: '500px'
                    }}>
                        {/* Glassy Modal */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 8px 32px 0 rgba(107, 70, 193, 0.37)',
                            padding: '40px',
                            color: 'white'
                        }}>
                            <div className="text-center mb-4">
                                <h1 style={{ 
                                    color: 'white', 
                                    fontSize: '2rem', 
                                    fontWeight: 'bold',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    Register
                                </h1>
                                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
                                    Create your FleurEase account
                                </p>
                            </div>

                            <Formik
                                initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
                                validationSchema={registerSchema}
                                onSubmit={submitHandler}
                            >
                                {({ errors, touched }) => (
                                    <Form>
                                        <div className="form-group">
                                            <div style={{ position: 'relative' }}>
                                                <i className="fa fa-user" style={{
                                                    position: 'absolute',
                                                    left: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    zIndex: 1
                                                }}></i>
                                                <Field
                                                    type="text"
                                                    name="name"
                                                    className="form-control"
                                                    placeholder="Full Name"
                                                    style={{ 
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: errors.name && touched.name ? '2px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        padding: '12px 15px 12px 45px',
                                                        color: 'white',
                                                        fontSize: '0.95rem'
                                                    }}
                                                />
                                            </div>
                                            <ErrorMessage name="name" component="div" style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '5px', marginLeft: '15px' }} />
                                        </div>

                                        <div className="form-group">
                                            <div style={{ position: 'relative' }}>
                                                <i className="fa fa-envelope" style={{
                                                    position: 'absolute',
                                                    left: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    zIndex: 1
                                                }}></i>
                                                <Field
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="Email ID"
                                                    style={{ 
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: errors.email && touched.email ? '2px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        padding: '12px 15px 12px 45px',
                                                        color: 'white',
                                                        fontSize: '0.95rem'
                                                    }}
                                                />
                                            </div>
                                            <ErrorMessage name="email" component="div" style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '5px', marginLeft: '15px' }} />
                                        </div>

                                        <div className="form-group">
                                            <div style={{ position: 'relative' }}>
                                                <i className="fa fa-lock" style={{
                                                    position: 'absolute',
                                                    left: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    zIndex: 1
                                                }}></i>
                                                <Field
                                                    type="password"
                                                    name="password"
                                                    className="form-control"
                                                    placeholder="Password"
                                                    style={{ 
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: errors.password && touched.password ? '2px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        padding: '12px 15px 12px 45px',
                                                        color: 'white',
                                                        fontSize: '0.95rem'
                                                    }}
                                                />
                                            </div>
                                            <ErrorMessage name="password" component="div" style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '5px', marginLeft: '15px' }} />
                                        </div>

                                        <div className="form-group">
                                            <div style={{ position: 'relative' }}>
                                                <i className="fa fa-lock" style={{
                                                    position: 'absolute',
                                                    left: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    zIndex: 1
                                                }}></i>
                                                <Field
                                                    type="password"
                                                    name="confirmPassword"
                                                    className="form-control"
                                                    placeholder="Confirm Password"
                                                    style={{ 
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: errors.confirmPassword && touched.confirmPassword ? '2px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '25px',
                                                        padding: '12px 15px 12px 45px',
                                                        color: 'white',
                                                        fontSize: '0.95rem'
                                                    }}
                                                />
                                            </div>
                                            <ErrorMessage name="confirmPassword" component="div" style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '5px', marginLeft: '15px' }} />
                                        </div>

                                        <div className='form-group'>
                                            <label style={{ color: 'white', fontSize: '0.95rem', marginBottom: '10px' }}>
                                                <i className="fa fa-camera" style={{ marginRight: '8px' }}></i>
                                                Profile Picture
                                            </label>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <figure className='avatar mr-3 item-rtl'>
                                                        <img
                                                            src={avatarPreview}
                                                            className='rounded-circle'
                                                            alt='Avatar Preview'
                                                            style={{ 
                                                                border: '3px solid rgba(255, 255, 255, 0.5)',
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </figure>
                                                </div>
                                                <div className='custom-file' style={{ flex: 1 }}>
                                                    <input
                                                        type='file'
                                                        name='avatar'
                                                        className='custom-file-input'
                                                        id='customFile'
                                                        accept="image/*"
                                                        onChange={handleAvatarChange}
                                                        required
                                                        style={{
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                    <label 
                                                        className='custom-file-label' 
                                                        htmlFor='customFile'
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.2)',
                                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                                            borderRadius: '25px',
                                                            color: 'white',
                                                            padding: '8px 15px'
                                                        }}
                                                    >
                                                        Choose Avatar
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-block py-3"
                                            style={{
                                                backgroundColor: 'white',
                                                color: '#6b46c1',
                                                borderRadius: '25px',
                                                fontWeight: 'bold',
                                                border: 'none',
                                                fontSize: '1rem',
                                                marginTop: '20px'
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating Account...' : 'Register'}
                                        </button>

                                        {/* Divider */}
                                        <div className="text-center my-3" style={{ position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: 0,
                                                right: 0,
                                                height: '1px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.3)'
                                            }}></div>
                                            <span style={{
                                                position: 'relative',
                                                backgroundColor: 'rgba(107, 70, 193, 0.3)',
                                                padding: '0 15px',
                                                color: 'white',
                                                fontSize: '0.9rem'
                                            }}>OR</span>
                                        </div>

                                        {/* Social Login Buttons */}
                                        <button
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="btn btn-block py-3 mb-2"
                                            style={{
                                                backgroundColor: 'white',
                                                color: '#333',
                                                borderRadius: '25px',
                                                fontWeight: 'bold',
                                                border: 'none',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px'
                                            }}
                                            disabled={loading}
                                        >
                                            <img 
                                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                                                alt="Google" 
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                            Sign up with Google
                                        </button>

                                        {/* Facebook Login Button */}
                                        <FacebookLogin
                                            appId={import.meta.env.VITE_FACEBOOK_APP_ID || "1234567890"}
                                            onSuccess={handleFacebookLogin}
                                            onFail={(error) => {
                                                console.error('Facebook Login Failed:', error);
                                                toast.error('Facebook login failed');
                                            }}
                                            fields="name,email,picture"
                                            render={({ onClick }) => (
                                                <button
                                                    type="button"
                                                    onClick={onClick}
                                                    className="btn btn-block py-3"
                                                    style={{
                                                        backgroundColor: '#1877f2',
                                                        color: 'white',
                                                        borderRadius: '25px',
                                                        fontWeight: 'bold',
                                                        border: 'none',
                                                        fontSize: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '10px'
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <i className="fab fa-facebook-f"></i>
                                                    Sign up with Facebook
                                                </button>
                                            )}
                                        />

                                        <div className="text-center mt-4" style={{ color: 'white' }}>
                                            Already have an account?{' '}
                                            <Link to="/login" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}>
                                                Login
                                            </Link>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                input::placeholder {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                input:focus {
                    background: rgba(255, 255, 255, 0.25) !important;
                    border-color: rgba(255, 255, 255, 0.5) !important;
                    outline: none !important;
                    box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25) !important;
                }
                .custom-file-label::after {
                    display: none;
                }
            `}</style>
        </Fragment>
    );
};

export default Register;
