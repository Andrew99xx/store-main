import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWareHouseAuth } from './WareHouseAuthContext';

const WareHousePrivateRoute = ({ children }) => {
  const { currentUser } = useWareHouseAuth();
  return currentUser ? children : <Navigate to="/warehouse-login" />;
};

export default WareHousePrivateRoute;
