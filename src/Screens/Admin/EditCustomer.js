// EditCustomer.js
import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, deleteDoc,getDoc } from '../../firebase';
import { useParams, useNavigate,Link } from 'react-router-dom';

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
        <div className='center'>

            <h1>Edit Customer</h1>

            <label> Customers Phone</label>
            <input className='inputfield' type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <br />
            <div className=""> <button onClick={handleUpdate} className="btn">Update Customer</button>
            <button onClick={handleDelete} className="btn">Delete Customer</button></div>
            <Link className="btn" to={"/admin/customers"}>Back</Link>

           
        </div>
    ) : (
        <div>Loading...</div>
    );
};

export default EditCustomer;
