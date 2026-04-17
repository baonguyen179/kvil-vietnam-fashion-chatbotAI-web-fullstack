import axios from "@/utils/axiosCustomize";

const authService = {
    login: async (loginValue, password) => {
        return await axios.post("/api/v1/auth/login", { loginValue, password });
    },
    register: async (email, password, fullName, phone) => {
        return await axios.post("/api/v1/auth/register", { email, password, fullName, phone });
    },
    sendOtp: async (email) => {
        return await axios.post("/api/v1/auth/forgot-password/send-otp", { email });
    },
    resetPassword: async (email, otp, newPassword) => {
        return await axios.post("/api/v1/auth/forgot-password/reset", { email, otp, newPassword });
    },
    logout: async () => {
        return await axios.post("/api/v1/auth/logout");
    }
}

export default authService;