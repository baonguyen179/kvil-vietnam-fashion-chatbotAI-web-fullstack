import axios from "../utils/axiosCustomize";

const getInventoryLogs = (page, limit, type, variantId, startDate, endDate) => {
    return axios.get(`/api/v1/admin/inventory/logs`, {
        params: { page, limit, type, variantId, startDate, endDate }
    });
};

const importInventory = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`/api/v1/admin/inventory/import`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const getInventoryTemplate = () => {
    return axios.get(`/api/v1/admin/inventory/import/template`, {
        responseType: 'blob' // Rất quan trọng để tải file
    });
};

export default {
    getInventoryLogs,
    importInventory,
    getInventoryTemplate
};
