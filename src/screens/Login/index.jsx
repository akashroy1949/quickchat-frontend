import React from "react";
import LoginForm from "../../components/Login/LoginForm";
import AuthLayout from "../../components/Login/AuthLayout";
import { Link } from "react-router-dom";

const LoginScreen = () => {
    const loginIcon = (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );

    const bottomContent = (
        <div className="mt-8 text-center">
            <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center flex-auto">
                    <div className="w-[70%] border-t border-white/10" />
                    <div className="relative w-full flex justify-center text-sm">
                        <span className="bg-transparent text-white/50">New to QuickChat?</span>
                    </div>
                    <div className="w-[70%] border-t border-white/10" />
                </div>
            </div>
            <Link
                to="/register"
                className="mt-4 decoration-transparent inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-white/20 rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm group"
            >
                <span>Create an account</span>
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </Link>
        </div>
    );

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue your conversations"
            icon={loginIcon}
            bottomContent={bottomContent}
        >
            <LoginForm />
        </AuthLayout>
    );
};

export default LoginScreen;