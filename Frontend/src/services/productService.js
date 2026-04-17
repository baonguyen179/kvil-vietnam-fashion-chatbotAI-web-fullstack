import axios from "@/utils/axiosCustomize";

const productService = {
    getAllProducts: async (queryParams = {}) => {
        // Convert object into query string. Example: { page: 1, limit: 10, name: 'ao' } -> ?page=1&limit=10&name=ao
        return await axios.get(`/api/v1/products`, { params: queryParams });
    },
    searchProducts: async (keyword, page = 1, limit = 10) => {
        return await axios.get(`/api/v1/products/search`, {
            params: { keyword, page, limit }
        });
    },
    getProductById: async (id) => {
        return await axios.get(`/api/v1/products/${id}`);
    },
    createProduct: async (data) => {
        return await axios.post(`/api/v1/admin/products`, data);
    },
    updateProduct: async (id, data) => {
        return await axios.put(`/api/v1/admin/products/${id}`, data);
    },
    deleteProduct: async (id) => {
        return await axios.delete(`/api/v1/admin/products/${id}`);
    },
    addProductVariant: async (id, data) => {
        return await axios.post(`/api/v1/admin/products/${id}/variants`, data);
    },
    addProductImages: async (id, files) => {
        const formData = new FormData();
        // Assume 'files' is an array of File objects
        files.forEach(file => {
            formData.append("images", file);
        });
        
        return await axios.post(`/api/v1/admin/products/${id}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },
    deleteProductImage: async (imageId) => {
        return await axios.delete(`/api/v1/admin/products/images/${imageId}`);
    }
}

export default productService;
