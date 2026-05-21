import api from './api';

export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

export const createUsersBatch = async (usersData) => {
    const response = await api.post('/users/batch', usersData);
    return response.data;
};

