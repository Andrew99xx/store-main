import React from 'react';

function CustomTabItem({ children, onClick }) {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer px-4 py-2 text-blue-500 rounded-md transition-colors duration-300 hover:bg-blue-100 hover:text-blue-700 font-semibold text-lg"
        >
            {children}
        </div>
    );
}

export default CustomTabItem;
