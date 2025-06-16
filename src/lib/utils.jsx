import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const features = [
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

export const faqs = [
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