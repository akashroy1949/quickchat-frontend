import React from "react";

/**
 * Modern, accessible button inspired by react-bits, using Tailwind CSS only.
 */
const Button = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md px-5 py-2 text-base ${className}`}
    {...props}
  >
    {children}
  </button>
);

export { Button };
