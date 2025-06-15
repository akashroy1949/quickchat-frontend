import React from "react";

/**
 * Modern card component inspired by react-bits, using Tailwind CSS only.
 */
const Card = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "", ...props }) => (
  <h2 className={`text-2xl font-bold text-gray-800 dark:text-white mb-2 ${className}`} {...props}>
    {children}
  </h2>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`text-gray-700 dark:text-gray-300 ${className}`} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent };
