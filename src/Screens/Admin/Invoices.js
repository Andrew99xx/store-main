import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../firebase';
import { Link } from 'react-router-dom';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    useEffect(() => {
        const fetchInvoices = async () => {
            const invoicesSnap = await getDocs(collection(db, 'invoices'));
            const invoicesData = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInvoices(invoicesData);
        };
        fetchInvoices();
    }, []);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.id.includes(searchQuery)
    );

    const sortedInvoices = filteredInvoices.sort((a, b) => {
        if (sortOrder === "newest") {
            return b.createdAt.seconds - a.createdAt.seconds;
        } else if (sortOrder === "oldest") {
            return a.createdAt.seconds - b.createdAt.seconds;
        } else if (sortOrder === "due") {
            return b.dueAmount - a.dueAmount;
        }
        return 0;
    });

    const categorizeInvoices = (invoices) => {
        const categorized = {};

        invoices.forEach(invoice => {
            const invoiceDate = new Date(invoice.createdAt.seconds * 1000);
            const invoiceDateIST = new Date(invoiceDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const currentDate = new Date();
            const currentDateIST = new Date(currentDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const diffInDays = Math.floor((currentDateIST - invoiceDateIST) / (1000 * 60 * 60 * 24));

            let category;
            if (diffInDays === 0) {
                category = 'Today';
            } else if (diffInDays === 1) {
                category = 'Yesterday';
            } else {
                category = invoiceDateIST.toLocaleDateString();
            }

            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(invoice);
        });
        return categorized;
    };

    const categorizedInvoices = categorizeInvoices(sortedInvoices);

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="flex justify-center items-center space-x-4 bg-white p-4 shadow-md rounded-md">
                <Link to="/admin" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
                <Link to="/admin/stock" className="text-blue-600 hover:text-blue-800">Stock</Link>
                <Link to="/admin/customers" className="text-blue-600 hover:text-blue-800">Customers</Link>
                <Link to="/admin/invoices" className="text-blue-600 hover:text-blue-800">Invoices</Link>
            </div>
            <div className="mt-6 bg-white p-6 rounded-md shadow-md">
                <h2 className="text-xl font-bold text-gray-800">Invoices</h2>
                <div className="flex space-x-4 mt-4">
                    <input
                        type="text"
                        placeholder="Search by Invoice ID"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={sortOrder}
                        onChange={handleSortChange}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="due">Due Amount</option>
                    </select>
                </div>
                {Object.keys(categorizedInvoices).map(category => (
                    <div key={category} className="mt-6">
                        <h3 className="text-lg font-bold text-gray-700">{category}</h3>
                        <table className="w-full table-auto border-collapse mt-4">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border text-left">ID</th>
                                    <th className="p-2 border text-left">Total Amount</th>
                                    <th className="p-2 border text-left">GST Amount</th>
                                    <th className="p-2 border text-left">GST Billing</th>
                                    <th className="p-2 border text-left">Actions</th>
                                    <th className="p-2 border text-left">Due Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorizedInvoices[category].map(invoice => {
                                    const totalAmount = invoice.totalAmount || 0;
                                    const gstAmount = invoice.gstAmount || 0;
                                    const dueAmount = invoice.dueAmount || 0;
                                    const totalAmountWithGst = (totalAmount + gstAmount).toFixed(2);
                                    
                                    return (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="p-2 border">
                                                <Link to={`/invoice/${invoice.id}`} className="text-blue-600 hover:text-blue-800">{invoice.id}</Link>
                                            </td>
                                            <td className="p-2 border">₹{totalAmountWithGst}</td>
                                            <td className="p-2 border">₹{gstAmount.toFixed(2)}</td>
                                            <td className="p-2 border">{gstAmount ? 'Yes' : 'No'}</td>
                                            <td className="p-2 border">
                                                <Link to={`/admin/edit-invoice/${invoice.id}`} className="text-blue-600 hover:text-blue-800">Edit</Link>
                                            </td>
                                            <td className="p-2 border">₹{dueAmount.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Invoices;
