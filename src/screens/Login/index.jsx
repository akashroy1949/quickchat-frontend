import React from "react";
import LoginForm from "../../components/Login/LoginForm";
import Layout from "../../shared/components/Layout";

const LoginScreen = () => {
    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 font-sans">
                <div className="w-full max-w-md bg-dark-card border border-gray-800 p-8 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-white font-display tracking-tight">
                        Login to QuickChat
                    </h2>
                    <LoginForm />
                </div>
            </div>
        </Layout>
    );
};

export default LoginScreen;
