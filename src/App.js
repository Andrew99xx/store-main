// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreFrontAuthProvider } from './StoreFrontAuthContext';
import { AdminAuthProvider } from './AdminAuthContext';
import { WareHouseAuthProvider } from './WareHouseAuthContext';
import StoreFrontPrivateRoute from './StoreFrontPrivateRoute';
import AdminPrivateRoute from './AdminPrivateRoute';
import WareHousePrivateRoute from './WareHousePrivateRoute';
import WareHouse from './Screens/Warehouse/WareHouse';
import StoreFront from './Screens/StoreFront/StoreFront';
import ShowInvoice from './Screens/StoreFront/ShowInvoice';
import CustomerInvoices from './Screens/StoreFront/CustomerInvoices';
import AdminDashboard from './Screens/Admin/AdminDashboard';
import Stock from './Screens/Admin/Stock';
import Customers from './Screens/Admin/Customers';
import Invoices from './Screens/Admin/Invoices';
import CustomerDetail from './Screens/Admin/CustomerDetail';
import EditCustomer from './Screens/Admin/EditCustomer';
import EditInvoice from './Screens/Admin/EditInvoice';
import EditProduct from './Screens/Admin/EditProduct';
import StoreFrontLoginPage from './StoreFrontLoginPage';
import AdminLoginPage from './AdminLoginPage';
import WareHouseLoginPage from './WareHouseLoginPage';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className='app'>
        <StoreFrontAuthProvider>
          <AdminAuthProvider>
            <WareHouseAuthProvider>
              <Routes>
                <Route path="/storefront-login" element={<StoreFrontLoginPage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/warehouse-login" element={<WareHouseLoginPage />} />
                <Route path="/" element={<StoreFrontPrivateRoute><StoreFront /></StoreFrontPrivateRoute>} />
                <Route path="/warehouse" element={<WareHousePrivateRoute><WareHouse /></WareHousePrivateRoute>} />
                <Route path="/storefront" element={<StoreFrontPrivateRoute><StoreFront /></StoreFrontPrivateRoute>} />
                <Route path="/invoice/:invoiceId" element={<ShowInvoice />} />
                <Route path="/customer/:customerId" element={<CustomerInvoices />} />
                <Route path="/admin" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
                <Route path="/admin/stock" element={<AdminPrivateRoute><Stock /></AdminPrivateRoute>} />
                <Route path="/admin/customers" element={<AdminPrivateRoute><Customers /></AdminPrivateRoute>} />
                <Route path="/admin/invoices" element={<AdminPrivateRoute><Invoices /></AdminPrivateRoute>} />
                <Route path="/admin/customers/:customerId" element={<AdminPrivateRoute><CustomerDetail /></AdminPrivateRoute>} />
                <Route path="/admin/edit-product/:productId" element={<AdminPrivateRoute><EditProduct /></AdminPrivateRoute>} />
                <Route path="/admin/edit-invoice/:invoiceId" element={<AdminPrivateRoute><EditInvoice /></AdminPrivateRoute>} />
                <Route path="/admin/edit-customer/:customerId" element={<AdminPrivateRoute><EditCustomer /></AdminPrivateRoute>} />
              </Routes>
            </WareHouseAuthProvider>
          </AdminAuthProvider>
        </StoreFrontAuthProvider>
      </div>
    </Router>
  );
};

export default App;
