// CustomerDetails.js
import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where ,doc,getDoc} from '../../firebase';
import { useParams } from 'react-router-dom';

const CustomerDetail = () => {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const fetchCustomerData = async () => {
            const customerDoc = await getDoc(doc(db, 'customers', customerId));
            setCustomer(customerDoc.data());
        };

        const fetchCustomerInvoices = async () => {
            const q = query(collection(db, 'invoices'), where('customerId', '==', customerId));
            const invoicesSnap = await getDocs(q);
            const invoicesData = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInvoices(invoicesData);
        };

        fetchCustomerData();
        fetchCustomerInvoices();
    }, [customerId]);

    return (
        <div>
            <h2>Customer Details</h2>
            {customer && (
                <div>
                    <p>Phone: {customer.phone}</p>
                </div>
            )}
            <h3>Invoices</h3>
            {invoices.map(invoice => (
                <div key={invoice.id}>
                    <p>Invoice ID: {invoice.id}</p>
                    <p>Total Amount: ₹{invoice.totalAmount}</p>
                    <p>Date: {invoice.createdAt.toDate().toDateString()}</p>
                </div>
            ))}
        </div>
    );
};

export default CustomerDetail;
