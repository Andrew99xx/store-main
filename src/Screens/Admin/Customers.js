import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, where } from '../../firebase';
import { Link } from 'react-router-dom';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);

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
    };

    return (
        <div>
            <div className='header'>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/stock">Stock</Link>
                <Link to="/admin/customers">Customers</Link>
                <Link to="/admin/invoices">Invoices</Link>
            </div>
            <div className="center">
                <h2>Customers</h2>
                <input
                    type="text"
                    placeholder="Search by Phone or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="inputfield"
                />
                <hr />
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Phone</th>
                            <th>Edit</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id}>
                                <td>{customer.id}</td>
                                <td>{customer.phone}</td>
                                <td>
                                    <Link to={`/admin/edit-customer/${customer.id}`}>Edit</Link>
                                </td>
                                <td>
                                    <Link to={`/customer/${customer.id}`}>View Invoices</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {selectedCustomer && (
                    <div>
                        <h3>Invoices for Customer ID: {selectedCustomer}</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Total Amount</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => (
                                    <tr key={invoice.id}>
                                        <td>{invoice.id}</td>
                                        <td>₹{invoice.totalAmount}</td>
                                        <td>{new Date(invoice.createdAt.seconds * 1000).toLocaleDateString()}</td>
                                        <td>
                                            <Link to={`/invoice/${invoice.id}`}>View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customers;
