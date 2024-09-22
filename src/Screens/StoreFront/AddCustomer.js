import React, { useState } from 'react';
import {
    db, collection, addDoc, query, getDocs, where
} from '../../firebase';

const AddCustomer = () => {
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        const { name, phone, email } = customerData;

        if (!name || !phone || !email) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // check if phone number already exists with any other user
            const q = query(collection(db, 'customers'), where('phone', '==', phone));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert('This phone number already exists with other users.');
                return;
            }
            await addDoc(collection(db, 'customers'), { name, phone, email });
            setCustomerData({ name: '', phone: '', email: '' });
            alert('Customer added successfully');
        } catch (error) {
            alert("Error adding customer: " + error.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="w-full p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add Customer</h2>
                <form className="space-y-4" onSubmit={handleAddCustomer}>
                    <div>
                        <label className="block text-gray-700 mb-1">Customer Name</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Name"
                            name="name"
                            value={customerData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Phone</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Phone"
                            name="phone"
                            value={customerData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={customerData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="flex justify-center mt-4">
                        <button
                            type="submit"
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
