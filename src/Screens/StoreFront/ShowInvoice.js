import React, { useEffect, useState } from 'react';
import { db, doc, getDoc } from '../../firebase';
import { useParams } from 'react-router-dom';

const ShowInvoice = ({ invoice: propInvoice }) => {
    const { invoiceId } = useParams();
    const [invoice, setInvoice] = useState(propInvoice || null);

    useEffect(() => {
        if (!propInvoice && invoiceId) {
            const fetchInvoice = async () => {
                const invoiceRef = doc(db, 'invoices', invoiceId);
                const invoiceSnap = await getDoc(invoiceRef);
                if (invoiceSnap.exists()) {
                    setInvoice({ id: invoiceSnap.id, ...invoiceSnap.data() });
                } else {
                    console.error("No such invoice!");
                }
            };

            fetchInvoice();
        }
    }, [invoiceId, propInvoice]);

    if (!invoice) {
        return <div>Loading...</div>;
    }

    const formatDate = (createdAt) => {
        if (createdAt instanceof Date) {
            return createdAt.toLocaleString();
        } else if (createdAt && createdAt.toDate) {
            return createdAt.toDate().toLocaleString();
        } else {
            return new Date(createdAt.seconds * 1000).toLocaleString(); // Fallback for Firestore Timestamp
        }
    };

    return (
        <div className='makebill'>
            <h2>Invoice</h2>
            {invoice.id && <p><strong>Invoice ID:</strong> {invoice.id}</p>}
            <p><strong>Customer Number:</strong> {invoice.customerName}</p>
            <p><strong>Customer Id:</strong> {invoice.customerId}</p>
            
            <h3>Products</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product id</th>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.products.map(product => (
                        <tr key={product.productId}>
                            <td>{product.productId}</td>

                            <td>{product.productName}</td>
                            <td>{product.quantity}</td>
                            <td>₹{product.price.toFixed(2)}</td>
                            <td>₹{(product.price * product.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

          

            <h4>Payment Status: {invoice.paymentStatus}</h4>
            <h4>Payment Due: ₹{invoice.dueAmount.toFixed(2)}</h4>
            <h4>Payment Method: {invoice.paymentMethod}</h4>
              {invoice.isGstApplied && (
                <>
                    <h3>GST Details</h3>
                    <p><strong>GST Number:</strong> {invoice.gstNumber}</p>
                    <p><strong>Total Amount:</strong> ₹{invoice.totalAmount.toFixed(2)}</p>

                    <p><strong>GST Amount:</strong> ₹{invoice.gstAmount.toFixed(2)}</p>
                </>
            )}
            <h3><strong>Final Amount (including GST):</strong> ₹{invoice.finalAmount.toFixed(2)}</h3>
            <p><strong>Date:</strong> {formatDate(invoice.createdAt)}</p>
            <div className="fl"><button>Print</button></div>
        </div>
    );
};

export default ShowInvoice;
