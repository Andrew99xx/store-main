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
        <div >
            <div className='header'>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/stock">Stock</Link>
                <Link to="/admin/customers">Customers</Link>
                <Link to="/admin/invoices">Invoices</Link>
            </div>
           <div className="center"> <h2>Stock</h2>
            <input
                type="text"
                placeholder="Search by ID or Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="inputfield"
            />
            <hr />

           
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Weight + Unit</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.weight} {product.unit}</td>
                            <td>₹{product.price}</td>
                            <td>{product.quantity}</td>
                            <td>
                                <Link to={`/admin/edit-product/${product.id}`}>Edit</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> </div>
        </div>
    );
};

export default Stock;
