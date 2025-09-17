import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaTimes, FaImage, FaVideo, FaFile, FaMusic, FaCalendarAlt, FaChartBar } from "react-icons/fa";
import { fetchChatStatistics } from "../../redux/actions/Chat/chatStatisticsAction";
import { getResourceUrl } from "../../utils/apiUrl";

const ChatStatisticsModal = ({ conversationId, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { data: statistics, loading, error } = useSelector(state => state.chatStatistics);
    const [selectedMediaType, setSelectedMediaType] = useState('all');

    useEffect(() => {
        if (isOpen && conversationId) {
            dispatch(fetchChatStatistics(conversationId));
        }
    }, [isOpen, conversationId, dispatch]);

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getMediaIcon = (type) => {
        if (type?.startsWith('image/')) return <FaImage className="text-green-500" />;
        if (type?.startsWith('video/')) return <FaVideo className="text-red-500" />;
        if (type?.startsWith('audio/')) return <FaMusic className="text-blue-500" />;
        return <FaFile className="text-gray-500" />;
    };

    const getMediaTypeLabel = (type) => {
        if (type?.startsWith('image/')) return 'Image';
        if (type?.startsWith('video/')) return 'Video';
        if (type?.startsWith('audio/')) return 'Audio';
        return 'File';
    };

    const filteredMedia = statistics?.mediaByDate?.filter(media => {
        if (selectedMediaType === 'all') return true;
        return media.fileType?.startsWith(selectedMediaType);
    }) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <FaChartBar className="text-blue-500 text-xl" />
                        <h2 className="text-xl font-semibold text-white">Chat Statistics</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-400">Loading statistics...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-500 text-lg mb-2">Error loading statistics</div>
                            <div className="text-gray-400">{error}</div>
                        </div>
                    ) : statistics ? (
                        <div className="space-y-6">
                            {/* Overview Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-400">{statistics.totalMessages || 0}</div>
                                    <div className="text-sm text-gray-400">Total Messages</div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-400">{statistics.totalMedia || 0}</div>
                                    <div className="text-sm text-gray-400">Media Files</div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-400">{statistics.totalParticipants || 0}</div>
                                    <div className="text-sm text-gray-400">Participants</div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {statistics.firstMessageDate ? formatDate(statistics.firstMessageDate) : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-400">Started</div>
                                </div>
                            </div>

                            {/* Media by Type */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <FaFile className="mr-2 text-gray-400" />
                                    Media by Type
                                </h3>

                                {/* Filter Buttons */}
                                <div className="flex space-x-2 mb-4">
                                    <button
                                        onClick={() => setSelectedMediaType('all')}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            selectedMediaType === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        All ({statistics.totalMedia || 0})
                                    </button>
                                    <button
                                        onClick={() => setSelectedMediaType('image')}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            selectedMediaType === 'image'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        Images ({statistics.mediaByType?.images || 0})
                                    </button>
                                    <button
                                        onClick={() => setSelectedMediaType('video')}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            selectedMediaType === 'video'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        Videos ({statistics.mediaByType?.videos || 0})
                                    </button>
                                    <button
                                        onClick={() => setSelectedMediaType('audio')}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            selectedMediaType === 'audio'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        Audio ({statistics.mediaByType?.audio || 0})
                                    </button>
                                </div>

                                {/* Media List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {filteredMedia.length > 0 ? (
                                        filteredMedia.map((media, index) => (
                                            <div key={index} className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getMediaIcon(media.fileType)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-medium truncate">
                                                        {media.fileName || `${getMediaTypeLabel(media.fileType)} File`}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">
                                                        {media.fileSize ? `${Math.round(media.fileSize / 1024)} KB` : ''} • {formatDate(media.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <button
                                                        onClick={() => window.open(getResourceUrl(media.file), '_blank')}
                                                        className="text-blue-400 hover:text-blue-300 text-sm"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            No {selectedMediaType === 'all' ? '' : selectedMediaType} files found
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity by Date */}
                            {statistics.activityByDate && statistics.activityByDate.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <FaCalendarAlt className="mr-2 text-gray-400" />
                                        Activity by Date
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {statistics.activityByDate.map((activity, index) => (
                                            <div key={index} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                                                <span className="text-white">{formatDate(activity.date)}</span>
                                                <span className="text-blue-400 font-medium">{activity.count} messages</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            No statistics available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatStatisticsModal;