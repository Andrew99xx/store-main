import React, { useEffect, useState } from 'react';
import { db, doc, getDoc } from '../../firebase';
import { useParams } from 'react-router-dom';

const ShowInvoice = ({ invoice: propInvoice }) => {
    const { invoiceId } = useParams();
    const [invoice, setInvoice] = useState(propInvoice || null);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!propInvoice && invoiceId) {
                const invoiceRef = doc(db, 'invoices', invoiceId);
                const invoiceSnap = await getDoc(invoiceRef);
                if (invoiceSnap.exists()) {
                    setInvoice({ id: invoiceSnap.id, ...invoiceSnap.data() });
                } else {
                    console.error("No such invoice!");
                }
            }
        };

        fetchInvoice();
    }, [invoiceId, propInvoice]);

    if (!invoice) {
        return <div className="text-center text-lg">Loading...</div>;
    }

    const formatDate = (createdAt) => {
        if (createdAt instanceof Date) {
            return createdAt.toLocaleString();
        } else if (createdAt && createdAt.toDate) {
            return createdAt.toDate().toLocaleString();
        } else if (createdAt && createdAt.seconds) {
            return new Date(createdAt.seconds * 1000).toLocaleString();
        }
        return 'NA'; // Fallback if no valid date
    };

    const safeToFixed = (value, decimals = 2) => {
        return typeof value === 'number' ? value.toFixed(decimals) : 'NA';
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Invoice</h2>
            {invoice.id && <p><strong className="font-semibold">Invoice ID:</strong> {invoice.id}</p>}
            <p><strong className="font-semibold">Customer Number:</strong> {invoice.customerName || 'NA'}</p>
            <p><strong className="font-semibold">Customer ID:</strong> {invoice.customerId || 'NA'}</p>

            <h3 className="text-xl font-semibold mt-6 mb-2">Products</h3>
            <table className="min-w-full bg-gray-100 border border-gray-300 rounded-md">
                <thead>
                    <tr className="bg-gray-200 border-b">
                        <th className="px-4 py-2 text-left">Product ID</th>
                        <th className="px-4 py-2 text-left">Product Name</th>
                        <th className="px-4 py-2 text-left">Quantity</th>
                        <th className="px-4 py-2 text-left">Price</th>
                        <th className="px-4 py-2 text-left">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.products && invoice.products.length > 0 ? (
                        invoice.products.map(product => (
                            <tr key={product.productId} className="border-b">
                                <td className="px-4 py-2">{product.productId || 'NA'}</td>
                                <td className="px-4 py-2">{product.productName || 'NA'}</td>
                                <td className="px-4 py-2">{product.quantity || 'NA'}</td>
                                <td className="px-4 py-2">₹{safeToFixed(product.price)}</td>
                                <td className="px-4 py-2">₹{safeToFixed(product.price * (product.quantity || 1))}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-4 py-2 text-center">No products found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="mt-6">
                <h4 className="text-lg font-semibold">Payment Status: {invoice.paymentStatus || 'NA'}</h4>
                <h4 className="text-lg font-semibold">Payment Due: ₹{safeToFixed(invoice.dueAmount)}</h4>
                <h4 className="text-lg font-semibold">Payment Method: {invoice.paymentMethod || 'NA'}</h4>
                {invoice.isGstApplied && (
                    <>
                        <h3 className="text-xl font-semibold mt-6 mb-2">GST Details</h3>
                        <p><strong className="font-semibold">GST Number:</strong> {invoice.gstNumber || 'NA'}</p>
                        <p><strong className="font-semibold">Total Amount:</strong> ₹{safeToFixed(invoice.totalAmount)}</p>
                        <p><strong className="font-semibold">GST Amount:</strong> ₹{safeToFixed(invoice.gstAmount)}</p>
                    </>
                )}

                <div className='bg-gray-200 my-4 flex flex-col gap-2 py-3 px-2 border '>
                    <h3 className="text-xl font-semibold ">Final Amount (including GST): ₹{safeToFixed(invoice.finalAmount)}</h3>
                    <h3 className="text-xl font-semibold">Paid Amount: ₹{safeToFixed(invoice.amountPaid)}</h3>
                    <h3 className="text-xl font-semibold">Final Amount (including GST): ₹{safeToFixed(invoice.dueAmount)}</h3>
                </div>
                <p><strong className="font-semibold">Date:</strong> {formatDate(invoice.createdAt)}</p>
            </div>
            <div className="mt-6 text-center">
                <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600">Print</button>
            </div>
        </div>
    );
};

export default ShowInvoice;
