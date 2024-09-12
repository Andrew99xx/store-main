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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">All Creditors</h1>
      
      <div className="flex justify-center items-center mb-4">
        <label className="mr-2">Sort by:</label>
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="bg-gray-700 text-white p-2 rounded"
        >
          <option value="name">Name</option>
          <option value="amount">Total Amount</option>
        </select>
      </div>
      
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search creditors by name"
          value={searchTerm}
          className="w-full max-w-md p-2 rounded bg-gray-700 text-white"
          onChange={handleSearchChange}
        />
      </div>

      {filteredCreditors.length > 0 ? (
        <ol className="space-y-4">
          {filteredCreditors.map(creditor => (
            <li
              key={creditor.id}
              className="bg-gray-800 p-4 rounded shadow-md flex justify-between items-center"
            >
              <div>
                <p>ID: {creditor.id}</p>
                <p className="font-semibold">Name: {creditor.name}</p>
                <p>
                  {creditor.product} - {creditor.quantity} units @ ₹{creditor.price} each
                </p>
                <p>Total: ₹{creditor.totalAmount}</p>
              </div>
              <button
                onClick={() => handleDelete(creditor.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Paid
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-center mt-4">No creditors found</p>
      )}
    </div>
  );
};

export default ShowCreditors;
