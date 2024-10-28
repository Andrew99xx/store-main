import { useEffect, useState } from 'react';

export const ProductUnitSelector = ({ product, handleAddProduct, setFilteredProducts }) => {
    const [selectedUnit, setSelectedUnit] = useState(product.display_unit || product.unit);

    // Convert the unit_collection map to an array for dropdown
    const unitOptions = Object.entries(product.unit_collection);

    const handleUnitChange = (event) => {
        
        setSelectedUnit(event.target.value);
    };

    useEffect(() => {
        const updateProduct = () => {
           
            // Calling addProduct with updated product
            const updatedProduct = {
                ...product,
                display_unit: selectedUnit,
            };

            setFilteredProducts((prevProducts) =>
                prevProducts.map((item) =>
                    item.id === product.id
                        ? { ...item, display_unit: selectedUnit }
                        : item
                )
            );

           

            handleAddProduct(updatedProduct, 0);


        };

        updateProduct();
    }, [selectedUnit]); // Ensure all dependencies are present

    return (
        <div className="w-full">
            <select
                id="unit-selector" 
                value={selectedUnit} // Default selected unit
                onChange={handleUnitChange}
                className="border rounded p-2 w-full bg-blue-500 text-white"
            >
                {unitOptions.map(([key, value]) => (
                    <option 
                    key={key} 
                    value={value}
                    className='text-nowrap'
                    >
                        {value} {/* Display the unit name */}
                    </option>
                ))}
            </select>
        </div>
    );
};
