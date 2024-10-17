import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWareHouseAuth } from './WareHouseAuthContext';

const WareHousePrivateRoute = ({ children }) => {
  // const { currentUser } = useWareHouseAuth();
  const currentUser = true;
  return currentUser ? children : <Navigate to="/warehouse-login" />;
};

export default WareHousePrivateRoute;
