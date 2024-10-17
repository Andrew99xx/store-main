import React, { useState, useEffect } from "react";
import { db, collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from "../../../firebase";
import CustomButtonSubmit from "../../../components/cssComponents/CustomButtonSubmit.jsx"

const units = ["kg", "gram", "liter", "milliliter"];
const paymentModes = ["online", "cash"];

const parentUnits = ["container", "box", "sack", "can", "sache", "pieces", "kg", "gram", "liter", "milliliter"];

const unitHierarchy = {
  container: ["box", "sack", "can", "sache", "pieces", "kg", "gram", "liter", "milliliter"],
  box: ["can", "sache", "pieces", "kg", "gram", "liter", "milliliter"],
  sack: ["can", "sache", "pieces", "kg", "gram", "liter", "milliliter"],
  can: [],
  pieces: [],
  sache: [],
  kg: [],
  gram: [],
  liter: [],
  milliliter: []
};

const AddProduct = () => {
  const [primaryUnit, setPrimaryUnit] = useState("");

  // all selected units 
  const [selectedUnits, setSelectedUnits] = useState({});


  const [quantities, setQuantities] = useState({});


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
  const [selectedCreditorId, setSelectedCreditorId] = useState("");

  const handleSelect = (unit, parent) => {
    setSelectedUnits((prevSelectedUnits) => ({
      ...prevSelectedUnits,
      [parent]: unit,
    }));


  };

  console.log("quantities")
  console.log(quantities)


  useEffect(() => {
    // where we are using this
    const fetchProducts = async () => {
      if (productName) {
        const normalizedProductName = productName.toLowerCase().trim();
        const q = query(collection(db, "products"), where("normalized_name", "==", normalizedProductName));
        const querySnapshot = await getDocs(q);
        // type is array
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
      let creditorIdToUse = selectedCreditorId;

      if (!paid) {
        alert("Adding creditor information");
        // Check if a creditor was selected from the dropdown
        if (creditorIdToUse === "newCreditor" && creditorName.trim()) {
          // Add a new creditor to the database
          const newCreditorRef = await addDoc(collection(db, "creditors"), {
            name: creditorName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            creditorId: ""
          });
          // Update the creditorId and state
          creditorIdToUse = newCreditorRef.id;
          await updateDoc(newCreditorRef, { creditorId: newCreditorRef.id });

          // this process is aynchronous
          setSelectedCreditorId(newCreditorRef.id);
        } else if (!creditorIdToUse) {
          alert("Please select or add a creditor");
          return;
        }
      }

      console.log("Existing products:", existingProducts);

      // Update existing product logic
      for (let product of existingProducts) {
        alert(`Checking product: ${product.name} @ ${product.price}`);

        // same product - deciding on basis on pirce, weight & unit (like  kg/litre/meter)
        if (product.price === price && product.weight === weight && product.unit === unit) {

          alert(`Updating product ID: ${product.id}`);
          const updatedProductData = {
            updatedAt: serverTimestamp(),
            quantity: product.quantity + quantity,
            price: price,
          }
          // updating product 
          const productRef = doc(db, "products", product.id);
          await updateDoc(productRef, updatedProductData);


          // maintaining history 
          const newProductDataHistory = {
            name: productName,
            normalized_name: productName.toLowerCase().trim(),
            quantity: quantity,
            price: price,
            weight: weight,
            unit: unit,
            paid,
            // paid = true, then add paymentMode
            paymentMode: paid ? paymentMode : null,
            // paid = false, then add creditor
            creditorId: paid ? null : creditorIdToUse,
            productId: product.id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // we will never update this sub collection parts , never , this is our history record, 
          const subCollectionName = `products/${productRef.id}/warehouse`;
          const warehouseRef = await addDoc(collection(db, `${subCollectionName}`), newProductDataHistory);
          await updateDoc(warehouseRef, { wareHouseId: warehouseRef.id })

          // make true, so, same product didn't get added
          productUpdated = true;
          break;
        }
      }

      if (!productUpdated) {
        alert("Adding new product");

        // just product data only 
        const productData = {
          name: productName,
          normalized_name: productName.toLowerCase().trim(),
          quantity: quantity,
          price: price,
          weight: weight,
          unit: unit,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        // Add the new product to the collection
        // this will be updating, if product matches , code in above 
        // After the document is created, update it with the documentId
        const productRef = await addDoc(collection(db, "products"), productData);
        await updateDoc(productRef, { productId: productRef.id });


        // maintaining product history on every added product
        const productDataHistory = {
          name: productName,
          normalized_name: productName.toLowerCase().trim(),
          quantity: quantity,
          price: price,
          weight: weight,
          unit: unit,
          paid,
          // paid = true, then add paymentMode
          paymentMode: paid ? paymentMode : null,
          // paid = false, then add creditor
          creditorId: paid ? null : creditorIdToUse,
          productId: productRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        // Adding new subcollection 'warehouse' inside the newly created product
        // we will never update this sub collection parts , never , this is our history record, 
        const subCollectionName = `products/${productRef.id}/warehouse`;
        const warehouseRef = await addDoc(collection(db, `${subCollectionName}`), productDataHistory);
        await updateDoc(warehouseRef, { wareHouseId: warehouseRef.id })
      }

      // Reset form inputs
      setProductName("");
      setQuantity("");
      setPrice("");
      setWeight("");
      setUnit(units[0]);
      setPaid(false);
      setPaymentMode(paymentModes[0]);
      setCreditorName("");
      setExistingProducts([]);
      setSelectedCreditorId("");
      alert("Product saved successfully!");

    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    }
  };



  const itemWrapper = 'flex flex-col gap-2 w-full'
  const itemName = 'text-xl '
  const itemInputField = 'border border-gray-950 h-12 px-2 py-2 w-full rounded-md'


  const renderDropdown = (parent) => {
    const availableUnits = unitHierarchy[parent] || [];
    if (availableUnits.length === 0) return null;

    return (
      <div className={itemWrapper}>
        <label className={itemName}>{`Select sub-unit for ${parent}`}</label>
        <select
          className={itemInputField}
          value={selectedUnits[parent] || ""}
          onChange={(e) => handleSelect(e.target.value, parent)}
        >

          <option value="" disabled>
            Select a unit
          </option>
          {availableUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        {/* recursion here, - calling renderDropdown again  */}
        {selectedUnits[parent] && renderDropdown(selectedUnits[parent])}
      </div>
    );
  };


  const renderQuantityInputs = () => {
    const entries = Object.entries(selectedUnits);

    return entries.map(([key, value], index) => {
      // Skip rendering the parent unit itself as an input
      if (key === "parent") return null;

      // Get the parent unit's name
      const parentUnit = entries[index - 1] ? entries[index - 1][1] : selectedUnits["parent"];

      const handleQuantityChange = (e) => {
        const quantityValue = e.target.value;
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          [value]: quantityValue,
        }));
      };

      return (
        <div key={key} className="mt-4">
          <p>
            A {parentUnit} has
            <input
              type="number"
              value={quantities[value] || ""}
              onChange={handleQuantityChange}
              className="border border-gray-950 h-10 px-2 py-1 mx-2 rounded-md"
              placeholder={`Enter number of ${value}`}
              required
            />
            {value}(s)
          </p>
        </div>
      );
    });
  };








  return (
    <div className=" w-full flex justify-center items-center">
      <div className="p-6 w-full text-gray-900 flex flex-col gap-6 items-center justify-start ">
        <h1 className="px-4 text-3xl w-full text-gray-800 font-semibold">Add Product</h1>
        <form
          onSubmit={handleSubmit}
          className="w-full px-4 py-6 bg-white flex flex-col gap-8"
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
                <p className="mb-2">Existing products:</p>

                <ul>
                  {existingProducts.map(product => (
                    <li key={product.id} className="mb-2">
                      <p> product Name =  {product.name} </p>
                      <p> Quantity = {product.quantity} units</p>
                      <p> Price =  @ ₹ {product.price} each unit</p>
                      <p> Weight =   {product.weight} {product.unit}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>



          {/* <div>
            <p>Select Primary Unit</p>
            <select
              value={primaryUnit}
              onChange={(e) => setPrimaryUnit(e.target.value)}
              className="border border-gray-950 h-12 px-2 py-2 rounded-md"
              required
            >
              <option value="" disabled>Select Unit</option>
              {parentUnits.map((unitOption) => (
                <option key={unitOption} value={unitOption}>{unitOption}</option>
              ))}
            </select>
          </div> */}

          <div>
            <h2 className="text-lg font-bold">Unit Selection</h2>
            <div className={itemWrapper}>
              <label className={itemName}>Select a Parent Unit</label>
              <select
                className={itemInputField}
                value={selectedUnits["parent"] || ""}
                onChange={(e) => handleSelect(e.target.value, "parent")}
              >
                <option value="" disabled>
                  Select a unit
                </option>
                {parentUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              {/* calling renderDropDown for first time - this is recursive functions */}
              {selectedUnits["parent"] && renderDropdown(selectedUnits["parent"])}
            </div>
          </div>




          <div>
            {Object.entries(selectedUnits).map(([parent, unit]) => (
              <div key={parent}>
                {/* If 'unit' is an object, use JSON.stringify() */}
                <p>{parent} -  {typeof unit === 'object' ? JSON.stringify(unit) : unit}</p>
              </div>
            ))}
          </div>

          {
            selectedUnits["parent"] && (
              <div className={itemWrapper}>
                <p className={itemName}>Price of - 1 {selectedUnits["parent"]} :</p>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  required
                  className={itemInputField}
                  placeholder="Enter Price"
                />
              </div>
            )
          }

          {
            selectedUnits["parent"] && (
              <div className={itemWrapper}>
                <p className={itemName}> Total Quantity(number) of - {selectedUnits["parent"]}</p>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  required
                  className={itemInputField}
                  placeholder="Enter Quantity"
                />
              </div>
            )
          }


          {
            selectedUnits["parent"] && renderQuantityInputs()
          }


          <div>
            <p>total container(s) = {quantity}</p>
            {Object.entries(quantities).map(([unitType, unitQuantity]) => (
              <div key={unitType}>
                {/* If 'unit' is an object, use JSON.stringify() */}
                <p> total {unitType}(s) =  {typeof unitQuantity === 'object' ? JSON.stringify(unitQuantity) : unitQuantity}</p>
              </div>
            ))}
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

          <div className="flex gap-3 justify-start items-center">
            <label className={itemName}>Paid:</label>
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className=" h-5 w-5"
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
                value={selectedCreditorId}
                onChange={(e) => setSelectedCreditorId(e.target.value)}
                className={itemInputField}
                required
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
                  className="w-full bg-green-500 text-white p-3 text-xl"
                  value="newCreditor"
                >
                  Add New Creditor
                </option>
              </select>
              <div className="w-full mt-4">
                {selectedCreditorId === "newCreditor" && (
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
