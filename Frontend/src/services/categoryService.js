import axios from "@/utils/axiosCustomize";

const categoryService = {
    getAllCategories: async () => {
        return await axios.get("/api/v1/categories");
    },
    createCategory: async (data) => {
        return await axios.post("/api/v1/admin/categories", data);
    },
    updateCategory: async (id, data) => {
        return await axios.put(`/api/v1/admin/categories/${id}`, data);
    },
    deleteCategory: async (id) => {
        return await axios.delete(`/api/v1/admin/categories/${id}`);
    }
}

export default categoryService;
