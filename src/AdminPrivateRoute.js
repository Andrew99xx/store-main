import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

const AdminPrivateRoute = ({ children }) => {
  const { currentUser } = useAdminAuth();
  return currentUser ? children : <Navigate to="/admin-login" />;
};

export default AdminPrivateRoute;
