import React from "react";

const features = [
    {
        title: "Real-time Messaging",
        desc: "Instantly connect and chat with anyone, anytime.",
        icon: (
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#6366f1" d="M12 22c5.523 0 10-3.582 10-8s-4.477-8-10-8S2 5.582 2 10c0 2.01 1.01 3.82 2.684 5.13C4.26 16.13 2 18.5 2 18.5s3.5-1.5 5.5-2c1.13.32 2.36.5 3.5.5Z" /></svg>
        )
    },
    {
        title: "Private & Secure",
        desc: "Your conversations are encrypted and safe.",
        icon: (
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#a21caf" d="M12 2a6 6 0 0 0-6 6v4H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V8a6 6 0 0 0-6-6Zm0 2a4 4 0 0 1 4 4v4H8V8a4 4 0 0 1 4-4Z" /></svg>
        )
    },
    {
        title: "Modern UI",
        desc: "A beautiful, intuitive interface for everyone.",
        icon: (
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#f472b6" d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10C22 6.477 17.523 2 12 2Zm0 2c4.418 0 8 3.582 8 8 0 1.657-.672 3.157-1.757 4.243A7.963 7.963 0 0 1 12 20a7.963 7.963 0 0 1-6.243-3.757A7.963 7.963 0 0 1 4 12c0-4.418 3.582-8 8-8Z" /></svg>
        )
    }
];

const FeaturesSection = () => (
    <section className="max-w-4xl mx-auto py-16 px-4 grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-300">{f.desc}</p>
            </div>
        ))}
    </section>
);

export default FeaturesSection;
