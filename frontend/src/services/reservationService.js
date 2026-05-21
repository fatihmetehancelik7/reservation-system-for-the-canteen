import api from './api';

export const getAllReservations = async () => {
    const response = await api.get('/reservations');
    return response.data;
};

export const getUserReservations = async (userId) => {
    const response = await api.get(`/reservations/user/${userId}`);
    return response.data;
};

export const createReservation = async (data) => {
    const response = await api.post('/reservations/reserve', data);
    return response.data;
};

export const updateReservation = async (id, data) => {
    const response = await api.put(`/reservations/update/${id}`, data);
    return response.data;
};

export const getUserTransactions = async (userId) => {
    const response = await api.get(`/transactions/user/${userId}`);
    return response.data;
};
