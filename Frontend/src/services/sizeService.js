import axios from '../utils/axiosCustomize';

const BASE = "/api/v1/sizes";
const ADMIN_BASE = "/api/v1/admin/sizes";

const getAllSizes = async () => {
    return await axios.get(BASE);
};

const createSize = async (data) => {
    return await axios.post(ADMIN_BASE, data);
};

const updateSize = async (id, data) => {
    return await axios.put(`${ADMIN_BASE}/${id}`, data);
};

const deleteSize = async (id) => {
    return await axios.delete(`${ADMIN_BASE}/${id}`);
};

export default {
    getAllSizes,
    createSize,
    updateSize,
    deleteSize
};
