import axios from "../utils/axiosCustomize";

const getPaymentTransactions = (page, limit, provider, status, orderId) => {
    return axios.get(`/api/v1/admin/payments/transactions`, {
        params: { page, limit, provider, status, orderId }
    });
};

export default {
    getPaymentTransactions
};
