import api from './api';
import { Model } from '../types/workflow.types';

export const modelApi = {
    // Get all models
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: Model[] }>('/models');
        return response.data.data;
    },

    // Get model by ID
    getById: async (id: string) => {
        const response = await api.get<{ success: boolean; data: Model }>(`/models/${id}`);
        return response.data.data;
    },
};
