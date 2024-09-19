import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../firebase';
import { Link } from 'react-router-dom';

const CustomerAll = () => {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            const customersSnap = await getDocs(collection(db, 'customers'));
            const customersData = customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCustomers(customersData);
            setFilteredCustomers(customersData);
            // Initialize filteredCustomers with all customers
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


    return (
        <div>
            <div className="mt-6">
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
                            <th className="p-2 border text-left">Customer ID</th>
                            <th className="p-2 border text-left">Customer Name</th>
                            <th className="p-2 border text-left">Customer Phone</th>
                            <th className="p-2 border text-left">Customer invoices</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="p-2 border">{customer.id || 'N/A'}</td>
                                <td className="p-2 border">{customer.name || 'N/A'}</td>
                                <td className="p-2 border">{customer.phone || 'N/A'}</td>
                                <td className="p-2 border">
                                    <Link
                                        to={`customer/${customer.id}`}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Customer Invoices
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerAll;
