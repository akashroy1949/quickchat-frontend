import React from "react";
import RegisterForm from "../../components/Login/RegisterForm";

const RegisterScreen = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 font-sans">
            <div className="w-full max-w-md bg-dark-card border border-gray-800 p-8 rounded-lg shadow-xl">
                <h2 className="text-2xl font-semibold mb-6 text-center text-white font-display tracking-tight">
                    Create an Account
                </h2>
                <RegisterForm />
            </div>
        </div>
    );
};

export default RegisterScreen;
