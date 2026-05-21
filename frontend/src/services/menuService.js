import api from './api';

export const getMenusByMonth = async (yil, ay) => {
    const response = await api.get(`/menus/${yil}/${ay}`);
    return response.data;
};

export const createMenu = async (data) => {
    const response = await api.post('/menus', data);
    return response.data;
};

export const deleteMenu = async (id) => {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
};

export const createMenusBatch = async (data) => {
    const response = await api.post('/menus/batch', data);
    return response.data;
};

export const updateMenu = async (id, data) => {
    const response = await api.put(`/menus/${id}`, data);
    return response.data;
};
