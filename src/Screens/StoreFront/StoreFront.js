import React, { useState } from 'react';
import AddCustomer from './AddCustomer';
import MakeBill from './MakeBill';
import InvoiceFront from "./InvoiceFront"
import CustomerAll from './CustomerAll';

const StoreFront = () => {
  const [activeTab, setActiveTab] = useState('makeBill'); // Default tab

  const renderComponent = () => {
    switch (activeTab) {
      case 'makeBill':
        return <MakeBill />;
      case 'addCustomer':
        return <AddCustomer />;
      case 'customerAll':
        return <CustomerAll />;
      case 'invoiceFront':
        return <InvoiceFront />;
      default:
        return <MakeBill />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar-style tab bar */}
      <div className="bg-white shadow-md p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-center space-x-6">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'makeBill' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('makeBill')}
          >
            Make Bill
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'addCustomer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('addCustomer')}
          >
            Add Customer
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'customerAll' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('customerAll')}
          >
            Customers
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'invoiceFront' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('invoiceFront')}
          >
            Invoices
          </button>
        </div>
      </div>

      {/* Content area below navbar */}
      <div className="pt-20 p-6 w-full max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-md p-6">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default StoreFront;
