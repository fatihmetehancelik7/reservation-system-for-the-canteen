import api from './api';

export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};
