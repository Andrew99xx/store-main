import React, { useState } from "react";
import AddProduct from "./AddProduct/AddProduct";
import ShowProducts from "./ShowProduct/ShowProduct";
import ShowCreditors from "./ShowCreditors/ShowCreditors";
// import "./warehouse.css"
import CustomTabItem from "../../components/cssComponents/CustomTabItem";

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
    <div className="flex flex-col w-full bg-gray-100">
      <div className="w-full bg-gray-950 shadow-md flex flex-wrap gap-6 justify-evenly items-center p-4">
        <CustomTabItem onClick={() => setActiveScreen("addProduct")}>Add Product</CustomTabItem>
        <CustomTabItem onClick={() => setActiveScreen("showProducts")}>Show Products</CustomTabItem>
        <CustomTabItem onClick={() => setActiveScreen("showCreditors")}>Show Creditors</CustomTabItem>
      </div>
      {renderScreen()}
    </div>
  );
};

export default WareHouse;