// EditProduct.js
import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, deleteDoc,getDoc } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';

const EditProduct = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [weight, setWeight] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            const productDoc = await getDoc(doc(db, 'products', productId));
            const productData = productDoc.data();
            setProduct(productData);
            setName(productData.name);
            setPrice(productData.price);
            setQuantity(productData.quantity);
            setUnit(productData.unit);
            setWeight(productData.weight);
        };

        fetchProduct();
    }, [productId]);

    const handleUpdate = async () => {
        try {
            await updateDoc(doc(db, 'products', productId), {
                name,
                price: parseFloat(price),
                quantity: parseInt(quantity, 10),
                unit,
                weight: parseFloat(weight),
            });
            alert('Product updated successfully');
            navigate('/admin/stock');
        } catch (error) {
            console.error('Error updating product: ', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'products', productId));
            alert('Product deleted successfully');
            navigate('/admin/stock');
        } catch (error) {
            console.error('Error deleting product: ', error);
        }
    };

    return product ? (
        <div>
            <h2>Edit Product</h2>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} />
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <button onClick={handleUpdate}>Update Product</button>
            <button onClick={handleDelete}>Delete Product</button>
        </div>
    ) : (
        <div>Loading...</div>
    );
};

export default EditProduct;
