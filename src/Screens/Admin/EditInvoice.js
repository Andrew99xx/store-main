// EditInvoice.js
import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, deleteDoc, getDoc } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';

const EditInvoice = () => {
    const { invoiceId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [dueAmount, setDueAmount] = useState(0); // New state for due amount
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const invoiceDoc = await getDoc(doc(db, 'invoices', invoiceId));
                const invoiceData = invoiceDoc.data();
                setInvoice(invoiceData);
                setCustomerName(invoiceData.customerName);
                setTotalAmount(invoiceData.totalAmount);
                setDueAmount(invoiceData.dueAmount || 0); // Set due amount, default to 0 if not set
            } catch (error) {
                console.error('Error fetching invoice: ', error);
            }
        };

        fetchInvoice();
    }, [invoiceId]);

    const handleUpdate = async () => {
        try {
            // Update the invoice
            await updateDoc(doc(db, 'invoices', invoiceId), {
                customerName,
                totalAmount: parseFloat(totalAmount),
                dueAmount: parseFloat(dueAmount), // Update due amount
            });

            // If invoice is associated with a customer, update the customer's due amount
            if (invoice.customerId) {
                const customerDoc = doc(db, 'customers', invoice.customerId);
                const customerData = (await getDoc(customerDoc)).data();

                // Update customer's due amount in paymentAmounts map
                const newPaymentAmounts = {
                    ...customerData.paymentAmounts,
                    upi_card: parseFloat(dueAmount) || 0, // Update upi_card payment amount
                };

                await updateDoc(customerDoc, {
                    dueAmount: parseFloat(dueAmount) || 0,
                    paymentAmounts: newPaymentAmounts,
                });
            }

            alert('Invoice updated successfully');
            navigate('/admin/invoices');
        } catch (error) {
            console.error('Error updating invoice: ', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'invoices', invoiceId));
            alert('Invoice deleted successfully');
            navigate('/admin/invoices');
        } catch (error) {
            console.error('Error deleting invoice: ', error);
        }
    };

    return invoice ? (
        <div className='center'>
            <h2>Edit Invoice</h2>
            <h2>ID - {invoiceId}</h2>
            <p>Customer Number</p>
            <input type="text" className='inputfield' value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <p>Bill Amount</p>
            <input type="number" className='inputfield' value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
            <p>Due amount</p>
            <input type="number" className='inputfield' value={dueAmount} onChange={(e) => setDueAmount(e.target.value)} />
            <br />
            <div className="">
            <button onClick={handleUpdate} className="btn">Update Invoice</button>
            <button onClick={handleDelete} className="btn">Delete Invoice</button></div>
        </div>
    ) : (
        <div>Loading...</div>
    );
};

export default EditInvoice;
