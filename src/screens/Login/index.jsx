import React from "react";
import LoginForm from "../../components/Login/LoginForm";
import Layout from "../../shared/components/Layout";

const LoginScreen = () => {
    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
                        Login to QuickChat
                    </h2>
                    <LoginForm />
                </div>
            </div>
        </Layout>
    );
};

export default LoginScreen;
