import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where } from '../../firebase';
import { useParams, Link } from 'react-router-dom';

const CustomerInvoices = () => {
    const { customerId } = useParams();
    const [invoices, setInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    useEffect(() => {
        const fetchInvoices = async () => {
            const q = query(collection(db, 'invoices'), where('customerId', '==', customerId));
            const invoicesSnap = await getDocs(q);
            setInvoices(invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchInvoices();
    }, [customerId]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const filteredInvoices = invoices.filter(invoice => invoice.id.includes(searchQuery));

    const sortedInvoices = filteredInvoices.sort((a, b) => {
        if (sortOrder === "newest") {
            return b.createdAt.seconds - a.createdAt.seconds;
        } else {
            return a.createdAt.seconds - b.createdAt.seconds;
        }
    });

    return (
        <div>
            <div className="center">
                <h1>Invoices for Customer: {customerId}</h1>
                <div className="">
                    <input
                        type="text"
                        placeholder="Search by Invoice ID"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="inputfield"
                    />
                    <select value={sortOrder} onChange={handleSortChange}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
                <Link className="btn" to={"/admin/customers"}>Back</Link>
            </div>
            {sortedInvoices.map(invoice => {
                const totalAmount = invoice.totalAmount || 0;
                const gstAmount = invoice.gstAmount || 0;
                const dueAmount = invoice.dueAmount || 0;
                const totalAmountWithGst = (totalAmount + gstAmount).toFixed(2);

                return (
                    <div key={invoice.id} className="pd2">
                        <h3>Invoice ID: {invoice.id}</h3>
                        <p><strong>Total Amount:</strong> ₹{totalAmountWithGst}</p>
                        <p><strong>Total Amount Due:</strong> ₹{dueAmount.toFixed(2)}</p>
                        <p><strong>Payment Method:</strong> {invoice.paymentMethod}</p>
                        <p><strong>Date:</strong> {new Date(invoice.createdAt.seconds * 1000).toLocaleString()}</p>

                        {gstAmount > 0 && (
                            <>
                                <h4>GST Details</h4>
                                <p><strong>GST Amount:</strong> ₹{gstAmount.toFixed(2)}</p>
                            </>
                        )}

                        <h4>Products</h4>
                        <ol>
                            {invoice.products.map(product => (
                                <div key={product.productId}>
                                    <li>Product Name: {product.productName}</li>
                                    <p>Quantity: {product.quantity}</p>
                                    <p>Price: ₹{product.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </ol>
                        <hr />
                    </div>
                );
            })}
        </div>
    );
};

export default CustomerInvoices;
