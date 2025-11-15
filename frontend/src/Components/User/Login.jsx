import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
});

const Login = () => {
    const [loading, setLoading] = useState(false);

    let navigate = useNavigate();
    let location = useLocation();
    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

    useEffect(() => {
        const user = getUser();
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate(`/${redirect}`);
            }
        }
    }, [navigate, redirect]);

    const submitHandler = async (values) => {
        setLoading(true);

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API}/login`, values, config);
            
            authenticate(data, () => {
                toast.success('Login successful! Welcome back 🌸');
                
                // Redirect admin to dashboard, regular users to home or redirect path
                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate(`/${redirect}`);
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            setLoading(false);
        }
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
                toast.success('Google Sign-In successful! Welcome 🌸');
                
                // Redirect admin to dashboard, regular users to home or redirect path
                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate(`/${redirect}`);
                }
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
                    
                    if (data.user.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate(`/${redirect}`);
                    }
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
            <MetaData title={'Login'} />
            
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
                        maxWidth: '450px'
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
                                    Login
                                </h1>
                            </div>

                            <Formik
                                initialValues={{ email: '', password: '' }}
                                validationSchema={loginSchema}
                                onSubmit={submitHandler}
                            >
                                {({ errors, touched }) => (
                                    <Form>
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

                                        <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: '0.9rem' }}>
                                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', cursor: 'pointer' }}>
                                                <input type="checkbox" style={{ marginRight: '8px' }} />
                                                Remember me
                                            </label>
                                            <Link to="/password/forgot" style={{ color: 'white', textDecoration: 'none' }}>
                                                Forgot Password?
                                            </Link>
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
                                                marginTop: '10px'
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Logging in...' : 'Login'}
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
                                            Sign in with Google
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
                                                    Sign in with Facebook
                                                </button>
                                            )}
                                        />

                                        <div className="text-center mt-4" style={{ color: 'white' }}>
                                            Don't have an account?{' '}
                                            <Link to="/register" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}>
                                                Register
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
            `}</style>
        </Fragment>
    );
};

export default Login;
