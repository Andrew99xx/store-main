import React, { useState } from 'react';
import { db, collection, addDoc } from '../../firebase';

const AddCustomer = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleAddCustomer = async () => {
        try {
            await addDoc(collection(db, 'customers'), {
                name,
                phone,
                email
            });
            setName('');
            setPhone('');
            setEmail('');
            alert('Customer added successfully');
        } catch (error) {
            console.error("Error adding customer: ", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-gray-50 min-h-screen p-4">
            <div className="bg-white shadow-md rounded-md w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add Customer</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Customer Name</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Phone</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={handleAddCustomer}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Add Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomer;
