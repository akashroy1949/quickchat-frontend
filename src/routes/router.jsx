import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginScreen from "../screens/Login";
import Home from "../screens/Home";


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginScreen />} />

            {/* Add private routes later */}
        </Routes>
    );
};

export default AppRouter;
