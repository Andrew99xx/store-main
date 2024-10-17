// first undertand properly - to make changes here 
// critical things, - if working - do not touch


import React, { useState, useEffect } from "react";
import { db, collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from "../../../firebase";
import CustomButtonSubmit from "../../../components/cssComponents/CustomButtonSubmit.jsx"

// const units = ["kg", "gram", "liter", "milliliter"];

const paymentModes = ["online", "cash"];

const parentUnits = ["container", "box", "sack", "can", "sache", "piece", "kg", "gram", "liter", "milliliter"];

const unitHierarchy = {
  container: ["box", "sack", "can", "sache", "piece", "kg", "gram", "liter", "milliliter"],
  box: ["can", "sache", "piece", "kg", "gram", "liter", "milliliter"],
  sack: ["can", "sache", "piece", "kg", "gram", "liter", "milliliter"],
  can: [],
  pieces: [],
  sache: [],
  kg: [],
  gram: [],
  liter: [],
  milliliter: []
};

const AddProduct = () => {
  // const [primaryUnit, setPrimaryUnit] = useState("");

  // all selected units 
  const [productName, setProductName] = useState("");

  const [quantity, setQuantity] = useState("");
  const [quantity_collection, set_quantity_collection] = useState({});

  const [price, setPrice] = useState("");
  const [priceCollection, setPriceCollection] = useState({});

  const [weight, setWeight] = useState("");

  const [unit, setUnit] = useState("not_unit_added");
  const [unit_collection, set_unit_collection] = useState({});

  const [paid, setPaid] = useState(false);
  const [paymentMode, setPaymentMode] = useState(paymentModes[0]);
  const [creditorName, setCreditorName] = useState("");
  const [existingProducts, setExistingProducts] = useState([]);
  const [creditors, setCreditors] = useState([]);
  const [selectedCreditorId, setSelectedCreditorId] = useState("");

  const handleSelect = (unit, parent) => {

    set_unit_collection((prev_unit_collection) => ({
      ...prev_unit_collection,
      [parent]: unit,
    }));

    setUnit(unit_collection["parent"])
  };

  console.log("quantity_collection")
  console.log(quantity_collection)

  console.log("unit_collection")
  console.log(unit_collection);

  console.log("priceCollection")
  console.log(priceCollection)


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

    if (!productName.trim()) {
      alert("product name is emtpy")
      return;
    }

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
            unit_collection,
            priceCollection,
            quantity_collection,

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
          unit_collection,
          priceCollection,
          quantity_collection,
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
          unit_collection,
          priceCollection,
          quantity_collection,
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
      // setUnit(units[0]);
      setPaid(false);
      setPaymentMode(paymentModes[0]);
      setCreditorName("");
      setExistingProducts([]);
      setSelectedCreditorId("");
      set_unit_collection({});
      set_quantity_collection({});
      setPriceCollection({})

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
      <div className={itemWrapper} >
        <label className={itemName}>{`Select sub-unit for ${parent}`}</label>
        <select
          className={itemInputField}
          value={unit_collection[parent] || ""}
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
        {unit_collection[parent] && renderDropdown(unit_collection[parent])}
      </div>
    );
  };


  const renderQuantityInputs = () => {
    const entries = Object.entries(unit_collection);

    return entries.map(([key, value], index) => {
      // Skip rendering the parent unit itself as an input
      if (key === "parent") return null;

      // Get the parent unit's name
      // get ancestor unit
      const ancestorUnit = entries[index - 1] ? entries[index - 1][1] : unit_collection["parent"];

      const handleQuantityChange = (e) => {
        const quantityValue = e.target.value;

        if (isNaN(quantityValue) || quantityValue <= 0) {
          alert("quantity should be greater than zero")
          return;
          // Skip if invalid
        }


        set_quantity_collection((prevquantity_collection) => ({
          ...prevquantity_collection,
          [value]: quantityValue,
        }));



        // handle this carefully, may be key is not present

        if (!ancestorUnit || !priceCollection[ancestorUnit]) {
          return;
        }

        setPriceCollection((prev) => ({
          ...prev,
          [value]: priceCollection[ancestorUnit] / quantityValue,
        }));
      };

      return (
        <div key={key} className={itemWrapper}>

          {/* how ancestorUnit = coming form iterations */}
          {/* ancestor unit */}
          <p className={itemName}>Number of  {value}(s) in  a {ancestorUnit} </p>

          <input
            type="number"
            value={quantity_collection[value] || ""}
            onChange={handleQuantityChange}
            className={itemInputField}
            placeholder={`Enter number of ${value} in a ${ancestorUnit}`}
            required
          />

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
            <h2 className="text-xl font-bold mb-2">Unit Selection</h2>
            <div className={itemWrapper}>
              <label className={itemName}>Select a Parent Unit</label>
              <select
                className={itemInputField}
                value={unit_collection["parent"] || ""}
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
              {unit_collection["parent"] && renderDropdown(unit_collection["parent"])}
            </div>
          </div>




          <div className={itemWrapper}>
            <p className={itemName}>Unit Summary :</p>
            <div className="flex flex-row gap-1">
              {Object.entries(unit_collection).map(([parent, unit], index, arr) => (
                <div key={parent}>
                  {/* If 'unit' is an object, use JSON.stringify() */}
                  <span>{typeof unit === 'object' ? JSON.stringify(unit) : unit}</span>
                  {/* Conditionally render the '->' symbol if it's not the last item */}
                  {index < arr.length - 1 && <span> {"->"} </span>}
                </div>
              ))}
            </div>
          </div>


          {
            unit_collection["parent"] && (
              <div className={itemWrapper}>
                <p className={itemName}>Price of - 1 {unit_collection["parent"]} :</p>
                <input
                  type="number"
                  value={price}
                  // onChange={(e) => setPrice(parseFloat(e.target.value))}
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value);
                    setPrice(newPrice);

                    // Update priceCollection with the selected unit and its price
                    setPriceCollection((prev) => ({
                      ...prev,
                      [unit_collection["parent"]]: newPrice,
                    }));
                  }}
                  required
                  className={itemInputField}
                  placeholder="Enter Price"
                />
              </div>
            )
          }

          {
            unit_collection["parent"] && (
              <div className={itemWrapper}>
                <p className={itemName}> Number of - {unit_collection["parent"]}</p>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  required
                  className={itemInputField}
                  placeholder="Enter Quantity(Number)"
                />
              </div>
            )
          }


          {
            unit_collection["parent"] && renderQuantityInputs()
          }


          <div className={itemWrapper}>
            <p className={itemName}>Quantity Summary : </p>
            <div>
              <p>total container(s) = {quantity}</p>
              {Object.entries(quantity_collection).map(([unitType, unitQuantity]) => (
                <div key={unitType}>
                  {/* If 'unit' is an object, use JSON.stringify() */}
                  <p> total {unitType}(s) =  {typeof unitQuantity === 'object' ? JSON.stringify(unitQuantity) : unitQuantity}</p>
                </div>
              ))}
            </div>
          </div>


          {/* <div className={itemWrapper}>
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
          </div> */}

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
