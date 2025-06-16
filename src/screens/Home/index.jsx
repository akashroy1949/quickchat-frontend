// src/screens/Home/index.jsx

import AnimatedContent from "@/react-bits/Animations/AnimatedContent/AnimatedContent";
import GlitchText from "@/react-bits/TextAnimations/GlitchText/GlitchText";
import CardSwap from "@/react-bits/Components/CardSwap/CardSwap";
import BounceCards from "@/react-bits/Components/BounceCards/BounceCards";
import TiltedCard from "@/react-bits/Components/TiltedCard/TiltedCard";
import Ribbons from "@/react-bits/Animations/Ribbons/Ribbons";
import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css";
import ScrollFloat from "@/react-bits/TextAnimations/ScrollFloat/ScrollFloat";
import ScrollReveal from "@/react-bits/TextAnimations/ScrollReveal/ScrollReveal";

const features = [
    {
        title: "Real-time Messaging",
        desc: "Instantly connect and chat with friends or groups.",
        icon: "💬",
        img: "https://plus.unsplash.com/premium_photo-1681488109800-bad7e69c66a8?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Media Sharing",
        desc: "Share images, videos, and files seamlessly.",
        icon: "📎",
        img: "https://plus.unsplash.com/premium_photo-1684179639963-e141ce2f8074?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Custom Themes",
        desc: "Personalize your chat experience with beautiful themes.",
        icon: "🎨",
        img: "https://plus.unsplash.com/premium_photo-1683121175112-cbb3b76657cd?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
];

const faqs = [
    {
        q: "Is QuickChat free to use?",
        a: "Yes, QuickChat is completely free for all users.",
    },
    {
        q: "Can I use QuickChat on mobile?",
        a: "Absolutely! QuickChat is fully responsive and works on any device.",
    },
    {
        q: "How do I get started?",
        a: "Just click the 'Get Started' button and sign up!",
    },
];

const Home = () => {
    return (
        <div className="relative w-full min-h-screen overflow-x-hidden bg-black">
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 text-white">
                {/* Hero/About Section */}
                <section className="text-center mb-20">
                    <GlitchText
                        text="Welcome to QuickChat"
                        className="text-4xl md:text-5xl font-bold mb-4"
                    />
                    <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        A modern chat experience designed to connect you effortlessly and in
                        style.
                    </p>
                    <AnimatedContent>
                        <button
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-transform transform hover:scale-105"
                            onClick={() => (window.location.href = "/login")}
                        >
                            Get Started
                        </button>
                    </AnimatedContent>
                </section>

                {/* Features Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((f) => (
                            <TiltedCard
                                key={f.title}
                                imageSrc={null}
                                altText={f.title}
                                captionText={
                                    <>
                                        <span className="text-4xl mb-2 block">{f.icon}</span>
                                        <span className="font-bold text-xl">{f.title}</span>
                                        <p className="text-gray-300 mt-2">{f.desc}</p>
                                    </>
                                }
                                containerHeight="220px"
                                containerWidth="100%"
                                rotateAmplitude={10}
                                scaleOnHover={1.08}
                                showMobileWarning={false}
                                showTooltip={false}
                                displayOverlayContent={false}
                            />
                        ))}
                    </div>
                </section>

                {/* About Section */}
                <section className="mb-20 max-w-3xl mx-auto text-center">
                    <ScrollFloat>
                        <h2 className="text-3xl font-bold mb-6">About QuickChat</h2>
                    </ScrollFloat>
                    <ScrollReveal
                        baseOpacity={0}
                        enableBlur={true}
                        baseRotation={5}
                        blurStrength={10}
                        textClassName="text-lg text-gray-300"
                        containerClassName="my-0"
                    >
                        {`QuickChat is built for speed, security, and style. Whether you want to chat with friends, collaborate with teams, or just have fun, QuickChat provides a seamless and interactive experience powered by the latest web technologies and creative UI effects.`}
                    </ScrollReveal>
                </section>

                {/* FAQs Section */}
                <section className="mb-20 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-center">FAQs</h2>
                    <Accordion defaultActiveKey="0" className="gap-3">
                        {faqs.map((faq, idx) => (
                            <Accordion.Item
                                eventKey={String(idx)}
                                key={faq.q}
                                style={{
                                    backgroundColor: "#18181b",
                                    color: "#fff",
                                    borderRadius: "0.75rem",
                                    marginBottom: "1rem",
                                    border: "none",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                                }}
                            >
                                <Accordion.Header
                                    style={{
                                        backgroundColor: "#18181b",
                                        color: "#fff",
                                        borderRadius: "0.75rem",
                                    }}
                                >
                                    {faq.q}
                                </Accordion.Header>
                                <Accordion.Body
                                    style={{
                                        backgroundColor: "#18181b",
                                        color: "#fff",
                                        borderRadius: "0 0 0.75rem 0.75rem",
                                    }}
                                >
                                    {faq.a}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-700 pt-8 pb-4 text-center text-gray-400">
                    <span>
                        © {new Date().getFullYear()} QuickChat. All rights reserved.
                    </span>
                </footer>
            </div>
        </div>
    );
};

export default Home;
