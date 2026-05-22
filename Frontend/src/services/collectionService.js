import axios from "@/utils/axiosCustomize";

const collectionService = {
    // --- Admin APIs ---
    createCollection: async (formData) => {
        return await axios.post("/api/v1/admin/collections", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateCollection: async (id, formData) => {
        return await axios.put(`/api/v1/admin/collections/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    addProductsToCollection: async (id, productIds) => {
        return await axios.post(`/api/v1/admin/collections/${id}/products`, { productIds });
    },
    removeProductsFromCollection: async (id, productIds) => {
        return await axios.delete(`/api/v1/admin/collections/${id}/products`, {
            data: { productIds }
        });
    },

    // --- Public APIs ---
    getPublicCollections: async () => {
        return await axios.get("/api/v1/collections");
    },
    getCollectionBySlug: async (slug) => {
        return await axios.get(`/api/v1/collections/${slug}`);
    },
}

export default collectionService;
