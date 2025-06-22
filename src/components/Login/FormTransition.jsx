import React from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Transition variants for form content swipe animation
const slideVariants = {
    initial: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    },
    exit: (direction) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    })
};

const FormTransition = ({ children }) => {
    const location = useLocation();

    // Determine direction based on route
    const getDirection = () => {
        if (location.pathname === "/login") return -1; // Coming from right (register)
        if (location.pathname === "/register") return 1; // Going to right (register)
        return 0;
    };

    return (
        <AnimatePresence mode="wait" custom={getDirection()}>
            <motion.div
                key={location.pathname}
                custom={getDirection()}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

FormTransition.propTypes = {
    children: PropTypes.node.isRequired
};

export default FormTransition;