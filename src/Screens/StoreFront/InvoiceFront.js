import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../firebase';
import { Link } from 'react-router-dom';

const InvoiceFront = () => {
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
        <div>
            <div>
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
                                    <th className="p-2 border text-left">Invoice ID</th>


                                    <th className="p-2 border text-left">Show Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorizedInvoices[category].map(invoice => {
                                   
                                    
                                    return (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="p-2 border">
                                                {invoice.id}
                                            </td>
                                            <td className="p-2 border">
                                                <Link to={`/invoice/${invoice.id}`} className="text-blue-600 hover:text-blue-800">Show Invoice</Link>
                                            </td>
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

export default InvoiceFront;
