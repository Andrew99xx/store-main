import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, where } from '../../firebase';
import { Link } from 'react-router-dom';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showModal, setShowModal] = useState(false); // New state to handle modal visibility

    useEffect(() => {
        const fetchCustomers = async () => {
            const customersSnap = await getDocs(collection(db, 'customers'));
            const customersData = customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCustomers(customersData);
            setFilteredCustomers(customersData); // Initialize filteredCustomers with all customers
        };

        fetchCustomers();
    }, []);

    useEffect(() => {
        const lowercasedFilter = searchQuery.toLowerCase();
        const filteredData = customers.filter(customer => {
            const id = customer.id ? customer.id.toLowerCase() : '';
            const phone = customer.phone ? customer.phone.toString() : '';
            return id.includes(lowercasedFilter) || phone.includes(searchQuery);
        });
        setFilteredCustomers(filteredData);
    }, [searchQuery, customers]);

    const handleViewInvoices = async (customerId) => {
        const invoicesSnap = await getDocs(query(collection(db, 'invoices'), where('customerId', '==', customerId)));
        const invoicesData = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSelectedCustomer(customerId);
        setInvoices(invoicesData);
        setShowModal(true); // Open modal when a customer is selected
    };

    const closeModal = () => {
        setShowModal(false); // Close modal when the close button is clicked
        setSelectedCustomer(null);
        setInvoices([]);
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="flex justify-center items-center space-x-4 bg-white p-4 shadow-md rounded-md">
                <Link to="/admin" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
                <Link to="/admin/stock" className="text-blue-600 hover:text-blue-800">Stock</Link>
                <Link to="/admin/customers" className="text-blue-600 hover:text-blue-800">Customers</Link>
                <Link to="/admin/invoices" className="text-blue-600 hover:text-blue-800">Invoices</Link>
            </div>

            <div className="mt-6 bg-white p-6 rounded-md shadow-md">
                <h2 className="text-xl font-bold text-gray-800">Customers</h2>
                <input
                    type="text"
                    placeholder="Search by Phone or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <hr className="my-4" />

                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border text-left">ID</th>
                            <th className="p-2 border text-left">Phone</th>
                            <th className="p-2 border text-left">Edit</th>
                            <th className="p-2 border text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="p-2 border">{customer.id || 'N/A'}</td>
                                <td className="p-2 border">{customer.phone || 'N/A'}</td>
                                <td className="p-2 border">
                                    <Link to={`/admin/edit-customer/${customer.id}`} className="text-blue-600 hover:text-blue-800">Edit</Link>
                                </td>
                                <td className="p-2 border">
                                    <button
                                        onClick={() => handleViewInvoices(customer.id)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        View Invoices
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full m-16 h-full overflow-y-scroll">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-700">Invoices for Customer ID: {selectedCustomer}</h3>
                            <button
                                className="text-red-600 hover:text-red-800 font-bold text-3xl"
                                onClick={closeModal}
                            >
                                X
                            </button>
                        </div>
                        <table className="w-full table-auto border-collapse mt-4">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 border text-left">ID</th>
                                    <th className="p-2 border text-left">Total Amount</th>
                                    <th className="p-2 border text-left">Date</th>
                                    <th className="p-2 border text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length > 0 ? (
                                    invoices.map(invoice => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="p-2 border">{invoice.id || 'N/A'}</td>
                                            <td className="p-2 border">₹{invoice.totalAmount || 'N/A'}</td>
                                            <td className="p-2 border">
                                                {invoice.createdAt ? new Date(invoice.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-2 border">
                                                <Link to={`/invoice/${invoice.id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="p-2 border text-center" colSpan="4">No invoices found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Customers;
