import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaPaperPlane, FaPaperclip, FaMicrophone, FaTimes, FaPlay, FaPause, FaStop, FaRedo } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import API from "@/services/api";
import { connectSocket, sendMessageWithStatus, sendTyping, sendStopTyping } from "@/services/socket";

const MessageInput = ({ conversationId, onMessageSent }) => {
    const fileInputRef = useRef();
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const textareaRef = useRef(null);

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const recordingIntervalRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const audioRef = useRef(null);

    // Helper function to get userId
    const getUserId = () => {
        let userId = localStorage.getItem("userId");

        // If no userId, try to extract from token
        if (!userId) {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.id || payload._id || payload.userId;
                    if (userId) {
                        localStorage.setItem("userId", userId);
                    }
                } catch (e) {
                    console.error("Failed to decode token:", e);
                }
            }
        }

        return userId;
    };


    // Handle typing indicators
    const handleTyping = () => {
        if (!conversationId) return;

        const token = localStorage.getItem("token");
        const userId = getUserId();

        if (!userId) {
            console.warn("🔤 Cannot send typing event: missing userId");
            return;
        }

        // Connect socket if needed
        connectSocket(token, userId);

        if (!isTyping) {
            setIsTyping(true);
            sendTyping(userId, conversationId);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            sendStopTyping(userId, conversationId);
        }, 3000);
    };

    const handleSend = async () => {
        if (!content.trim() && !file && !recordedBlob) return;
        setSending(true);

        // Stop typing when sending message
        if (isTyping) {
            const userId = getUserId();
            sendStopTyping(userId, conversationId);
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }

        try {
            const formData = new FormData();
            formData.append("conversationId", conversationId);
            if (content) formData.append("content", content);

            if (file) {
                // Add file to form data
                formData.append("file", file);

                // Also add file metadata as separate fields for redundancy
                formData.append("fileName", file.name);
                formData.append("fileSize", file.size);
                formData.append("fileType", file.type);

                console.log("Sending file:", {
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            } else if (recordedBlob) {
                // Handle recorded audio
                const voiceFile = new File([recordedBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
                formData.append("file", voiceFile);
                formData.append("fileName", voiceFile.name);
                formData.append("fileSize", voiceFile.size);
                formData.append("fileType", voiceFile.type);

                console.log("Sending voice message:", {
                    name: voiceFile.name,
                    size: voiceFile.size,
                    type: voiceFile.type
                });
            }

            console.log("Sending message with formData");
            const res = await API.sendMessage(formData);
            const token = localStorage.getItem("token");
            const userId = getUserId();
            connectSocket(token, userId);
            const messageObj = res?.data?.data;

            // Log the response from the server
            console.log("Message sent response:", messageObj);

            // Create a complete message object with all necessary fields
            const sentFile = file || (recordedBlob ? new File([recordedBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' }) : null);
            const completeMessageObj = {
                _id: messageObj?._id,
                sender: messageObj?.sender || { _id: userId },
                conversationId: conversationId,
                conversation: conversationId, // Include both formats for compatibility
                content: content || "",
                file: messageObj?.file || null,
                fileName: messageObj?.fileName || (sentFile ? sentFile.name : null),
                fileSize: messageObj?.fileSize || (sentFile ? sentFile.size : null),
                fileType: sentFile ? sentFile.type : null,
                image: messageObj?.image || null,
                createdAt: messageObj?.createdAt || new Date().toISOString(),
                delivered: false,  // Initially not delivered
                seen: false       // Initially not seen
            };

            // Log the complete message object for debugging
            console.log("Complete message object:", {
                _id: completeMessageObj._id,
                content: completeMessageObj.content,
                file: completeMessageObj.file ? "Yes" : "No",
                fileName: completeMessageObj.fileName,
                image: completeMessageObj.image ? "Yes" : "No"
            });

            // Use the enhanced send function with proper status tracking
            sendMessageWithStatus(completeMessageObj);

            // Pass the complete message object to the parent component
            if (onMessageSent) onMessageSent(completeMessageObj);
            setContent("");
            setFile(null);
            setFilePreview(null);
            setRecordedBlob(null);
            setAudioUrl(null);
            setIsRecording(false);
            setIsPaused(false);
            setRecordingTime(0);
            setIsPlaying(false);
            setAudioDuration(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            // Refocus the textarea for better UX
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            }, 100);
        } catch {
            // Optionally show error
        } finally {
            setSending(false);
        }
    };
    const handleAttach = () => {
        fileInputRef.current.click();
    };
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);

            // Log file details for debugging
            console.log("File selected:", {
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size
            });

            // Create preview URL for images, videos, and audio
            if (selectedFile.type.startsWith('image/') ||
                selectedFile.type.startsWith('video/') ||
                selectedFile.type.startsWith('audio/')) {
                const previewUrl = URL.createObjectURL(selectedFile);
                setFilePreview(previewUrl);
                console.log("Media preview created for:", selectedFile.type);
            } else {
                // For other files, just show the file name
                setFilePreview(null);
                console.log("Non-media file selected");
            }
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Voice recording functions
    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Audio recording is not supported in this browser.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedBlob(blob);
                setAudioUrl(url);
                setRecordingTime(0);
                if (recordingIntervalRef.current) {
                    clearInterval(recordingIntervalRef.current);
                }
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);
            setIsPaused(false);

            // Start timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorder && isRecording && !isPaused) {
            mediaRecorder.pause();
            setIsPaused(true);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const resumeRecording = () => {
        if (mediaRecorder && isRecording && isPaused) {
            mediaRecorder.resume();
            setIsPaused(false);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        setRecordedBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setIsPlaying(false);
        setAudioDuration(0);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
    };

    const toggleAudioPlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle emoji selection
    const handleEmojiClick = (emojiData) => {
        setContent(prevContent => prevContent + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    // Toggle emoji picker
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(prevState => !prevState);
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cleanup typing timeout and recording on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    // Format recording time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col p-4 bg-gray-800 border-t border-gray-700 gap-3">
            {/* Voice Recording Preview Section */}
            {audioUrl && !file && (
                <div className="flex items-center mb-2 bg-gray-700 rounded-lg p-3 w-full max-w-md">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center h-16 w-16 bg-red-600 rounded-md mr-3">
                                <span className="text-white text-lg">🎤</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium">
                                    Voice Message
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {formatTime(audioDuration)} • Click send to send
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={toggleAudioPlayback}
                                className="p-2 bg-gray-600 rounded-full text-white hover:bg-gray-500"
                                title={isPlaying ? "Pause preview" : "Play preview"}
                            >
                                {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                            </button>
                            <button
                                onClick={cancelRecording}
                                className="p-2 bg-gray-600 rounded-full text-white hover:bg-red-500"
                                title="Cancel recording"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>
                        {/* Hidden audio element for playback */}
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onLoadedMetadata={() => {
                                if (audioRef.current) {
                                    setAudioDuration(Math.round(audioRef.current.duration));
                                }
                            }}
                            preload="metadata"
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            )}

            {/* Recording Status */}
            {isRecording && (
                <div className="flex items-center justify-center mb-2 bg-red-900/20 rounded-lg p-3">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-red-400 font-medium">
                                {isPaused ? 'Recording Paused' : 'Recording...'}
                            </span>
                        </div>
                        <span className="text-white font-mono">{formatTime(recordingTime)}</span>
                    </div>
                </div>
            )}

            {/* File Preview Section */}
            {file && (
                <div className="flex items-center mb-2 bg-gray-700 rounded-lg p-3 w-full max-w-md">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            {filePreview ? (
                                <div className="relative mr-3">
                                    {file.type.startsWith('image/') && (
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            className="h-16 w-16 object-cover rounded-md"
                                        />
                                    )}
                                    {file.type.startsWith('video/') && (
                                        <video
                                            src={filePreview}
                                            className="h-16 w-16 object-cover rounded-md"
                                            muted
                                            preload="metadata"
                                        />
                                    )}
                                    {file.type.startsWith('audio/') && (
                                        <div className="flex items-center justify-center h-16 w-16 bg-gray-600 rounded-md">
                                            <span className="text-white text-lg">🎵</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-16 w-16 bg-gray-600 rounded-md mr-3">
                                    <FaPaperclip size={20} className="text-gray-300" />
                                </div>
                            )}

                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium truncate max-w-[180px]">
                                    {file.name}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleRemoveFile}
                            className="text-gray-400 ml-2 p-2 hover:text-red-400 bg-gray-600 rounded-full"
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Message Input Section */}
            <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 text-gray-400 relative">
                    <button
                        onClick={toggleEmojiPicker}
                        className="hover:text-gray-200 p-2"
                        disabled={sending || isRecording}
                    >
                        <BsEmojiSmile size={22} />
                    </button>
                    {showEmojiPicker && (
                        <div
                            className="absolute bottom-12 left-0 z-10"
                            ref={emojiPickerRef}
                        >
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                searchDisabled={false}
                                width={300}
                                height={400}
                                theme="dark"
                            />
                        </div>
                    )}
                    <button
                        onClick={handleAttach}
                        className="hover:text-gray-200 p-2"
                        disabled={sending || isRecording}
                    >
                        <FaPaperclip size={20} />
                    </button>
                </div>

                <div className="flex-1 bg-gray-700 rounded-lg px-4 py-3">
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent text-white resize-none max-h-32 min-h-[24px] focus:outline-none placeholder:text-gray-400"
                        placeholder="Type a message..."
                        value={content}
                        onChange={e => {
                            setContent(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={sending || isRecording}
                        rows={1}
                        style={{ overflowY: 'auto' }}
                    />
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    disabled={sending}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />

                {/* Recording Controls */}
                {isRecording ? (
                    <div className="flex space-x-2">
                        <button
                            onClick={stopRecording}
                            className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-500"
                            title="Stop recording"
                        >
                            <FaStop size={18} />
                        </button>
                        {isPaused ? (
                            <button
                                onClick={resumeRecording}
                                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                                title="Resume recording"
                            >
                                <FaRedo size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={pauseRecording}
                                className="p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500"
                                title="Pause recording"
                            >
                                <FaPause size={18} />
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={content.trim() || file || recordedBlob ? handleSend : startRecording}
                        className={`p-3 rounded-lg ${(content.trim() || file || recordedBlob)
                            ? 'bg-green-600 text-white hover:bg-green-500'
                            : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                            } disabled:opacity-50`}
                        disabled={sending}
                    >
                        {(content.trim() || file || recordedBlob) ? (
                            <FaPaperPlane size={18} />
                        ) : (
                            <FaMicrophone size={18} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

MessageInput.propTypes = {
    conversationId: PropTypes.string,
    onMessageSent: PropTypes.func,
};

export default MessageInput;
