import React, { useState } from "react";
import AddProduct from "./AddProduct/AddProduct";
import ShowProducts from "./ShowProduct/ShowProduct";
import ShowCreditors from "./ShowCreditors/ShowCreditors";

const WareHouse = () => {
  const [activeScreen, setActiveScreen] = useState("addProduct");

  const renderScreen = () => {
    switch (activeScreen) {
      case "addProduct":
        return <AddProduct />;
      case "showProducts":
        return <ShowProducts />;
      case "showCreditors":
        return <ShowCreditors />;
      default:
        return <AddProduct />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar-style tab bar */}
      <div className="bg-white shadow-md p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-center space-x-6">
          <button
            className={`px-4 py-2 rounded-md ${activeScreen === 'addProduct' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveScreen("addProduct")}
          >
            Add Product
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeScreen === 'showProducts' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveScreen("showProducts")}
          >
            Show Products
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeScreen === 'showCreditors' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveScreen("showCreditors")}
          >
            Show Creditors
          </button>
        </div>
      </div>

      {/* Content area below navbar */}
      <div className="pt-20 p-6 w-full max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-md p-6">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default WareHouse;
