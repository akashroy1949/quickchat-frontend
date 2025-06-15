import React from "react";

/**
 * Minimal Layout component for full-screen, full-width pages with a modern background.
 * No flex, no centering—just a normalized container.
 */
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen w-screen bg-dark-gradient dark:bg-dark-gradient transition-colors duration-300">
            {children}
        </div>
    );
};

export default Layout;
