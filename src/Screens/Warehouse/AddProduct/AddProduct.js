import React, { useState, useEffect } from "react";
import { db, collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from "../../../firebase";
// import "../warehouse.css";
import CustomButtonSubmit from "../../../components/cssComponents/CustomButtonSubmit.jsx"

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

    // where we are using this
    const fetchProducts = async () => {
      if (productName) {
        const normalizedProductName = productName.toLowerCase().trim();
        const q = query(collection(db, "products"), where("normalized_name", "==", normalizedProductName));
        const querySnapshot = await getDocs(q);
        setExistingProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    // creditors name 
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


  const itemWrapper = 'flex flex-col gap-2 w-full'
  const itemName = 'text-xl ml-1'
  const itemInputField = 'border border-gray-950 h-12 px-2 py-2 w-full rounded-md'


  return (
    <div className="bg-gray-100 w-full flex justify-center items-center">
      <div className="p-6 w-full md:w-2/3 lg:w-1/2 text-gray-900 flex flex-col gap-6 items-center justify-start ">
        <h1 className="text-3xl w-full text-gray-800 font-semibold">Add Product</h1>
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-md shadow-md px-4 py-6 bg-white flex flex-col gap-8"
        >
          <div className={itemWrapper}>
            <p className={itemName}>Product Name:</p>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className={itemInputField}
              placeholder="Enter Product Name"
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
          <div className={itemWrapper}>
            <p className={itemName}>Quantity:</p>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              className={itemInputField}
              placeholder="Enter Quantity"
            />
          </div>
          <div className={itemWrapper}>
            <p className={itemName}>Price:</p>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              required
              className={itemInputField}
              placeholder="Enter Price"
            />
          </div>
          <div className={itemWrapper}>
            <p className={itemName}>Weight:</p>

            <div className="flex gap-2 w-full">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                required
                className={itemInputField}
                placeholder="Enter Weight"
              />
              <select
                className={itemInputField}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-center items-center">
            <label className={itemName}>Paid:</label>
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className="mt-1 h-5 w-5"
            />
          </div>

          {paid && (
            <div className={itemWrapper}>
              <p className={itemName}>Payment Mode:</p>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className={itemInputField}
              >
                {paymentModes.map(mode => (
                  <option
                    key={mode}
                    value={mode}
                  >{mode}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!paid && (
            <div className={itemWrapper}>
              <label className={itemName}>Creditor:</label>
              <select
                value={selectedCreditor}
                onChange={(e) => setSelectedCreditor(e.target.value)}
                className={itemInputField}
              >
                <option value="" disabled>Select a creditor</option>
                {creditors.map(creditor => (
                  <option
                    key={creditor.id}
                    value={creditor.id}>
                    {creditor.name}
                  </option>
                ))}
                <option
                  value="newCreditor">
                  Add New Creditor
                </option>
              </select>
              <div className="w-full">
                {selectedCreditor === "newCreditor" && (
                  <div className={itemWrapper}>
                    <label className={itemName}>Creditor name:</label>
                    <input
                      type="text"
                      value={creditorName}
                      onChange={(e) => setCreditorName(e.target.value)}
                      required
                      className={itemInputField}
                      placeholder="Enter creditor name"
                    />
                  </div>
                )}</div>
            </div>
          )}
          <CustomButtonSubmit>
            Save
          </CustomButtonSubmit>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
