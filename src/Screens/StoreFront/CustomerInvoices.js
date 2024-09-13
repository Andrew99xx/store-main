import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where } from '../../firebase';
import { useParams, Link } from 'react-router-dom';

const CustomerInvoices = () => {
    const { customerId } = useParams();
    const [invoices, setInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [loading, setLoading] = useState(true); // For handling loading state
    const [error, setError] = useState(null); // For handling errors

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                if (!customerId) {
                    throw new Error("Customer ID is undefined");
                }

                const q = query(collection(db, 'invoices'), where('customerId', '==', customerId));
                const invoicesSnap = await getDocs(q);
                
                const invoicesData = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setInvoices(invoicesData);
                setLoading(false); // Stop loading when data is fetched
            } catch (error) {
                console.error("Error fetching invoices:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        if (customerId) {
            fetchInvoices();
        }
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

    if (loading) {
        return <div className="text-center mt-4">Loading invoices...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-4">Error: {error}</div>;
    }

    return (
        <div className="flex flex-col items-center bg-gray-50 min-h-screen p-4">
            <div className="bg-white shadow-md rounded-md w-full max-w-4xl p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Invoices for Customer: {customerId}
                </h1>
                <div className="flex space-x-4 mb-4">
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
                    </select>
                </div>

                <Link
                    to="/admin/customers"
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 mb-6 inline-block"
                >
                    Back
                </Link>

                {sortedInvoices.length > 0 ? (
                    sortedInvoices.map(invoice => {
                        const totalAmount = invoice.totalAmount || 0;
                        const gstAmount = invoice.gstAmount || 0;
                        const dueAmount = invoice.dueAmount || 0;
                        const totalAmountWithGst = (totalAmount + gstAmount).toFixed(2);

                        return (
                            <div key={invoice.id} className="mb-8 p-4 border border-gray-200 rounded-md shadow-sm bg-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Invoice ID: {invoice.id}
                                </h3>
                                <p className="text-gray-700"><strong>Total Amount:</strong> ₹{totalAmountWithGst}</p>
                                <p className="text-gray-700"><strong>Total Amount Due:</strong> ₹{dueAmount.toFixed(2)}</p>
                                <p className="text-gray-700"><strong>Payment Method:</strong> {invoice.paymentMethod}</p>
                                <p className="text-gray-700"><strong>Date:</strong> {new Date(invoice.createdAt.seconds * 1000).toLocaleString()}</p>

                                {gstAmount > 0 && (
                                    <>
                                        <h4 className="text-gray-700 mt-4">GST Details</h4>
                                        <p className="text-gray-700"><strong>GST Amount:</strong> ₹{gstAmount.toFixed(2)}</p>
                                    </>
                                )}

                                <h4 className="text-gray-700 mt-4">Products</h4>
                                <ol className="list-decimal list-inside">
                                    {invoice.products.map(product => (
                                        <li key={product.productId} className="mt-2">
                                            <div className="text-gray-700">
                                                <p><strong>Product Name:</strong> {product.productName}</p>
                                                <p><strong>Quantity:</strong> {product.quantity}</p>
                                                <p><strong>Price:</strong> ₹{product.price.toFixed(2)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                                <hr className="mt-4" />
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center mt-4 text-gray-500">No invoices found for this customer.</div>
                )}
            </div>
        </div>
    );
};

export default CustomerInvoices;
