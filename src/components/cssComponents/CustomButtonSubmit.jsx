import React from 'react';

function CustomButtonSubmit({ children }) {
    return (
        <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 text-xl font-bold"
        >
            {children}
        </button>
    );
}

export default CustomButtonSubmit;
