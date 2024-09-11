import React, { useState, useEffect } from "react";
import { db, collection, getDocs, doc, deleteDoc } from "../../../firebase";

const ShowCreditors = () => {
  const [creditors, setCreditors] = useState([]);
  const [sortOption, setSortOption] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCreditors = async () => {
      const querySnapshot = await getDocs(collection(db, "creditors"));
      const creditorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sortCreditors(creditorsData, sortOption);
      setCreditors(creditorsData);
    };
    fetchCreditors();
  }, [sortOption]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "creditors", id));
    setCreditors(creditors.filter(creditor => creditor.id !== id));
  };

  const sortCreditors = (creditorsData, option) => {
    switch (option) {
      case "name":
        creditorsData.sort((a, b) => {
          if (a.name && b.name) {
            return a.name.localeCompare(b.name);
          }
          return 0;
        });
        break;
      case "amount":
        creditorsData.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      default:
        break;
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCreditors = creditors.filter(creditor =>
    creditor.name && creditor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="center">
      <h1>All Creditors</h1>
      <div>
        <label>Sort by:</label>
        <select value={sortOption} onChange={handleSortChange}>
          <option value="name">Name</option>
          <option value="amount">Total Amount</option>
        </select>
      </div>
      <br />
      <input
        type="text"
        placeholder="Search creditors by name"
        value={searchTerm}
        className="inputfield"
        onChange={handleSearchChange}
      />
      {filteredCreditors.length > 0 ? (
        <ol>
          {filteredCreditors.map(creditor => (
            <li key={creditor.id} className="pd1">
             ID- {creditor.id} <br /> Name: {creditor.name} - {creditor.product} - {creditor.quantity} units @ ₹{creditor.price} each - Total: ₹{creditor.totalAmount}
              <button onClick={() => handleDelete(creditor.id)}>Paid</button>
            </li>
          ))}
        </ol>
      ) : (
        <p>No creditors found</p>
      )}
    </div>
  );
};

export default ShowCreditors;
