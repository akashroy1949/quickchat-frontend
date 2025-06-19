import React from "react";
import RegisterForm from "../../components/Login/RegisterForm";
import AuthLayout from "../../components/Login/AuthLayout";
import { Link } from "react-router-dom";

const RegisterScreen = () => {
    const registerIcon = (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );

    const bottomContent = (
        <div className="mt-8 text-center">
            <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center flex-auto">
                    <div className="w-[70%] border-t border-white/10" />
                    <div className="relative w-full flex justify-center text-sm">
                        <span className="bg-transparent text-white/50">Already have an account?</span>
                    </div>
                    <div className="w-[70%] border-t border-white/10" />
                </div>
            </div>
            <Link
                to="/login"
                className="mt-4 decoration-transparent inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-white/20 rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm group"
            >
                <span>Sign in instead</span>
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </Link>
        </div>
    );

    return (
        <AuthLayout
            title="Join QuickChat"
            subtitle="Create your account to start chatting"
            icon={registerIcon}
            bottomContent={bottomContent}
        >
            <RegisterForm />
        </AuthLayout>
    );
};

export default RegisterScreen;