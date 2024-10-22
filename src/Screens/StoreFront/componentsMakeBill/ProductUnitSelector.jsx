import { useEffect, useState } from 'react';

export const ProductUnitSelector = ({ product, handleAddProduct }) => {
    const [selectedUnit, setSelectedUnit] = useState(product.unit);

    // Convert the unit_collection map to an array for dropdown
    const unitOptions = Object.entries(product.unit_collection);

    const handleUnitChange = (event) => {
        setSelectedUnit(event.target.value);
    };

    useEffect(() => {
        const updateProduct = () => {
            const updatedProduct = {
                ...product,
                unit: selectedUnit,
            };
            // Calling addProduct with updated product
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
                className="border rounded p-2 w-full"
            >
                {unitOptions.map(([key, value]) => (
                    <option key={key} value={value}> 
                        {value} {/* Display the unit name */}
                    </option>
                ))}
            </select>
        </div>
    );
};
