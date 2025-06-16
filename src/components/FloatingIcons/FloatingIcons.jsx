import React, { useEffect, useState } from 'react';

const FloatingIcons = () => {
    const [icons, setIcons] = useState([]);

    const iconsList = [
        '💬', '📱', '🚀', '⚡', '🔐', '🌟', '💎', '🎯', 
        '🔥', '⭐', '📞', '📎', '🎨', '👥', '😃', '📌',
        '🔔', '💫', '🌈', '✨', '🎪', '🎭', '🎨', '🎯'
    ];

    useEffect(() => {
        const generateIcons = () => {
            const newIcons = [];
            for (let i = 0; i < 15; i++) {
                newIcons.push({
                    id: i,
                    icon: iconsList[Math.floor(Math.random() * iconsList.length)],
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 20 + 15,
                    opacity: Math.random() * 0.3 + 0.1,
                    animationDuration: Math.random() * 20 + 15,
                    animationDelay: Math.random() * 5,
                    direction: Math.random() > 0.5 ? 1 : -1,
                });
            }
            setIcons(newIcons);
        };

        generateIcons();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {icons.map((icon) => (
                <div
                    key={icon.id}
                    className="absolute animate-float blur-sm"
                    style={{
                        left: `${icon.x}%`,
                        top: `${icon.y}%`,
                        fontSize: `${icon.size}px`,
                        opacity: icon.opacity,
                        animationDuration: `${icon.animationDuration}s`,
                        animationDelay: `${icon.animationDelay}s`,
                        transform: `rotate(${icon.direction * 15}deg)`,
                        filter: 'blur(2px)',
                    }}
                >
                    {icon.icon}
                </div>
            ))}
            
            {/* Additional floating elements */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-purple-500 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-20 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-40"></div>
            <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-bounce opacity-30"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-50"></div>
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-40"></div>
            <div className="absolute top-1/2 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-30"></div>
        </div>
    );
};

export default FloatingIcons;