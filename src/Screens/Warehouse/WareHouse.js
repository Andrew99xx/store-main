import React, { useState } from "react";
import AddProduct from "./AddProduct/AddProduct";
import ShowProducts from "./ShowProduct/ShowProduct";
import ShowCreditors from "./ShowCreditors/ShowCreditors";
import "./warehouse.css"
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
    <div className="warehouse">
      <div className="header">
        <div onClick={() => setActiveScreen("addProduct")}>Add Product</div>
        <div onClick={() => setActiveScreen("showProducts")}>Show Products</div>
        <div onClick={() => setActiveScreen("showCreditors")}>Show Creditors</div>
      </div>
      {renderScreen()}
    </div>
  );
};

export default WareHouse;