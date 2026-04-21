import axios from "../utils/axiosCustomize";

const getInventoryLogs = (page, limit, type, variantId) => {
    return axios.get(`/api/v1/admin/inventory/logs`, {
        params: { page, limit, type, variantId }
    });
};

export default {
    getInventoryLogs
};
