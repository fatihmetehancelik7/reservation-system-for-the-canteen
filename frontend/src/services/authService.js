import api from './api';

export const loginApi = async (email, sifre) => {
    const response = await api.post('/users/login', { email, sifre });
    return response.data;
};
