import React from 'react';
import PropTypes from 'prop-types';
import EmojiPicker from 'emoji-picker-react';

const ReactionPicker = ({ onSelectEmoji, onClose, className }) => {
    return (
        <div className={`bg-gray-800 rounded-lg shadow-lg p-2 reaction-picker ${className}`}>
            <EmojiPicker
                onEmojiClick={(emojiData) => {
                    onSelectEmoji(emojiData.emoji);
                    onClose();
                }}
                searchDisabled={false}
                skinTonesDisabled={false}
                autoFocusSearch={true}
                width={300}
                height={400}
                previewConfig={{
                    showPreview: true
                }}
                theme="dark"
            />

            {/* Close button */}
            <div className="mt-2 flex justify-end">
                <button
                    className="text-xs text-gray-400 hover:text-white"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

ReactionPicker.propTypes = {
    onSelectEmoji: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string
};

export default ReactionPicker;