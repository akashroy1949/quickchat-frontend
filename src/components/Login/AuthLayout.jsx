import React, { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import FormTransition from "./FormTransition";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// Memoized components for better performance
const GradientOrb = React.memo(({ className, style, children }) => (
    <div className={className} style={style}>
        {children}
    </div>
));

GradientOrb.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node
};

const FloatingParticle = React.memo(({ style }) => (
    <div
        className="absolute w-1 h-1 bg-white/30 rounded-full animate-particle-float"
        style={style}
    />
));

FloatingParticle.propTypes = {
    style: PropTypes.object
};

const ChatBubble = React.memo(({ className, style, children }) => (
    <div className={className} style={style}>
        <p className="text-white/70 text-sm">{children}</p>
    </div>
));

ChatBubble.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node
};

// Memoized chat bubbles decoration component
const ChatBubblesDecoration = React.memo(() => (
    <>
        <div className="absolute top-10 left-10 hidden lg:block">
            <div className="relative">
                <ChatBubble
                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-sm p-3 mb-2 animate-pulse"
                >
                    Welcome back! 👋
                </ChatBubble>
                <ChatBubble
                    className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-2xl rounded-br-sm p-3 ml-8 animate-pulse"
                    style={{ animationDelay: '1s' }}
                >
                    Ready to chat?
                </ChatBubble>
            </div>
        </div>

        <div className="absolute bottom-10 right-10 hidden lg:block">
            <div className="relative">
                <ChatBubble
                    className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-white/10 rounded-2xl rounded-br-sm p-3 mb-2 ml-8 animate-pulse"
                    style={{ animationDelay: '2s' }}
                >
                    Join the conversation
                </ChatBubble>
                <ChatBubble
                    className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-sm p-3 animate-pulse"
                    style={{ animationDelay: '3s' }}
                >
                    Connect with friends 💬
                </ChatBubble>
            </div>
        </div>
    </>
));

// Feature card component
const FeatureCard = React.memo(({ icon, label, gradientFrom, gradientTo }) => (
    <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
        <div className={`w-8 h-8 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
            {icon}
        </div>
        <p className="m-0 text-white/70 text-xs">{label}</p>
    </div>
));

FeatureCard.propTypes = {
    icon: PropTypes.node,
    label: PropTypes.string,
    gradientFrom: PropTypes.string,
    gradientTo: PropTypes.string
};

// Icons as constants to prevent recreation
const ICONS = {
    fast: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    secure: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    social: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    )
};

// Features section component
const FeaturesSection = React.memo(() => {
    const features = useMemo(() => [
        { id: 'fast', icon: ICONS.fast, label: 'Fast', gradientFrom: 'from-purple-500', gradientTo: 'to-pink-500' },
        { id: 'secure', icon: ICONS.secure, label: 'Secure', gradientFrom: 'from-cyan-500', gradientTo: 'to-blue-500' },
        { id: 'social', icon: ICONS.social, label: 'Social', gradientFrom: 'from-emerald-500', gradientTo: 'to-teal-500' }
    ], []);

    return (
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {features.map((feature) => (
                <FeatureCard
                    key={feature.id}
                    icon={feature.icon}
                    label={feature.label}
                    gradientFrom={feature.gradientFrom}
                    gradientTo={feature.gradientTo}
                />
            ))}
        </div>
    );
});

const AuthLayout = ({ children, title, subtitle, icon, bottomContent }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Throttled mouse move handler for better performance
    const handleMouseMove = useCallback((e) => {
        requestAnimationFrame(() => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        });
    }, []);

    useEffect(() => {
        // Throttle mouse events for better performance
        let timeoutId;
        const throttledMouseMove = (e) => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    handleMouseMove(e);
                    timeoutId = null;
                }, 16); // ~60fps
            }
        };

        window.addEventListener('mousemove', throttledMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', throttledMouseMove);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [handleMouseMove]);

    // Memoize gradient orbs to prevent unnecessary re-renders
    const gradientOrbs = useMemo(() => [
        {
            id: 'purple-pink-orb',
            className: "absolute w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-float",
            style: {
                top: '10%',
                left: '10%',
                transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }
        },
        {
            id: 'cyan-blue-orb',
            className: "absolute w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float-reverse",
            style: {
                top: '60%',
                right: '10%',
                transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`
            }
        },
        {
            id: 'emerald-teal-orb',
            className: "absolute w-64 h-64 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 rounded-full blur-3xl animate-float",
            style: {
                top: '30%',
                right: '30%',
                animationDelay: '5s',
                transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`
            }
        }
    ], [mousePosition.x, mousePosition.y]);

    // Memoize particles to prevent regeneration on every render
    const particles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: `particle-${i}`,
            style: {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 10}s`
            }
        }))
        , []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Gradient Orbs */}
                {gradientOrbs.map((orb) => (
                    <GradientOrb
                        key={orb.id}
                        className={orb.className}
                        style={orb.style}
                    />
                ))}

                {/* Floating Particles */}
                {particles.map((particle) => (
                    <FloatingParticle
                        key={particle.id}
                        style={particle.style}
                    />
                ))}
            </div>

            {/* Chat Bubbles Decoration */}
            <ChatBubblesDecoration />

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Glassmorphism Card with Form Transition */}
                    <FormTransition>
                        <motion.div
                            className="group relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

                            {/* Main Card */}
                            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 hover:bg-white/15 transition-all duration-500">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <motion.div
                                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {icon}
                                    </motion.div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                                        {title}
                                    </h1>
                                    <p className="text-white/70 text-sm">
                                        {subtitle}
                                    </p>
                                </div>

                                {/* Form Content */}
                                {children}

                                {/* Bottom Content (Sign Up/Sign In Links) */}
                                {bottomContent}
                            </div>
                        </motion.div>
                    </FormTransition>

                    {/* Features */}
                    <FeaturesSection />
                </div>
            </div>
        </div>
    );
};

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    bottomContent: PropTypes.node
};

export default AuthLayout;