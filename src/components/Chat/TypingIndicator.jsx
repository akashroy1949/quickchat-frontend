import React from "react";
import PropTypes from "prop-types";

const TypingIndicator = ({ typingUsers }) => {
    if (typingUsers.length === 0) return null;

    return (
        <div className="flex justify-start mb-2">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-700 text-gray-300 flex items-center space-x-2">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm italic">
                    {typingUsers.length === 1
                        ? "Someone is typing..."
                        : `${typingUsers.length} people are typing...`
                    }
                </span>
            </div>
        </div>
    );
};

TypingIndicator.propTypes = {
    typingUsers: PropTypes.array.isRequired,
};

export default TypingIndicator;