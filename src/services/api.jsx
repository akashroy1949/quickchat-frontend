import axios from "axios";

const BASE_URL = "https://quickchat.dpdns.org/api";

const apiInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

const API = {
    // Auth APIs
    loginUser: (data) => apiInstance.post("/auth/login", data),
    registerUser: (data) => apiInstance.post("/auth/register", data),

    // Add more modules here as needed (user, chat, etc.)
    // getUserProfile: () => apiInstance.get("/user/profile"),
    // updateUserProfile: (data) => apiInstance.patch("/user/profile", data),
};

export default API;
