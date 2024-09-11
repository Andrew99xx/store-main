import React, { useState, useEffect } from "react";
import { db, collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from "../../../firebase";
import "../warehouse.css";

const units = ["kg", "gram", "liter", "milliliter"];
const paymentModes = ["online", "cash"];

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState(units[0]);
  const [paid, setPaid] = useState(false);
  const [paymentMode, setPaymentMode] = useState(paymentModes[0]);
  const [creditorName, setCreditorName] = useState("");
  const [existingProducts, setExistingProducts] = useState([]);
  const [creditors, setCreditors] = useState([]);
  const [selectedCreditor, setSelectedCreditor] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      if (productName) {
        const normalizedProductName = productName.toLowerCase().trim();
        const q = query(collection(db, "products"), where("normalized_name", "==", normalizedProductName));
        const querySnapshot = await getDocs(q);
        setExistingProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    const fetchCreditors = async () => {
      try {
        const creditorsRef = collection(db, "creditors");
        const snapshot = await getDocs(creditorsRef);
        const creditorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCreditors(creditorsData);
      } catch (error) {
        console.error("Error fetching creditors:", error);
      }
    };

    fetchProducts();
    fetchCreditors();
  }, [productName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let productUpdated = false;

      console.log("Existing products:", existingProducts);

      for (let product of existingProducts) {
        console.log(`Checking product: ${product.name} @ ${product.price}`);
        if (product.price === price && product.weight === weight && product.unit === unit) {
          const productRef = doc(db, "products", product.id);
          console.log(`Updating product ID: ${product.id}`);
          await updateDoc(productRef, {
            quantity: product.quantity + quantity,
            paid,
            paymentMode,
            creditorId: paid ? null : selectedCreditor,
          });
          productUpdated = true;
          break;
        }
      }

      if (!productUpdated) {
        console.log("Adding new product");
        const productData = {
          name: productName,
          normalized_name: productName.toLowerCase().trim(),
          quantity: quantity,
          price: price,
          weight: weight,
          unit: unit,
          paid,
          paymentMode,
          creditorId: paid ? null : selectedCreditor,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "products"), productData);
      }

      if (!paid) {
        console.log("Adding creditor information");
        let selectedCreditorId = null;

        // Check if a creditor was selected from the dropdown
        if (selectedCreditor) {
          selectedCreditorId = selectedCreditor;
        } else {
          // Add a new creditor
          const newCreditorRef = await addDoc(collection(db, "creditors"), {
            name: creditorName,
            createdAt: serverTimestamp(),
          });
          selectedCreditorId = newCreditorRef.id;
        }

        // Add creditor data to the product
        await addDoc(collection(db, "creditors"), {
          creditorId: selectedCreditorId,
          product: productName,
          quantity: quantity,
          price: price,
          totalAmount: quantity * price,
          createdAt: serverTimestamp(),
        });
      }

      setProductName("");
      setQuantity("");
      setPrice("");
      setWeight("");
      setUnit(units[0]);
      setPaid(false);
      setPaymentMode(paymentModes[0]);
      setCreditorName("");
      setExistingProducts([]);
      setSelectedCreditor("");

      alert("Product saved successfully!");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    }
  };

  return (
    <div className="addproduct">
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit}>
        <div className="products">
          <p>Product Name:</p>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="inputfield"
            placeholder="Product Name"
          />
          {existingProducts.length > 0 && (
            <div>
              <p>Existing products:</p>
              <ul>
                {existingProducts.map(product => (
                  <li key={product.id}>
                    {product.name} - {product.quantity} units @ ₹ {product.price} each, {product.weight} {product.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <p>Quantity:</p>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            required
            className="inputfield"
            placeholder="Enter Quantity"
          />
        </div>
        <div>
          <p>Price:</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            required
            className="inputfield"
            placeholder="Enter Price"
          />
        </div>
        <div>
          <p>Weight:</p>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            required
            className="inputfield"
            placeholder="Weigth"
          />
          <select className="inputunit" value={unit} onChange={(e) => setUnit(e.target.value)} required>
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
        <div className="paidstatus">
          <label>Paid:</label>
          <input
            type="checkbox"
            checked={paid}
            onChange={(e) => setPaid(e.target.checked)}
            className="paid"
          />
        </div>
        {paid && (
          <div>
            <p>Payment Mode:</p>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="inputfield"
            >
              {paymentModes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
        )}
        {!paid && (
          <div>
            <label>Creditor:</label>
            <select
              value={selectedCreditor}
              onChange={(e) => setSelectedCreditor(e.target.value)}
              className="inputfield"
            >
              <option value="">Select a creditor</option>
              {creditors.map(creditor => (
                <option key={creditor.id} value={creditor.id}>{creditor.name}</option>
              ))}
             
                <option value="newCreditor">Add New Creditor</option>
                </select>
                <div> 
                  {selectedCreditor === "newCreditor" && (
           <> <label>Enter name:</label>
            
                 
                  <input
                    type="text"
                    value={creditorName}
                    onChange={(e) => setCreditorName(e.target.value)}
                    required
                    className="inputfield"
                    placeholder="Enter creditor name"
                  /></>
                )}</div>
              </div>
            )}
            <button type="submit" className="btn">Save</button>
          </form>
        </div>
      );
    };
    
    export default AddProduct;
    