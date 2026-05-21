import api from './api';

export const getAdminStatisticsOverview = async () => {
    const response = await api.get('/admin/statistics/overview');
    return response.data;
};

export const getMostReservedDays = async (limit = 10) => {
    const res = await api.get(`/admin/statistics/most-reserved-days?limit=${limit}`);
    return res.data;
};

export const getMostCancelledDays = async (limit = 10) => {
    const res = await api.get(`/admin/statistics/most-cancelled-days?limit=${limit}`);
    return res.data;
};

export const getFavoriteMenus = async (limit = 10) => {
    const response = await api.get(`/admin/statistics/favorite-menus?limit=${limit}`);
    return response.data;
};

export const getMonthlyReservationStatistics = async () => {
    const response = await api.get('/admin/statistics/monthly-reservations');
    return response.data;
};

export const getPaymentSummary = async () => {
    const response = await api.get('/admin/statistics/payment-summary');
    return response.data;
};

export const getRefundSummary = async () => {
    const response = await api.get('/admin/statistics/refund-summary');
    return response.data;
};
