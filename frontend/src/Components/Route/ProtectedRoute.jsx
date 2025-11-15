import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../../Utils/helpers';

const ProtectedRoute = ({ children, isAdmin }) => {
    const user = getUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
