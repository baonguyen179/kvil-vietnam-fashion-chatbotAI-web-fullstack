import axios from "@/utils/axiosCustomize";

const authService = {
    login: async (loginValue, password) => {
        return await axios.post("/api/v1/auth/login", { loginValue, password });
    },
    register: async (email, password, fullName, phone) => {
        return await axios.post("/api/v1/auth/register", { email, password, fullName, phone });
    }
}

export default authService;