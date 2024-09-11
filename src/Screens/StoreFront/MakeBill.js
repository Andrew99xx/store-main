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
import "./Makebill.css";

const MakeBill = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
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
      setFilteredProducts(productsData.slice(0, 5)); // Display only top 5 products initially
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchQuery.toLowerCase();
    const filteredData = products.filter((item) =>
      item.name.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredProducts(filteredData.slice(0, 5)); // Limit search results to top 5
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
            ), // Ensure quantity does not go below 0 or above available stock
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
        },
      ]);
    }
  };

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
          phone: customerPhone,
          name: customerPhone, // Default name as phone number, can be updated later if needed
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
        paymentMethod: paymentStatus === "paid" ? paymentMethod : "",
        paymentStatus,
        dueAmount: paymentStatus === "due" ? finalAmount - amountPaid : 0,
        paymentAmounts: paymentStatus === "paid" ? paymentData : {},
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
          quantity: product.quantity - product.selectedQuantity,
        });
      }

      alert("Bill completed successfully");
      navigate(`/invoice/${invoiceRef.id}`);
    } catch (error) {
      console.error("Error completing bill: ", error);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setAmountPaid(finalAmount); // Set amount paid to final amount if paying by cash or UPI
  };

  const handlePaymentStatusChange = (status) => {
    setPaymentStatus(status);
    if (status === "due") {
      setAmountPaid(0);
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
    setCustomerName(suggestion.phone); // Update customer name with phone number for now
  };

  const inputProps = {
    placeholder: 'Customer Phone',
    value: customerPhone,
    onChange: onChange,
    className: "inputfield"
  };

  return (
    <div className="makebill">
      <h2>Make Bill</h2>

      <div>
        <h3>Select Products</h3>
        <input
          type="text"
          placeholder="Search Products"
          value={searchQuery}
          className="inputfield"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <h4>Top picks</h4>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Weight</th>
              <th>Price</th>
              <th>Quantity Available</th>
              <th>Select Quantity</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.weight + product.unit}</td>
                <td>₹{product.price}</td>
                <td>{product.quantity}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button onClick={() => handleAddProduct(product, -1)}>
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={product.quantity}
                      placeholder="Quantity"
                      value={selectedProducts.find((p) => p.id === product.id)
                        ?.selectedQuantity || 0
                    }
                    onChange={(e) => handleInputChange(product, e)}
                    style={{ width: "50px", textAlign: "center" }}
                  />
                  <button onClick={() => handleAddProduct(product, 1)}>
                    +
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div>
      <h3>Selected Products</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Weight</th>
            <th>Price</th>
            <th>Selected Quantity</th>
            <th>Total Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {selectedProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.weight + product.unit}</td>
              <td>₹{product.price}</td>
              <td>{product.selectedQuantity}</td>
              <td>₹{product.selectedQuantity * product.price}</td>
              <td>
                <button
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

    <hr />

    <div className="flex">
      <Autosuggest
        suggestions={customers}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        onSuggestionSelected={onSuggestionSelected}
      />
      <button onClick={handleFindOrAddCustomer}>Select customer</button>
    </div>

    <div>
      <h3>Total Amount: ₹{totalAmount.toFixed(2)}</h3>
      <div>
        <label>
          <input
            type="radio"
            name="paymentStatus"
            value="paid"
            checked={paymentStatus === "paid"}
            onChange={() => handlePaymentStatusChange("paid")}
          />
          Paid
        </label>
        <label>
          <input
            type="radio"
            name="paymentStatus"
            value="due"
            checked={paymentStatus === "due"}
            onChange={() => handlePaymentStatusChange("due")}
          />
          Due
        </label>
      </div>

<br />
      <div>
        <label>
          <input
            type="checkbox"
            checked={isGstApplied}
            onChange={handleGstChange}
          />
          GST Billing
        </label>
      </div>

      {isGstApplied && (
        <div>
          <h3>GST Amount: ₹{gstAmount.toFixed(2)}</h3>
          <h3>Final Amount: ₹{finalAmount.toFixed(2)}</h3>
        </div>
      )}

      {isGstApplied && (
        <div>
          <label>
            GST Number:
            <input
              type="text"
              value={gstNumber}
              onChange={handleGstNumberChange}
              className="inputfield"
            />
          </label>
        </div>
      )}

      <h3>Amount Paid: ₹{amountPaid.toFixed(2)}</h3>

      {paymentStatus === "paid" && (
        <div>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => handlePaymentMethodChange("cash")}
            />
            Cash
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="upi_card"
              checked={paymentMethod === "upi_card"}
              onChange={() => handlePaymentMethodChange("upi_card")}
            />
            UPI/Card
          </label>
        </div>
      )}
      <br />

      <button
        onClick={handleCompleteBill}
        disabled={
          !customerId ||
          (paymentStatus === "paid" && amountPaid < finalAmount)
        }
      >
        Complete Bill
      </button>
      <br /><br /><br />
    </div>
  </div>
);
};

export default MakeBill;
