// src/screens/Home/index.jsx

import AnimatedContent from "@/react-bits/Animations/AnimatedContent/AnimatedContent";
import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css";
import ScrollReveal from "@/react-bits/TextAnimations/ScrollReveal/ScrollReveal";
import GradientText from "@/react-bits/TextAnimations/GradientText/GradientText";
import BlurText from "@/react-bits/TextAnimations/BlurText/BlurText";
import SpotlightCard from "@/react-bits/Components/SpotlightCard/SpotlightCard";
import Waves from "@/react-bits/Backgrounds/Waves/Waves";
import Particles from "@/react-bits/Backgrounds/Particles/Particles";
import Aurora from "@/react-bits/Backgrounds/Aurora/Aurora";
import Magnet from "@/react-bits/Animations/Magnet/Magnet";
import FloatingIcons from "../../components/FloatingIcons/FloatingIcons";
import React from "react";
import ScrollFloat from "@/react-bits/TextAnimations/ScrollFloat/ScrollFloat";
import ScrollIcon from "../../shared/components/ScrollIcon";
import { faqs, features } from "@/lib/utils";
import Footer from "@/shared/components/Footer";


const Home = () => {  
    const handleScroll = () => {
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-dark-bg">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0">
        <Aurora
          className="absolute inset-0 opacity-20"
          colorStops={['#6366f1', '#8b5cf6', '#ec4899']}
        />
      </div>

      <div className="fixed inset-0 z-1">
        <Particles
          className="absolute inset-0 opacity-40"
          particleCount={150}
          particleColors={['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981']}
          moveParticlesOnHover={true}
          particleHoverFactor={0.5}
          alphaParticles={true}
          speed={0.05}
        />
      </div>

      <div className="fixed inset-0 z-2">
        <Waves className="absolute inset-0 opacity-10" />
      </div>

      {/* Floating Icons Background */}
      <FloatingIcons />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-white font-sans">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={3}
            showBorder={false}
            className="text-4xl md:text-7xl lg:text-8xl font-display tracking-tight drop-shadow-2xl"
          >
            QUICKCHAT
          </GradientText>

          <div className="mb-16 mt-10 text-center max-w-4xl mx-auto">
            <BlurText
              text="A modern chat experience designed to connect you effortlessly. Built with cutting-edge web technologies, QuickChat delivers lightning-fast messaging with stunning visuals, end-to-end encryption, and seamless communication across all your devices."
              delay={50}
              animateBy="words"
              direction="top"
              className="text-lg lg:text-xl xl:text-2xl text-balance text-center font-sans text-gray-300 leading-relaxed tracking-tight"
            />
          </div>
 
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Magnet padding={100} disabled={false} magnetStrength={5}>
              <AnimatedContent>
                <button
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white px-10 py-4 rounded-full font-semibold text-xl shadow-2xl transition-all duration-500 transform hover:scale-110 font-sans tracking-tight glow relative overflow-hidden group"
                  onClick={() => (window.location.href = "/login")}
                >
                  <span className="relative z-10">🚀 Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                </button>
              </AnimatedContent>
            </Magnet>

            <AnimatedContent>
              <button className="border-2 border-gray-600 hover:border-purple-400 text-gray-300 hover:text-white px-10 py-4 rounded-full font-semibold text-xl transition-all duration-300 transform hover:scale-105 font-sans tracking-tight backdrop-blur-sm">
                ✨ Learn More
              </button>
            </AnimatedContent>
          </div>
        </div>

        {/* Scroll Icon */}
        <ScrollIcon onClick={handleScroll} />
  
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/5 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-bounce"></div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-white font-sans">
        {/* Features Section */}
        <section className="mb-32 relative">
          <div className="features-section-header mx-auto text-center mb-16">
            <ScrollFloat>
              ✨ Amazing Features
            </ScrollFloat>
            <p className="text-gray-400 text-lg font-sans">Discover what makes QuickChat special</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features?.map((f, index) => (
              <AnimatedContent key={f?.title + index} direction="bottom">
                <SpotlightCard
                  className="group relative flex flex-col items-center text-center p-8 border border-gray-800/50 bg-dark-card/80 backdrop-blur-sm font-sans transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_30px_4px_rgba(139,92,246,0.3),0_0_10px_2px_rgba(236,72,153,0.3)]"
                  spotlightColor="rgba(147, 51, 234, 0.5)"
                >
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors duration-300 font-display tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed tracking-tight transition-colors duration-300">
                    {f.desc}
                  </p>

                  {/* Decorative corner elements */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>

          {/* Background decorative elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-600/5 rounded-full blur-3xl"></div>
        </section>

        {/* About Section */}
        <section className="mb-32 relative">
          <div className="about-section-container mx-auto text-center">
            <ScrollFloat
            >
              About QuickChat
            </ScrollFloat>

            <div className="bg-dark-card/40 backdrop-blur-md rounded-3xl p-12 border border-gray-800/50 shadow-2xl">
              <ScrollReveal
                baseOpacity={0}
                enableBlur={true}
                baseRotation={0}
                blurStrength={15}
                textClassName="text-xl lg:text-2xl text-gray-300 font-sans leading-relaxed tracking-tight"
                containerClassName="my-0"
              >
                {`QuickChat is built for speed, security, and style. Whether you want to chat with friends, collaborate with teams, or just have fun, QuickChat provides a seamless and interactive experience powered by the latest web technologies and creative UI effects.`}
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Lightning Fast</h3>
                  <p className="text-gray-400 text-sm">Real-time messaging with zero delays</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2">Secure</h3>
                  <p className="text-gray-400 text-sm">End-to-end encryption guaranteed</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-lg font-semibold text-pink-300 mb-2">Beautiful</h3>
                  <p className="text-gray-400 text-sm">Stunning UI with smooth animations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full opacity-50"></div>
        </section>

        { /* FAQs Section */}
        <section className="mb-32 relative">
          <div className="max-w-4xl mx-auto">
            <div className="faq-section-header mx-auto text-center mb-16">
              <ScrollFloat>
                Frequently Asked Questions
              </ScrollFloat>
              <p className="text-gray-400 text-lg font-sans">Everything you need to know about QuickChat</p>
            </div>

            <div className="bg-dark-card/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 shadow-2xl">
              <Accordion className="gap-4">
                {faqs?.map((faq, idx) => (
                  <AnimatedContent key={faq.q} direction="bottom">
                    <Accordion.Item
                      eventKey={String(idx)}
                      className="group"
                      style={{
                        backgroundColor: "#121212",
                        color: "#fff",
                        borderRadius: "1rem",
                        marginBottom: "1rem",
                        border: "1px solid #374151",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Accordion.Header
                        style={{
                          backgroundColor: "#121212",
                          color: "#fff",
                          borderRadius: "1rem",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                        }}
                      >
                        <img
                          className="mr-3 inline-block"
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='currentColor' viewBox='0 0 24 24'%3E%3Ctext x='0' y='20'%3E%3F%3C/text%3E%3C/svg%3E"
                          alt="Question"
                          aria-label="Question"
                          style={{ width: "1.5em", height: "1.5em", verticalAlign: "middle" }}
                        />
                        {faq.q}
                      </Accordion.Header>
                      <Accordion.Body
                        style={{
                          backgroundColor: "#121212",
                          color: "#e5e7eb",
                          borderRadius: "0 0 1rem 1rem",
                          fontSize: "1rem",
                          lineHeight: "1.6",
                        }}
                      >
                        <img
                          className="mr-3 inline-block"
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='yellow' viewBox='0 0 24 24'%3E%3Ctext x='0' y='20'%3E%F0%9F%92%A1%3C/text%3E%3C/svg%3E"
                          alt="Answer"
                          aria-label="Answer"
                          style={{ width: "1.5em", height: "1.5em", verticalAlign: "middle" }}
                        />
                        {faq.a}
                      </Accordion.Body>
                    </Accordion.Item>
                  </AnimatedContent>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        </section>

        {/* Footer Section */}
        <Footer/>
      </div>
    </div>
  );
};

export default Home;
