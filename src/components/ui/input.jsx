import React from "react";

/**
 * Modern input component inspired by react-bits, using Tailwind CSS only.
 */
const Input = ({ className = "", ...props }) => (
  <input
    className={`block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-4 py-2 text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:opacity-50 disabled:pointer-events-none ${className}`}
    {...props}
  />
);

export { Input };
