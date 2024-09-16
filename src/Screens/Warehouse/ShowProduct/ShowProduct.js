import React, { useState, useEffect } from "react";
import { db, collection, getDocs, doc, updateDoc } from "../../../firebase";
import CustomButton from "../../../components/cssComponents/CustomButton.jsx";
import CustomButtonSubmit from "../../../components/cssComponents/CustomButtonSubmit.jsx";

const units = ["kg", "gram", "liter", "milliliter"];

const ShowProducts = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState(units[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    };
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditProduct(product);
    setQuantity(product.quantity);
    setPrice(product.price);
    setWeight(product.weight);
    setUnit(product.unit);
    setShowModal(true); // Open the modal
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setShowModal(false);
    try {
      const productRef = doc(db, "products", editProduct.id);
      await updateDoc(productRef, {
        quantity,
        price,
        weight,
        unit,
      });
      // Close the modal
      const updatedProducts = products.map(product =>
        product.id === editProduct.id
          ? { ...product, quantity, price, weight, unit }
          : product
      );
      setProducts(updatedProducts);
      setEditProduct(null); // Clear selected product
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex justify-center items-center">
      <div className="flex w-full  flex-col gap-4 p-6">
        <h1 className="text-3xl font-semibold text-gray-800">All Products</h1>
        <input
          type="text"
          placeholder="Search products by name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {filteredProducts.length > 0 ? (
          <div className="w-full flex flex-col gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="w-full flex flex-row items-center justify-between gap-6 px-6 py-3 bg-white shadow-md rounded-md"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <p>Name : {product.name}</p>
                  <p>Quantity : {product.quantity} units</p>
                  <p>Price : @ ₹{product.price} each</p>
                  <p>Weight : {product.weight} {product.unit} each</p>
                </div>
                <div className="flex-1">

                  <CustomButton
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </CustomButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No products found</p>
        )}

        {/* Modal for editing product */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Product</h2>
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Quantity:</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Price:</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Weight:</label>

                  <div className="flex gap-2 justify-center items-center">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <CustomButtonSubmit
                  >
                    Update
                  </CustomButtonSubmit>
                  <CustomButton
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </CustomButton>
                 
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowProducts;
