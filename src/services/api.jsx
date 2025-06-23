import axios from "axios";

const DEV_BASE_URL = "http://localhost:5000/api";
const PROD_BASE_URL = "https://quickchat.dpdns.org/api";

const BASE_URL = window.location.hostname === "localhost" ? DEV_BASE_URL : PROD_BASE_URL;

const apiInstance = axios.create({
    baseURL: BASE_URL,
});

// Attach JWT token to every request if available
apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

const API = {
    // AUTH
    registerUser: (data) => apiInstance.post("/auth/register", data),
    loginUser: (data) => apiInstance.post("/auth/login", data),
    checkProtected: () => apiInstance.get("/auth/protected"),

    // USER
    getProfile: () => apiInstance.get("/user/getProfile"),
    searchUsers: (query) => apiInstance.get(`/user/search?query=${encodeURIComponent(query)}`),
    getUserById: (id) => apiInstance.get(`/user/${id}`),
    updateProfile: (formData) => apiInstance.put("/user/updateProfile", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    reportUser: (id, data) => apiInstance.post(`/user/${id}/report`, data),

    // CONVERSATIONS
    getConversations: () => apiInstance.get("/conversations"),
    createConversation: (data) => apiInstance.post("/conversations", data),
    getConversationById: (id) => apiInstance.get(`/conversations/${id}`),

    // MESSAGES
    fetchMessages: (params) => apiInstance.get("/messages", { params }),
    sendMessage: (formData) => apiInstance.post("/messages", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getDirectMessages: (userId) => apiInstance.get(`/messages/${userId}`),
    markMessagesSeen: (data) => apiInstance.put("/messages/markSeen", data),
    markEphemeralViewed: (messageId) => apiInstance.put(`/messages/markEphemeral/${messageId}`),

    // UPLOADS
    uploadFile: (formData) => apiInstance.post("/uploads", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadMultipleFiles: (formData) => apiInstance.post("/uploads/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),

    // HEALTH
    ping: () => apiInstance.get("/ping"),
};

export default API;
