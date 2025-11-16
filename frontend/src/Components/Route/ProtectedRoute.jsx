import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, isAdmin }) => {
    const user = getUser();

    useEffect(() => {
        if (isAdmin && user && user.role !== 'admin') {
            toast.error('Access Denied! You must be an admin to access this page.', {
                position: 'top-center',
                autoClose: 3000
            });
        }
    }, [isAdmin, user]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
