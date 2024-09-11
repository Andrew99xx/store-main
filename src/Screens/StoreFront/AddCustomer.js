// AddCustomer.js
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
        <div>
            <h2>Add Customer</h2>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={handleAddCustomer}>Add Customer</button>
        </div>
    );
};

export default AddCustomer;
