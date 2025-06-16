// src/screens/Home/index.jsx

import AnimatedContent from "@/react-bits/Animations/AnimatedContent/AnimatedContent";
import CardSwap from "@/react-bits/Components/CardSwap/CardSwap";
import BounceCards from "@/react-bits/Components/BounceCards/BounceCards";
import TiltedCard from "@/react-bits/Components/TiltedCard/TiltedCard";
import Ribbons from "@/react-bits/Animations/Ribbons/Ribbons";
import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css";
import ScrollFloat from "@/react-bits/TextAnimations/ScrollFloat/ScrollFloat";
import ScrollReveal from "@/react-bits/TextAnimations/ScrollReveal/ScrollReveal";
import TextPressure from "@/react-bits/TextAnimations/TextPressure/TextPressure";
import GradientText from "@/react-bits/TextAnimations/GradientText/GradientText";
import GlitchText from "@/react-bits/TextAnimations/GlitchText/GlitchText";
import BlurText from "@/react-bits/TextAnimations/BlurText/BlurText";
import SpotlightCard from "@/react-bits/Components/SpotlightCard/SpotlightCard";
import Waves from "@/react-bits/Backgrounds/Waves/Waves";
import Magnet from "@/react-bits/Animations/Magnet/Magnet";

const features = [
    {
        title: "Real-time Messaging",
        desc: "Instantly connect and chat with friends or groups. Enjoy lightning-fast message delivery and read receipts.",
        icon: "💬",
    },
    {
        title: "Media Sharing",
        desc: "Share images, videos, and files seamlessly with your contacts. Drag and drop or upload in a snap!",
        icon: "📎",
    },
    {
        title: "Custom Themes",
        desc: "Personalize your chat experience with beautiful themes and color schemes.",
        icon: "🎨",
    },
    {
        title: "Voice & Video Calls",
        desc: "Connect face-to-face or with voice calls, directly from your chat window.",
        icon: "📞",
    },
    {
        title: "Group Chats",
        desc: "Create groups for friends, family, or teams. Share updates, media, and more in one place.",
        icon: "👥",
    },
    {
        title: "Message Reactions",
        desc: "React to messages with emojis to express yourself instantly.",
        icon: "😃",
    },
    {
        title: "End-to-End Encryption",
        desc: "Your conversations are private and secure with industry-leading encryption.",
        icon: "🔒",
    },
    {
        title: "Smart Notifications",
        desc: "Get notified only when it matters. Customize alerts for different chats.",
        icon: "🔔",
    },
    {
        title: "Pinned Messages",
        desc: "Pin important messages for quick access anytime in your conversations.",
        icon: "📌",
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
        <div className="relative w-full min-h-screen overflow-x-hidden bg-dark-bg">
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 text-white font-sans">
                {/* Hero/About Section */}
                <section className="relative text-center mb-20">
                    <GradientText
                        colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                        animationSpeed={3}
                        showBorder={false}
                        className="text-lg md:text-6xl font-bold mb-4 font-display tracking-tight"
                    >
                        QUICKCHAT
                    </GradientText>
                    <div className="mb-6 text-center flex flex-wrap justify-center items-center align-center">
                        <BlurText
                            text="A modern chat experience designed to connect you effortlessly. Built with cutting-edge web technologies, QuickChat delivers lightning-fast messaging with stunning visuals, end-to-end encryption, and seamless communication across all your devices."
                            delay={50}
                            animateBy="words"
                            direction="top"
                            className="lg:text-xl xl:text-xl text-balance text-center justify-center font-sans text-gray-300 leading-relaxed tracking-tight"
                        />
                    </div>
                    <Magnet padding={100} disabled={false} magnetStrength={5}>
                        <AnimatedContent>
                        <button
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 font-sans tracking-tight"
                            onClick={() => (window.location.href = "/login")}
                        >
                            Get Started
                        </button>
                    </AnimatedContent>
                    </Magnet>
                    
                </section>

                {/* Features Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-8 text-center font-display tracking-tight">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((f) => (
                            <SpotlightCard
                                key={f.title}
                                className="custom-spotlight-card flex flex-col items-center text-center p-8 shadow-lg border border-gray-800 bg-dark-card font-sans"
                                spotlightColor="rgba(0, 229, 255, 0.2)"
                            >
                                <div className="text-5xl mb-4">{f.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-cyan-300 drop-shadow font-display tracking-tight">{f.title}</h3>
                                <p className="text-gray-300 mb-2 leading-relaxed tracking-tight">{f.desc}</p>
                            </SpotlightCard>
                        ))}
                    </div>
                </section>

                {/* About Section */}
                <section className="mb-20 max-w-3xl mx-auto text-center">
                    <ScrollFloat>
                        <h2 className="text-3xl font-bold mb-6 font-display tracking-tight">About QuickChat</h2>
                    </ScrollFloat>
                    <ScrollReveal
                        baseOpacity={0}
                        enableBlur={true}
                        baseRotation={5}
                        blurStrength={10}
                        textClassName="text-lg text-gray-300 font-sans leading-relaxed tracking-tight"
                        containerClassName="my-0"
                    >
                        {`QuickChat is built for speed, security, and style. Whether you want to chat with friends, collaborate with teams, or just have fun, QuickChat provides a seamless and interactive experience powered by the latest web technologies and creative UI effects.`}
                    </ScrollReveal>
                </section>

                {/* FAQs Section */}
                <section className="mb-20 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-center font-display tracking-tight">FAQs</h2>
                    <Accordion defaultActiveKey="0" className="gap-3">
                        {faqs.map((faq, idx) => (
                            <Accordion.Item
                                eventKey={String(idx)}
                                key={faq.q}
                                style={{
                                    backgroundColor: "#121212",
                                    color: "#fff",
                                    borderRadius: "0.75rem",
                                    marginBottom: "1rem",
                                    border: "1px solid #1a1a1a",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                                }}
                            >
                                <Accordion.Header
                                    style={{
                                        backgroundColor: "#121212",
                                        color: "#fff",
                                        borderRadius: "0.75rem",
                                    }}
                                >
                                    {faq.q}
                                </Accordion.Header>
                                <Accordion.Body
                                    style={{
                                        backgroundColor: "#121212",
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
                <footer className="border-t border-gray-800 pt-8 pb-4 text-center text-gray-400 font-sans tracking-tight">
                    <span>
                        © {new Date().getFullYear()} QuickChat. All rights reserved.
                    </span>
                </footer>
            </div>
        </div>
    );
};

export default Home;
