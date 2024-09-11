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

            // Convert to IST timezone
            const invoiceDateIST = new Date(invoiceDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const currentDate = new Date();
            const currentDateIST = new Date(currentDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

            // Determine the difference in days
            const diffInDays = Math.floor((currentDateIST - invoiceDateIST) / (1000 * 60 * 60 * 24));

            let category;
            if (diffInDays === 0) {
                category = 'Today';
            } else if (diffInDays === 1) {
                category = 'Yesterday';
            } else {
                category = invoiceDateIST.toLocaleDateString(); // Use date as category
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
            <div className='header'>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/stock">Stock</Link>
                <Link to="/admin/customers">Customers</Link>
                <Link to="/admin/invoices">Invoices</Link>
            </div>

            <div className="center">
                <h2>Invoices</h2>

                <div className="">
                    <input
                        type="text"
                        placeholder="Search by Invoice ID"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="inputfield"
                    />
                    <select value={sortOrder} onChange={handleSortChange} className="">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="due">Due Amount</option>
                    </select>
                </div>

                {Object.keys(categorizedInvoices).map(category => (
                    <div key={category}>
                        <h3>{category}</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Total Amount</th>
                                    <th>GST Amount</th>
                                    <th>GST Billing</th>
                                    <th>Actions</th>
                                    <th>Due Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorizedInvoices[category].map(invoice => {
                                    const totalAmount = invoice.totalAmount || 0;
                                    const gstAmount = invoice.gstAmount || 0;
                                    const dueAmount = invoice.dueAmount || 0;
                                    const totalAmountWithGst = (totalAmount + gstAmount).toFixed(2);
                                    
                                    return (
                                        <tr key={invoice.id}>
                                            <td><Link to={`/invoice/${invoice.id}`}>{invoice.id}</Link></td>
                                            <td>₹{totalAmountWithGst}</td>
                                            <td>₹{gstAmount.toFixed(2)}</td>
                                            <td>{gstAmount ? 'Yes' : 'No'}</td>
                                            <td>
                                                <Link to={`/admin/edit-invoice/${invoice.id}`}>Edit</Link>
                                            </td>
                                            <td>₹{dueAmount.toFixed(2)}</td>
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