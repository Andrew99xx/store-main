import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../firebase';
import { Link } from 'react-router-dom';

const Stock = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const productsSnap = await getDocs(collection(db, 'products'));
            const productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
            setFilteredProducts(productsData); // Initialize filteredProducts with all products
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const lowercasedFilter = searchQuery.toLowerCase();
        const filteredData = products.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter) || item.id.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredProducts(filteredData);
    }, [searchQuery, products]);

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="flex justify-center items-center space-x-4 bg-white p-4 shadow-md rounded-md">
                <Link to="/admin" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
                <Link to="/admin/stock" className="text-blue-600 hover:text-blue-800">Stock</Link>
                <Link to="/admin/customers" className="text-blue-600 hover:text-blue-800">Customers</Link>
                <Link to="/admin/invoices" className="text-blue-600 hover:text-blue-800">Invoices</Link>
            </div>

            <div className="mt-6 bg-white p-6 rounded-md shadow-md">
                <h2 className="text-xl font-bold text-gray-800">Stock</h2>
                <input
                    type="text"
                    placeholder="Search by ID or Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <hr className="my-4" />

                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border text-left">ID</th>
                            <th className="p-2 border text-left">Name</th>
                            <th className="p-2 border text-left">Weight + Unit</th>
                            <th className="p-2 border text-left">Price</th>
                            <th className="p-2 border text-left">Quantity</th>
                            <th className="p-2 border text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="p-2 border">{product.id}</td>
                                <td className="p-2 border">{product.name}</td>
                                <td className="p-2 border">{product.weight} {product.unit}</td>
                                <td className="p-2 border">₹{product.price}</td>
                                <td className="p-2 border">{product.quantity}</td>
                                <td className="p-2 border">
                                    <Link to={`/admin/edit-product/${product.id}`} className="text-blue-600 hover:text-blue-800">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Stock;
