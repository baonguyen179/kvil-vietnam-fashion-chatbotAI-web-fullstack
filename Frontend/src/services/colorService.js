import axios from '../utils/axiosCustomize';

const BASE = "/api/v1/colors";
const ADMIN_BASE = "/api/v1/admin/colors";

const getAllColors = async () => {
    return await axios.get(BASE);
};

const createColor = async (data) => {
    return await axios.post(ADMIN_BASE, data);
};

const updateColor = async (id, data) => {
    return await axios.put(`${ADMIN_BASE}/${id}`, data);
};

const deleteColor = async (id) => {
    return await axios.delete(`${ADMIN_BASE}/${id}`);
};

export default {
    getAllColors,
    createColor,
    updateColor,
    deleteColor
};
