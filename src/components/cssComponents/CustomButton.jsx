import React from 'react';

function CustomButton({ onClick, children }) {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="w-full bg-blue-500 text-white p-3 text-xl font-bold"
    >
      {children}
    </button>
  );
}

export default CustomButton;
