import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, deleteDoc, getDoc } from '../../firebase';
import { useParams, useNavigate, Link } from 'react-router-dom';

const EditCustomer = () => {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomer = async () => {
            const customerDoc = await getDoc(doc(db, 'customers', customerId));
            const customerData = customerDoc.data();
            setCustomer(customerData);
            setName(customerData.name);
            setPhone(customerData.phone);
            setEmail(customerData.email);
        };

        fetchCustomer();
    }, [customerId]);

    const handleUpdate = async () => {
        try {
            await updateDoc(doc(db, 'customers', customerId), {
                name,
                phone,
                email,
            });
            alert('Customer updated successfully');
            navigate('/admin/customers');
        } catch (error) {
            console.error('Error updating customer: ', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'customers', customerId));
            alert('Customer deleted successfully');
            navigate('/admin/customers');
        } catch (error) {
            console.error('Error deleting customer: ', error);
        }
    };

    return customer ? (
        <div className="flex flex-col items-center justify-center bg-gray-50 min-h-screen p-4">
            <div className="bg-white shadow-md rounded-md w-full max-w-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Customer</h1>
                <form className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Customer's Name</label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Customer's Phone</label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            type="text" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Customer's Email</label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    <div className="flex space-x-4 mt-4">
                        <button 
                            onClick={handleUpdate} 
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
                        >
                            Update Customer
                        </button>
                        <button 
                            onClick={handleDelete} 
                            type="button"
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full"
                        >
                            Delete Customer
                        </button>
                    </div>
                </form>

                <Link 
                    to="/admin/customers" 
                    className="mt-6 inline-block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center w-full"
                >
                    Back
                </Link>
            </div>
        </div>
    ) : (
        <div className="flex justify-center items-center min-h-screen text-gray-700">Loading...</div>
    );
};

export default EditCustomer;
