import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, deleteDoc, getDoc } from '../../firebase';
import { useParams, useNavigate, Link } from 'react-router-dom';

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
        <div className="flex flex-col items-center justify-center bg-gray-50 min-h-screen p-4">
            <div className="bg-white shadow-md rounded-md w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Product</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Product Name</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Price</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Quantity</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Unit</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Weight</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>

                    <div className="flex space-x-4 mt-4">
                        <button
                            onClick={handleUpdate}
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
                        >
                            Update Product
                        </button>
                        <button
                            onClick={handleDelete}
                            type="button"
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full"
                        >
                            Delete Product
                        </button>
                    </div>


                </form>

                <Link
                    to="/admin/stock"
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

export default EditProduct;
