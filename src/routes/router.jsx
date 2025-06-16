import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginScreen from "../screens/Login";
import RegisterScreen from "../screens/Register";
import Home from "../screens/Home";


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            {/* Add private routes later */}
        </Routes>
    );
};

export default AppRouter;
