import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, deleteDoc, getDoc } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';

const EditInvoice = () => {
    const { invoiceId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [dueAmount, setDueAmount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const invoiceDoc = await getDoc(doc(db, 'invoices', invoiceId));
                const invoiceData = invoiceDoc.data();
                setInvoice(invoiceData);
                setCustomerName(invoiceData.customerName);
                setTotalAmount(invoiceData.totalAmount);
                setDueAmount(invoiceData.dueAmount || 0);
            } catch (error) {
                console.error('Error fetching invoice: ', error);
            }
        };

        fetchInvoice();
    }, [invoiceId]);

    const handleUpdate = async () => {
        try {
            await updateDoc(doc(db, 'invoices', invoiceId), {
                customerName,
                totalAmount: parseFloat(totalAmount),
                dueAmount: parseFloat(dueAmount),
            });

            if (invoice.customerId) {
                const customerDoc = doc(db, 'customers', invoice.customerId);
                const customerData = (await getDoc(customerDoc)).data();

                const newPaymentAmounts = {
                    ...customerData.paymentAmounts,
                    upi_card: parseFloat(dueAmount) || 0,
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
        <div className="flex flex-col items-center justify-center bg-gray-50 min-h-screen p-4">
            <div className="bg-white shadow-md rounded-md w-full max-w-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Invoice</h1>
                <form className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Customer Name</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Bill Amount</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="number"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Due Amount</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="number"
                            value={dueAmount}
                            onChange={(e) => setDueAmount(e.target.value)}
                        />
                    </div>

                    <div className="flex space-x-4 mt-4">
                        <button
                            onClick={handleUpdate}
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
                        >
                            Update Invoice
                        </button>
                        <button
                            onClick={handleDelete}
                            type="button"
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full"
                        >
                            Delete Invoice
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : (
        <div className="flex justify-center items-center min-h-screen text-gray-700">Loading...</div>
    );
};

export default EditInvoice;
