import React, { useState, useEffect } from "react";
import {
  db,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from "../../firebase";
import { useNavigate } from "react-router-dom";
import Autosuggest from "react-autosuggest"; // Import react-autosuggest
import { ProductUnitSelector } from "./componentsMakeBill/ProductUnitSelector";

const MakeBill = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  // const [defaultProductUnit, setDefaultProductUnit] = useState(products.unit || "");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0); // Track amount paid
  const [paymentStatus, setPaymentStatus] = useState("due"); // Track payment status
  const [paymentMethod, setPaymentMethod] = useState(""); // Track payment method
  const [dueAmount, setDueAmount] = useState(0); // Track due amount
  const [isGstApplied, setIsGstApplied] = useState(false); // Track if GST is applied
  const [gstNumber, setGstNumber] = useState(""); // Track GST number
  const [gstAmount, setGstAmount] = useState(0); // Track GST amount
  const [finalAmount, setFinalAmount] = useState(0); // Track final amount including GST
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const productsSnap = await getDocs(collection(db, "products"));
      const productsData = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setFilteredProducts(productsData.slice(0, 5));
      // Display only top 5 products initially
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchQuery.toLowerCase();
    const filteredData = products.filter((item) =>
      item.name.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredProducts(filteredData.slice(0, 5));
    // Limit search results to top 5
  }, [searchQuery, products]);

  useEffect(() => {
    // Calculate total amount whenever selected products change
    const total = selectedProducts.reduce((acc, product) => {
      return acc + product.selectedQuantity * product.price;
    }, 0);
    setTotalAmount(total);
  }, [selectedProducts]);

  useEffect(() => {
    // Calculate GST and final amount whenever totalAmount or isGstApplied changes
    const gst = isGstApplied ? totalAmount * 0.12 : 0;
    setGstAmount(gst);
    setFinalAmount(totalAmount + gst);
  }, [totalAmount, isGstApplied]);

  // uddate due amount, whenever amount paid change
  useEffect(() => {
    setDueAmount(finalAmount - amountPaid);
    if (amountPaid === 0) {
      setPaymentStatus("due");
    }
    else {
      if (amountPaid.toFixed(2) === finalAmount.toFixed(2)) {
        setPaymentStatus("paid");
      }
    }
  }, [amountPaid, finalAmount])

  // const handleUnitChange = (event) => {
  //   setDefaultProductUnit(event.target.value);
  //   // Handle additional logic if necessary (e.g., updating state or calculations)
  // };

  const handleAddProduct = (product, quantity) => {
    const existingProduct = selectedProducts.find(
      (item) => item.id === product.id
    );
    if (existingProduct) {
      const updatedProducts = selectedProducts.map((item) => {
        if (item.id === product.id) {
          const newQuantity = item.selectedQuantity + quantity;
          return {
            ...item,
            selectedQuantity: Math.max(
              0,
              Math.min(product.quantity, newQuantity)
            ),
            unit: product.unit,
            // Ensure quantity does not go below 0 or above available stock
          };
        }
        return item;
      });
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          selectedQuantity: Math.max(
            0,
            Math.min(product.quantity, quantity)
          ), // Ensure quantity does not go below 0 or above available stock
          // adding new field, selectedQuantity 
        },
      ]);
    }
  };

  // const handleAddProduct = (updatedProduct, quantity) => {
  //   const existingProductIndex = selectedProducts.findIndex(
  //     (item) => item.id === updatedProduct.id
  //   );
  
  //   if (existingProductIndex !== -1) {
  //     // Update the existing product in selectedProducts array
  //     const updatedProducts = [...selectedProducts];
  //     updatedProducts[existingProductIndex] = {
  //       ...updatedProducts[existingProductIndex],
  //       selectedQuantity: Math.max(
  //         0,
  //         Math.min(updatedProduct.quantity, quantity)
  //       ),
  //       unit: updatedProduct.unit, // Ensure the unit is updated
  //     };
  //     setSelectedProducts(updatedProducts);
  //   } else {
  //     // Add the product if it doesn't exist yet
  //     setSelectedProducts([
  //       ...selectedProducts,
  //       {
  //         ...updatedProduct,
  //         selectedQuantity: Math.max(
  //           0,
  //           Math.min(updatedProduct.quantity, quantity)
  //         ), 
  //       },
  //     ]);
  //   }
  // };
  

  const handleInputChange = (product, event) => {
    const value = event.target.value;
    const quantity = value === "" ? 0 : parseInt(value, 10);
    if (!isNaN(quantity)) {
      handleAddProduct(product, quantity);
    }
  };

  const handleFindOrAddCustomer = async () => {
    try {
      const q = query(
        collection(db, "customers"),
        where("phone", "==", customerPhone)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        const customerRef = await addDoc(collection(db, "customers"), {
          // Default name as phone number, can be updated later if needed
          phone: customerPhone,
          name: customerPhone,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCustomerId(customerRef.id);
        setCustomerName(customerPhone);
      } else {
        const customerData = querySnapshot.docs[0];
        setCustomerId(customerData.id);
        setCustomerName(customerData.data().name || customerPhone);
      }
    } catch (error) {
      console.error("Error finding or adding customer: ", error);
    }
  };

  const handleCompleteBill = async () => {
    try {
      if (paymentStatus === "paid" && amountPaid < finalAmount) {
        // how this is working 
        // if paymenStatus === paid, then it means full paid
        // half payment, or no payment, will fall in due
        alert("Amount paid cannot be less than the total invoice amount");
        return;
      }

      const paymentData = {
        upi_card: paymentMethod === "upi_card" ? amountPaid : 0,
        cash: paymentMethod === "cash" ? amountPaid : 0,
      };

      const invoice = {
        customerId,
        customerName,
        products: selectedProducts.map((product) => ({
          productId: product.id,
          productName: product.name,
          quantity: product.selectedQuantity,
          price: product.price,
        })),
        totalAmount,
        gstAmount,
        finalAmount,
        amountPaid,
        paymentMethod,
        // paymentMethod: paymentStatus === "paid" ? paymentMethod : "",
        paymentStatus,
        // dueAmount: paymentStatus === "due" ? finalAmount - amountPaid : 0,
        dueAmount,
        paymentAmounts: paymentData,
        // paymentAmounts: paymentStatus === "paid" ? paymentData : {},
        createdAt: new Date(),
        isGstApplied,
        gstNumber,
      };

      const invoiceRef = await addDoc(collection(db, "invoices"), {
        ...invoice,
        createdAt: serverTimestamp(),
      });

      // Update product quantities
      for (let product of selectedProducts) {
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, {
          // updating stock quantity 
          quantity: product.quantity - product.selectedQuantity,
          updatedAt: serverTimestamp(),
          remarks: "product sold, updating product quantity"
        });

        // also maintain history , do review before modifying code 
        // maintaining product history on every sold product
        const productDataHistory = {
          name: product.name,
          normalized_name: product.normalized_name,
          // quantity sold is main things to maintain 
          quantity: product.selectedQuantity,
          // in differen places quantity may be referring different meanings 
          // quantity can be - total quantity of product left - in our stock
          // quantity can be - total quantity of product sold - from storefront - to customer 
          // quantity can be - total quantity of product added - from warehouse - from creditor
          price: product.price,
          weight: product.weight,
          unit: product.unit,
          // paid : product.paid,
          customerId: customerId,
          productId: product.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        // Adding new subcollection 'storefront' inside the  product
        // we will never update this sub collection parts , never , this is our history record,
        // how many times, same products sold, maintain quantity sold 
        const subCollectionName = `products/${productRef.id}/storefront`;
        const storefrontRef = await addDoc(collection(db, `${subCollectionName}`), productDataHistory);
        await updateDoc(storefrontRef, { storefrontId: storefrontRef.id })
      }

      alert("Bill completed successfully");
      navigate(`/invoice/${invoiceRef.id}`);
    } catch (error) {
      console.error("Error completing bill: ", error);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setAmountPaid(finalAmount); // i think this line is not correct here
    // why 
    // Set amount paid to final amount if paying by cash or UPI
  };

  const handlePaymentStatusChange = (status) => {
    setPaymentStatus(status);
    if (status === "due") {
      setAmountPaid(0)
    } else {
      setAmountPaid(finalAmount);
    }
  };

  const handleGstChange = (event) => {
    setIsGstApplied(event.target.checked);
  };

  const handleGstNumberChange = (event) => {
    setGstNumber(event.target.value);
  };

  const getSuggestions = async (value) => {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('phone', '>=', value), where('phone', '<=', value + '\uf8ff'));

    const querySnapshot = await getDocs(q);
    const customers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return customers.map(customer => ({ id: customer.id, phone: customer.phone }));
  };

  const getSuggestionValue = suggestion => suggestion.phone;

  const renderSuggestion = suggestion => (
    <div>
      {suggestion.phone}
    </div>
  );

  const onChange = (event, { newValue }) => {
    setCustomerPhone(newValue);
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions(value);
    setCustomers(suggestions);
  };

  const onSuggestionsClearRequested = () => {
    setCustomers([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setCustomerId(suggestion.id);
    setCustomerName(suggestion.phone);
    // Update customer name with phone number for now
  };

  const inputProps = {
    placeholder: 'Customer Phone',
    value: customerPhone,
    onChange: onChange,
    className: "px-2 py-2 flex-1 w-full"
  };


  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Make Bill</h2>


      <h3 className="text-lg font-semibold mb-2 text-gray-700">Enter Customer Phone Number</h3>
      <div className="flex items-center justify-between mb-4 w-full gap-6">
        <div className="flex-1 border">
          <Autosuggest
            suggestions={customers}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            onSuggestionSelected={onSuggestionSelected}
          />
        </div>
        <button
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleFindOrAddCustomer}
        >
          Complete Selected Customer
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2 text-gray-700">Select Products</h3>
      <input
        type="text"
        placeholder="Search Products"
        value={searchQuery}
        className=" border rounded px-3 py-2 w-full mb-4 text-gray-700"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="mt-2 overflow-auto">
        <h4 className="text-md font-medium mb-2 text-gray-600">Top Products</h4>
        <table className="min-w-full table-auto bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              {/* <th className="px-4 py-2 text-left">Weight</th> */}
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Quantity Available</th>
              <th className="px-4 py-2 text-left">Select Quantity</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-2">{product.id}</td>
                <td className="px-4 py-2">{product.name}</td>
                {/* <td className="px-4 py-2">{product.weight + product.unit}</td> */}
                {/* <td className="px-4 py-2">{product.unit}</td> */}
                <td className="px-4 py-2 w-full">
                  <ProductUnitSelector
                    product={product}
                    handleAddProduct={handleAddProduct}
                  />
                  
                </td>
                <td className="px-4 py-2">₹{product.price}</td>
                <td className="px-4 py-2">{product.quantity}</td>
                <td className="px-4 py-2 flex items-center">
                  <button
                    className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                    onClick={() => handleAddProduct(product, -1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={product.quantity}
                    placeholder="Quantity"
                    value={
                      selectedProducts.find((p) => p.id === product.id)
                        ?.selectedQuantity || 0
                    }
                    onChange={(e) => handleInputChange(product, e)}
                    className="border w-16 mx-2 px-2 py-1 text-center rounded"
                  />
                  <button
                    className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                    onClick={() => handleAddProduct(product, 1)}
                  >
                    +
                  </button>
                </td>
                <td>
                  <button
                    className="text-nowrap px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    // onClick={() => handleAddProduct(product, product.selectedQuantity)}
                  >
                    Add to Cart
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="mt-6 overflow-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Selected Products</h3>
        <table className="min-w-full table-auto bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Selected Quantity</th>
              <th className="px-4 py-2 text-left">Total Price</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-2">{product.id}</td>
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.unit}</td>
                <td className="px-4 py-2">₹{product.price}</td>
                <td className="px-4 py-2">{product.selectedQuantity}</td>
                <td className="px-4 py-2">₹{product.selectedQuantity * product.price}</td>
                <td className="px-4 py-2">
                  <button
                    className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() =>
                      setSelectedProducts(
                        selectedProducts.filter((p) => p.id !== product.id)
                      )
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow-md mt-6">
        <h3 className="text-xl font-semibold text-gray-700">Total Amount: ₹{totalAmount.toFixed(2)}</h3>
      </div>

      {/* GST Toggle and Input */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={isGstApplied}
            onChange={(e) => setIsGstApplied(e.target.checked)}
          />
          <label className="text-gray-700 font-medium">
            Apply GST (12%)
          </label>
        </div>

        {isGstApplied && (
          <div className="mt-3">
            <label className="block text-gray-600 mb-1 font-medium">
              GST Number:
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="Enter GST number"
            />
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-gray-700 font-medium">
            GST Amount: <span className="font-semibold">₹{gstAmount.toFixed(2)}</span>
          </h4>
          <h4 className="text-gray-700 font-medium mt-2">
            Final Amount (with GST): <span className="font-semibold">₹{finalAmount.toFixed(2)}</span>
          </h4>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow-md mt-6">
        <h3 className="text-xl font-semibold text-gray-700">Final Amount (with GST): ₹{finalAmount.toFixed(2)}</h3>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow-md mt-6">
        <label className="block text-gray-700 font-medium mb-2">
          Payment Method:
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => handlePaymentMethodChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        >
          <option value="">Select Payment Method</option>
          <option value="cash">Cash</option>
          <option value="upi_card">UPI/Card</option>
        </select>

        <div className="ml-1 mb-4">
          <h3 className="block text-gray-700 font-medium mb-2">Payment Status:</h3>
          <label className="mr-4">
            <input
              type="radio"
              name="paymentStatus"
              value="paid"
              checked={paymentStatus === "paid"}
              onChange={() => handlePaymentStatusChange("paid")}
              className="mr-2"
            />
            Fully Paid
          </label>
          <label>
            <input
              type="radio"
              name="paymentStatus"
              value="due"
              checked={paymentStatus === "due"}
              onChange={() => handlePaymentStatusChange("due")}
              className="mr-2"
            />
            Due
          </label>
        </div>

        {
          paymentStatus === "due" ? <div>
            <label className="block text-gray-700 font-medium mb-2">Any Amount Paid:</label>
            <input
              type="number"
              value={amountPaid}
              max={finalAmount}
              min={0}
              onChange={(e) => setAmountPaid(Number(e.target.value))} // Handle amount paid input
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div> : <></>
        }

      </div>

      {/* Payment Details */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
        <div className="mt-2">
          <h4 className="text-gray-700 font-medium">
            Amount Paid: <span className="font-semibold">₹{amountPaid}</span>
          </h4>
          <h4 className="text-gray-700 font-medium mt-2">
            Payment Status: <span className="font-semibold">{paymentStatus}</span>
          </h4>
          <h4 className="text-gray-700 font-medium mt-2">
            Due Amount: <span className="font-semibold">₹{dueAmount}</span>
          </h4>
        </div>
      </div>

      <button
        type="button"
        className="my-6 mx-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={handleCompleteBill}
      >
        Complete Bill
      </button>
    </div>
  );
};

export default MakeBill;
