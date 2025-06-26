import React from "react";
import PropTypes from "prop-types";

const TypingIndicator = ({ typingUsers }) => {
    if (typingUsers.length === 0) return null;

    return (
        <div className="flex justify-start mb-2">
            <div className="max-w-xs lg:max-w-md px-3 py-2 rounded-lg bg-[#202c33] text-gray-300 flex items-center space-x-2 relative">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-400">
                    {typingUsers.length === 1
                        ? "typing..."
                        : `${typingUsers.length} people are typing...`
                    }
                </span>

                {/* Message tail */}
                <div
                    className="absolute top-0 left-0 -ml-1.5 w-3 h-3 bg-[#202c33] rounded-br-lg"
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                    }}
                />
            </div>
        </div>
    );
};

TypingIndicator.propTypes = {
    typingUsers: PropTypes.array.isRequired,
};

export default TypingIndicator;