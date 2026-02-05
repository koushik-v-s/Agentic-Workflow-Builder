import api from './api';
import { Workflow, WorkflowStep } from '../types/workflow.types';

export const workflowApi = {
    // Get all workflows
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: Workflow[] }>('/workflows');
        return response.data.data;
    },

    // Get workflow by ID
    getById: async (id: string) => {
        const response = await api.get<{ success: boolean; data: Workflow }>(`/workflows/${id}`);
        return response.data.data;
    },

    // Create workflow
    create: async (data: Partial<Workflow>) => {
        const response = await api.post<{ success: boolean; data: Workflow }>('/workflows', data);
        return response.data.data;
    },

    // Update workflow
    update: async (id: string, data: Partial<Workflow>) => {
        const response = await api.put<{ success: boolean; data: Workflow }>(`/workflows/${id}`, data);
        return response.data.data;
    },

    // Delete workflow
    delete: async (id: string) => {
        await api.delete(`/workflows/${id}`);
    },

    // Duplicate workflow
    duplicate: async (id: string) => {
        const response = await api.post<{ success: boolean; data: Workflow }>(`/workflows/${id}/duplicate`);
        return response.data.data;
    },

    // Create step
    createStep: async (workflowId: string, data: Partial<WorkflowStep>) => {
        const response = await api.post<{ success: boolean; data: WorkflowStep }>(
            `/workflows/${workflowId}/steps`,
            data
        );
        return response.data.data;
    },

    // Update step
    updateStep: async (workflowId: string, stepId: string, data: Partial<WorkflowStep>) => {
        const response = await api.put<{ success: boolean; data: WorkflowStep }>(
            `/workflows/${workflowId}/steps/${stepId}`,
            data
        );
        return response.data.data;
    },

    // Delete step
    deleteStep: async (workflowId: string, stepId: string) => {
        await api.delete(`/workflows/${workflowId}/steps/${stepId}`);
    },

    // Reorder steps
    reorderSteps: async (workflowId: string, stepOrders: Array<{ id: string; order: number }>) => {
        const response = await api.put<{ success: boolean; data: WorkflowStep[] }>(
            `/workflows/${workflowId}/steps/reorder`,
            { stepOrders }
        );
        return response.data.data;
    },
};
